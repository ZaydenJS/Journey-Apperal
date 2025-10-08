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
  if (!token) return createErrorResponse("Unauthorized", 401);

  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const { cartId } = body;
    if (!cartId || typeof cartId !== "string") return createErrorResponse("Missing cartId", 400);

    const client = createShopifyClient();
    const mutation = `
      mutation CartBuyerIdentityAttach($cartId: ID!, $buyerIdentity: CartBuyerIdentityInput!) {
        cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
          cart { id buyerIdentity { customer { id } email phone } }
          userErrors { field message }
        }
      }
    `;

    const resp = await client.request(mutation, {
      variables: { cartId, buyerIdentity: { customerAccessToken: token } },
    });
    const data = handleGraphQLResponse(resp).cartBuyerIdentityUpdate;
    if (data.userErrors && data.userErrors.length) {
      const msg = data.userErrors.map((e) => e.message).join(", ") || "Failed to attach";
      return createErrorResponse(msg, 400);
    }

    return createApiResponse({ ok: true, cart: data.cart }, 200);
  } catch (err) {
    return createErrorResponse(err.message || "Failed to attach buyer to cart", 500);
  }
};

