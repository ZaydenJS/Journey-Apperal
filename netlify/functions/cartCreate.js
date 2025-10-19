import {
  createShopifyClient,
  handleGraphQLResponse,
  createApiResponse,
  createErrorResponse,
} from "./utils/shopify.js";

function getTokenFromCookie(cookieHeader) {
  if (!cookieHeader) return null;
  const parts = String(cookieHeader).split(/;\s*/);
  for (const p of parts) {
    if (p.startsWith("ja_customer_token=")) {
      return decodeURIComponent(p.split("=")[1] || "");
    }
  }
  return null;
}

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return createApiResponse({}, 200);
  }
  if (event.httpMethod !== "POST") {
    return createErrorResponse("Method not allowed", 405);
  }

  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const inputLines = Array.isArray(body.lines) ? body.lines : [];
    const lines = inputLines
      .filter((l) => l && l.variantGid && Number(l.quantity) > 0)
      .map((l) => ({
        merchandiseId: l.variantGid,
        quantity: Math.max(1, Number(l.quantity)),
      }));

    if (!lines.length) {
      return createErrorResponse("No cart lines provided", 400);
    }

    const token = getTokenFromCookie(event.headers.cookie || event.headers.Cookie);

    const variables = { input: { lines } };
    if (token) {
      variables.input.buyerIdentity = { customerAccessToken: token };
    }

    const client = createShopifyClient();
    const mutation = `
      mutation CartCreate($input: CartInput!) {
        cartCreate(input: $input) {
          cart { id checkoutUrl }
          userErrors { field message }
        }
      }
    `;

    const resp = await client.request(mutation, { variables });
    const data = handleGraphQLResponse(resp).cartCreate;

    const errs = data.userErrors || [];
    if (errs.length) {
      const msg = errs[0]?.message || "Cart creation failed";
      return createErrorResponse(msg, 400);
    }

    const cart = data.cart;
    if (!cart || !cart.checkoutUrl) {
      return createErrorResponse("Checkout unavailable", 500);
    }

    return createApiResponse({ cart }, 200);
  } catch (err) {
    return createErrorResponse(err.message || "Cart create failed", 500);
  }
};

