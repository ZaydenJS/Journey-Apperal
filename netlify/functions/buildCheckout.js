import {
  createShopifyClient,
  handleGraphQLResponse,
  createApiResponse,
  createErrorResponse,
} from "./utils/shopify.js";

function getTokenFromCookie(cookieHeader) {
  if (!cookieHeader) return null;
  const parts = String(cookieHeader).split(/;\s*/);
  for (const p of parts)
    if (p.startsWith("ja_customer_token="))
      return decodeURIComponent(p.split("=")[1] || "");
  return null;
}

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return createApiResponse({}, 200);
  if (event.httpMethod !== "POST")
    return createErrorResponse("Method not allowed", 405);

  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const linesIn = Array.isArray(body.lines) ? body.lines : [];

    // Validate and normalize lines
    const lines = linesIn
      .filter(
        (l) => l && typeof l.variantGid === "string" && Number(l.quantity) > 0
      )
      .map((l) => ({
        merchandiseId: String(l.variantGid),
        quantity: Math.max(1, Number(l.quantity)),
      }));

    if (!lines.length) return createErrorResponse("No items in cart", 400);

    const token = getTokenFromCookie(
      event.headers.cookie || event.headers.Cookie
    );

    const client = createShopifyClient();

    const CART_CREATE = `
      mutation CartCreate($input: CartInput!) {
        cartCreate(input: $input) {
          cart { id checkoutUrl }
          userErrors { field message }
        }
      }
    `;

    const input = { lines };
    if (token) {
      input.buyerIdentity = { customerAccessToken: token };
    }

    const resp = await client.request(CART_CREATE, { variables: { input } });
    const data = handleGraphQLResponse(resp).cartCreate;

    if (data.userErrors && data.userErrors.length) {
      const msg =
        data.userErrors.map((e) => e.message).join(", ") ||
        "Failed to create checkout";
      return createErrorResponse(msg, 400);
    }

    const cart = data.cart;
    if (!cart || !cart.checkoutUrl)
      return createErrorResponse("Checkout unavailable", 502);

    // Include a small diagnostic flag so we can confirm whether a customer token was present server-side
    const hadToken = Boolean(token && String(token).length > 0);
    return createApiResponse(
      { checkoutUrl: cart.checkoutUrl, cartId: cart.id, associated: hadToken },
      200
    );
  } catch (err) {
    return createErrorResponse(err.message || "Failed to build checkout", 500);
  }
};
