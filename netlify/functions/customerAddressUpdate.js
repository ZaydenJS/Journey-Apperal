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
    const { id, address } = body;
    if (!id || !address) return createErrorResponse("Missing id or address", 400);
    const client = createShopifyClient();
    const mutation = `
      mutation AddressUpdate($token: String!, $id: ID!, $address: MailingAddressInput!) {
        customerAddressUpdate(customerAccessToken: $token, id: $id, address: $address) {
          customerAddress { id }
          userErrors { message field code }
        }
      }
    `;
    const resp = await client.request(mutation, { variables: { token, id, address } });
    const data = handleGraphQLResponse(resp).customerAddressUpdate;
    if (data.userErrors?.length) return createErrorResponse(data.userErrors[0].message, 400);
    return createApiResponse({ ok: true, addressId: data.customerAddress?.id || null }, 200);
  } catch (err) {
    return createErrorResponse(err.message || "Failed to update address", 500);
  }
};

