import { createShopifyClient, handleGraphQLResponse, createApiResponse, createErrorResponse } from "./utils/shopify.js";

function getTokenFromCookie(cookieHeader) {
  if (!cookieHeader) return null;
  const parts = String(cookieHeader).split(/;\s*/);
  for (const p of parts) if (p.startsWith("ja_customer_token=")) return decodeURIComponent(p.split("=")[1] || "");
  return null;
}

function normalizeLines(inputLines) {
  const byId = new Map();
  const arr = Array.isArray(inputLines) ? inputLines : [];
  for (const l of arr) {
    if (!l) continue;
    const gid = String(l.merchandiseId || l.variantGid || "");
    const qty = Math.max(1, Number(l.quantity || l.qty || 1));
    if (!gid.startsWith("gid://shopify/ProductVariant/")) continue;
    byId.set(gid, (byId.get(gid) || 0) + qty);
  }
  return Array.from(byId.entries()).map(([gid, quantity]) => ({ merchandiseId: gid, quantity }));
}

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return createApiResponse({}, 200);
  if (event.httpMethod !== "POST") return createErrorResponse("Method not allowed", 405);

  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const { lines: rawLines, discountCode } = body || {};
    const lines = normalizeLines(rawLines);
    if (!lines.length) return createErrorResponse("No items to checkout", 400);

    const client = createShopifyClient();
    const token = getTokenFromCookie(event.headers.cookie || event.headers.Cookie);

    const mutation = `
      mutation BeginCheckout($input: CartInput!) {
        cartCreate(input: $input) {
          cart { id checkoutUrl }
          userErrors { field message }
        }
      }
    `;

    const input = { lines };
    if (token) input.buyerIdentity = { customerAccessToken: token };

    const resp = await client.request(mutation, { variables: { input } });
    const data = handleGraphQLResponse(resp).cartCreate;
    const errs = data.userErrors || [];
    if (errs.length) return createErrorResponse(errs.map((e) => e.message).join(", ") || "Failed to create cart", 400);

    let checkoutUrl = data.cart?.checkoutUrl || "";
    if (!checkoutUrl) return createErrorResponse("Missing checkout URL", 500);

    // Optionally append discount code if provided
    try {
      if (discountCode && typeof discountCode === "string" && discountCode.trim()) {
        const sep = checkoutUrl.includes("?") ? "&" : "?";
        checkoutUrl += `${sep}discount=${encodeURIComponent(discountCode.trim())}`;
      }
    } catch (_) {}

    return createApiResponse({ ok: true, cart: data.cart, checkoutUrl }, 200);
  } catch (err) {
    return createErrorResponse(err.message || "Failed to begin checkout", 500);
  }
};

