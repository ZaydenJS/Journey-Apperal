import { createShopifyClient, handleGraphQLResponse, createApiResponse, createErrorResponse } from "./utils/shopify.js";

function getTokenFromCookie(cookieHeader) {
  if (!cookieHeader) return null;
  const parts = String(cookieHeader).split(/;\s*/);
  for (const p of parts) if (p.startsWith("ja_customer_token=")) return decodeURIComponent(p.split("=")[1] || "");
  return null;
}

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return createApiResponse({}, 200);
  if (event.httpMethod !== "GET") return createErrorResponse("Method not allowed", 405);
  const token = getTokenFromCookie(event.headers.cookie || event.headers.Cookie);
  if (!token) return createErrorResponse("Unauthorized", 401);

  try {
    const client = createShopifyClient();
    const query = `
      query Addresses($token: String!) {
        customer(customerAccessToken: $token) {
          id
          defaultAddress { id }
          addresses(first: 100) {
            edges { node {
              id firstName lastName company address1 address2 city province zip country phone
            } }
          }
        }
      }
    `;
    const resp = await client.request(query, { variables: { token } });
    const data = handleGraphQLResponse(resp);
    const c = data.customer;
    const addresses = (c?.addresses?.edges || []).map(e => e.node);
    const defaultAddressId = c?.defaultAddress?.id || null;
    return createApiResponse({ addresses, defaultAddressId }, 200);
  } catch (err) {
    return createErrorResponse(err.message || "Failed to load addresses", 500);
  }
};

