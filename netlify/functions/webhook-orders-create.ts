// Netlify Function: webhook-orders-create (POST)
// Topic: orders/create
// Verifies HMAC, calculates points, updates customer metafield.

import type { Handler } from "@netlify/functions";
import { verifyWebhookHmac, toCustomerGID, metafieldGet, metafieldSet, envNs, envKey, earnRate } from "./_lib/shopify";

export const handler: Handler = async (event) => {
  const headers = {
    "content-type": "application/json; charset=utf-8",
  };
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers } as any;
  if (event.httpMethod !== "POST") return { statusCode: 405, headers, body: JSON.stringify({ error: "Method Not Allowed" }) } as any;

  const hmac = event.headers["x-shopify-hmac-sha256"] || event.headers["X-Shopify-Hmac-Sha256"];
  const raw = event.body || "";
  if (!verifyWebhookHmac(raw, String(hmac || ""))) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: "Invalid HMAC" }) } as any;
  }

  let order: any = {};
  try { order = JSON.parse(raw); } catch {}

  // Ignore tests, drafts, cancelled orders
  if (order?.test || order?.cancelled_at) {
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true, ignored: true, reason: "test/cancelled" }) } as any;
  }

  // Compute points: floor(order total) * earnRate
  const totalStr = order?.current_total_price_set?.shop_money?.amount || order?.total_price || "0";
  const total = Math.max(0, Math.floor(parseFloat(String(totalStr) || "0")));
  const pts = Math.max(0, Math.floor(total * earnRate()));

  const gid = toCustomerGID(order?.customer) || toCustomerGID(order?.customer?.id);
  if (!gid) {
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true, added: 0, reason: "no customer" }) } as any;
  }

  const ns = envNs();
  const key = envKey();
  const current = await metafieldGet(gid, ns, key);
  const next = Math.max(0, current + pts);
  await metafieldSet(gid, ns, key, next);

  return { statusCode: 200, headers, body: JSON.stringify({ ok: true, added: pts, newTotal: next }) } as any;
};

