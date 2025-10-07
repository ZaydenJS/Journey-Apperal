import { createShopifyClient, handleGraphQLResponse, createApiResponse, createErrorResponse } from "./utils/shopify.js";

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return createApiResponse({}, 200);
  }
  if (event.httpMethod !== "POST") {
    return createErrorResponse("Method not allowed", 405);
  }

  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const { email } = body;
    if (!email) return createErrorResponse("Email is required", 400);

    const client = createShopifyClient();
    const mutation = `
      mutation Recover($email: String!) {
        customerRecover(email: $email) {
          userErrors { message field code }
        }
      }
    `;
    const resp = await client.request(mutation, { variables: { email } });
    const data = handleGraphQLResponse(resp);
    const errs = data.customerRecover?.userErrors || [];
    if (errs.length) {
      return createErrorResponse(errs[0].message || "Could not send reset email", 400);
    }
    return createApiResponse({ ok: true });
  } catch (err) {
    return createErrorResponse(err.message || "Recover failed", 500);
  }
};

