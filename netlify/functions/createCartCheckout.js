import { createShopifyClient, handleGraphQLResponse, createApiResponse, createErrorResponse } from "./utils/shopify.js";

function getTokenFromCookie(cookieHeader) {
  if (!cookieHeader) return null;
  const parts = String(cookieHeader).split(/;\s*/);
  for (const p of parts) if (p.startsWith("ja_customer_token=")) return decodeURIComponent(p.split("=")[1] || "");
  return null;
}

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return createApiResponse({}, 200);
  if (event.httpMethod !== "POST") return createErrorResponse("Method not allowed", 405);

  const token = getTokenFromCookie(event.headers.cookie || event.headers.Cookie);

  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const rawLines = Array.isArray(body.lines) ? body.lines : [];
    // Sanitize/shape lines for Storefront API
    const lines = rawLines
      .filter((l) => l && l.variantGid && Number(l.quantity) > 0)
      .map((l) => ({ merchandiseId: String(l.variantGid), quantity: Math.max(1, Number(l.quantity)) }));

    if (!lines.length) return createErrorResponse("Cart is empty", 400);

    const client = createShopifyClient();
    const mutation = `
      mutation CartCreateWithBuyer($lines: [CartLineInput!], $buyer: CartBuyerIdentityInput) {
        cartCreate(input: { lines: $lines, buyerIdentity: $buyer }) {
          cart { id checkoutUrl }
          userErrors { field message }
        }
      }
    `;

    const vars = { lines, buyer: token ? { customerAccessToken: token } : null };
    const resp = await client.request(mutation, { variables: vars });
    const crt = handleGraphQLResponse(resp).cartCreate;
    const errs = crt.userErrors || [];
    if (errs.length) {
      const msg = errs.map((e) => e.message).join(", ") || "Failed to start checkout";
      return createErrorResponse(msg, 400);
    }

    const checkoutUrl = crt.cart?.checkoutUrl || "";
    if (!checkoutUrl) return createErrorResponse("Checkout unavailable", 500);

    return createApiResponse({ ok: true, checkoutUrl, cartId: crt.cart?.id || null }, 200);
  } catch (err) {
    return createErrorResponse(err.message || "Failed to create checkout", 500);
  }
};

