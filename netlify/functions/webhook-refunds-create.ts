// Netlify Function: webhook-refunds-create (POST)
// Topic: refunds/create
// Verifies HMAC, sums refunded amount, subtracts points from the customer metafield.

import type { Handler } from "@netlify/functions";
import { verifyWebhookHmac, toCustomerGID, metafieldGet, metafieldSet, envNs, envKey } from "./_lib/shopify";

export const handler: Handler = async (event) => {
  const headers = { "content-type": "application/json; charset=utf-8" };
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers } as any;
  if (event.httpMethod !== "POST") return { statusCode: 405, headers, body: JSON.stringify({ error: "Method Not Allowed" }) } as any;

  const hmac = event.headers["x-shopify-hmac-sha256"] || event.headers["X-Shopify-Hmac-Sha256"];
  const raw = event.body || "";
  if (!verifyWebhookHmac(raw, String(hmac || ""))) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: "Invalid HMAC" }) } as any;
  }

  let payload: any = {};
  try { payload = JSON.parse(raw); } catch {}

  const refund = payload?.refund || payload; // depending on the webhook serializer

  // Sum refunded amount from transactions of kind == "refund"
  let refunded = 0;
  if (Array.isArray(refund?.transactions)) {
    for (const t of refund.transactions) {
      if (t?.kind === "refund" && t?.amount) {
        const v = parseFloat(String(t.amount));
        if (Number.isFinite(v)) refunded += v;
      }
    }
  } else if (refund?.order_adjustments?.length) {
    // fallback: not perfect but captures adjustments
    for (const adj of refund.order_adjustments) {
      const v = parseFloat(String(adj?.amount || 0));
      if (Number.isFinite(v)) refunded += v;
    }
  }

  const refundPts = Math.max(0, Math.floor(refunded));

  const gid = toCustomerGID(refund?.order?.customer) || toCustomerGID(refund?.order?.customer?.id);
  if (!gid) {
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true, deducted: 0, reason: "no customer" }) } as any;
  }

  const ns = envNs();
  const key = envKey();
  const current = await metafieldGet(gid, ns, key);
  const next = Math.max(0, current - refundPts);
  await metafieldSet(gid, ns, key, next);

  return { statusCode: 200, headers, body: JSON.stringify({ ok: true, deducted: refundPts, newTotal: next }) } as any;
};

