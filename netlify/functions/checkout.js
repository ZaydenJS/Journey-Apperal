// Netlify Function: One-shot Shopify checkout redirect
// Creates a fresh cart, adds provided lines, and returns a 302 redirect to checkoutUrl

import { createShopifyClient } from "./utils/shopify.js";

// Minimal cart fragment for retrieving checkoutUrl
const CART_FIELDS = `
  id
  checkoutUrl
`;

const CREATE_CART_MUTATION = `#graphql
mutation CreateCart($buyerIdentity: CartBuyerIdentityInput) {
  cartCreate(input: { buyerIdentity: $buyerIdentity }) {
    cart { ${CART_FIELDS} }
    userErrors { field message }
  }
}`;

const ADD_LINES_MUTATION = `#graphql
mutation AddLines($cartId: ID!, $lines: [CartLineInput!]!) {
  cartLinesAdd(cartId: $cartId, lines: $lines) {
    cart { ${CART_FIELDS} }
    userErrors { field message }
  }
}`;

export const handler = async (event) => {
  try {
    if (event.httpMethod === "OPTIONS") {
      return {
        statusCode: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      };
    }

    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Method Not Allowed" }),
      };
    }

    const body = JSON.parse(event.body || "{}");
    const countryCode = (body && body.countryCode) || "AU";
    const lines = Array.isArray(body && body.lines) ? body.lines : [];

    const client = createShopifyClient();

    // a) cartCreate
    const createRes = await client.request(CREATE_CART_MUTATION, {
      variables: { buyerIdentity: { countryCode } },
    });

    const createErrors = createRes?.cartCreate?.userErrors || [];
    if (createErrors.length > 0) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ errors: createErrors }),
      };
    }

    const cartId = createRes?.cartCreate?.cart?.id;
    if (!cartId) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "cartCreate returned no cart id" }),
      };
    }

    let checkoutUrl = createRes?.cartCreate?.cart?.checkoutUrl || null;

    // b) cartLinesAdd (only if lines provided)
    if (lines.length > 0) {
      const addRes = await client.request(ADD_LINES_MUTATION, {
        variables: { cartId, lines },
      });
      const addErrors = addRes?.cartLinesAdd?.userErrors || [];
      if (addErrors.length > 0) {
        return {
          statusCode: 400,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ errors: addErrors }),
        };
      }
      checkoutUrl = addRes?.cartLinesAdd?.cart?.checkoutUrl || checkoutUrl;
    }

    if (!checkoutUrl) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Missing checkoutUrl" }),
      };
    }

    // c) Return HTTP 302 redirect
    return {
      statusCode: 302,
      headers: {
        Location: checkoutUrl,
        "Cache-Control": "no-store",
        "Access-Control-Allow-Origin": "*",
      },
      body: "",
    };
  } catch (err) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: String((err && err.message) || err) }),
    };
  }
};
