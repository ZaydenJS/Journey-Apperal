import {
  storefrontRequest,
  createApiResponse,
  createErrorResponse,
} from "./utils/shopify.js";

export const handler = async (event, context) => {
  try {
    const urlParams = new URLSearchParams(event.queryStringParameters || {});
    const variantId = urlParams.get("variant") || process.env.KNOWN_VARIANT_ID;

    if (!variantId) {
      return createErrorResponse(
        "Missing variant id (query ?variant=gid://shopify/ProductVariant/...) or KNOWN_VARIANT_ID env",
        400
      );
    }

    const mutation = `
      mutation CartCreate($input: CartInput!) {
        cartCreate(input: $input) {
          cart { id checkoutUrl }
          userErrors { field message }
        }
      }
    `;

    const variables = {
      input: { lines: [{ merchandiseId: variantId, quantity: 1 }] },
    };
    const resp = await storefrontRequest(mutation, variables);

    if (resp.errors && resp.errors.length) {
      return createErrorResponse(
        `Storefront error: ${resp.errors[0].message}`,
        500
      );
    }

    const cart = resp.data?.cartCreate?.cart;
    const checkoutUrl = cart?.checkoutUrl;
    if (!checkoutUrl) {
      return createErrorResponse(
        "No checkoutUrl returned from cartCreate",
        500
      );
    }

    // Fetch the checkout HTML to ensure it is reachable (200) and looks like Shopify checkout
    const htmlRes = await fetch(checkoutUrl, { method: "GET" });
    const ok = htmlRes.ok;
    const text = await htmlRes.text();
    const marker = ok && /Shopify|checkout|Checkout/.test(text);

    const status = ok && marker ? "PASS" : "FAIL";
    const details = {
      status,
      checkoutUrl,
      httpStatus: htmlRes.status,
      marker: marker ? "found" : "missing",
    };

    return createApiResponse(details, ok && marker ? 200 : 500);
  } catch (e) {
    return createErrorResponse(e.message, 500);
  }
};
