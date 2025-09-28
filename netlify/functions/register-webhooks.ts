// Netlify Function: register-webhooks (manual invoke)
// Idempotently upserts orders/create and refunds/create webhooks pointing to this site's functions.

import type { Handler } from "@netlify/functions";

const ADMIN_API_VERSION = "2024-07";

function requiredEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

async function adminREST(path: string, init?: RequestInit): Promise<any> {
  const domain = requiredEnv("SHOPIFY_STORE_DOMAIN");
  const token = requiredEnv("SHOP_ADMIN_TOKEN");
  const url = `https://${domain}/admin/api/${ADMIN_API_VERSION}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token,
      ...(init && init.headers ? (init.headers as any) : {}),
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`REST ${path} -> ${res.status} ${JSON.stringify(json)}`);
  return json;
}

async function upsert(topic: string, address: string) {
  // List existing
  const list = await adminREST(`/webhooks.json?topic=${encodeURIComponent(topic)}`);
  const existing = (list.webhooks || []).find((w: any) => (w.topic === topic && w.address === address) || w.topic === topic);
  if (existing) {
    if (existing.address !== address) {
      const updated = await adminREST(`/webhooks/${existing.id}.json`, {
        method: "PUT",
        body: JSON.stringify({ webhook: { id: existing.id, address } }),
      });
      return updated.webhook;
    }
    return existing;
  }
  const created = await adminREST(`/webhooks.json`, {
    method: "POST",
    body: JSON.stringify({ webhook: { topic, address, format: "json" } }),
  });
  return created.webhook;
}

export const handler: Handler = async () => {
  const domain = requiredEnv("PUBLIC_SITE_DOMAIN");
  const base = `https://${domain}/.netlify/functions`;
  const ordersAddr = `${base}/webhook-orders-create`;
  const refundsAddr = `${base}/webhook-refunds-create`;

  const ordersHook = await upsert("orders/create", ordersAddr);
  const refundsHook = await upsert("refunds/create", refundsAddr);

  const payload = { ok: true, orders: { id: ordersHook.id, address: ordersHook.address }, refunds: { id: refundsHook.id, address: refundsHook.address } };
  console.log("Registered webhooks:", payload);
  return { statusCode: 200, headers: { "content-type": "application/json" }, body: JSON.stringify(payload, null, 2) } as any;
};

