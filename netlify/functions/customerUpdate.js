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
    const { firstName, lastName, phone } = body;
    const customer = {};
    if (typeof firstName === "string") customer.firstName = firstName;
    if (typeof lastName === "string") customer.lastName = lastName;
    if (typeof phone === "string") customer.phone = phone;

    const client = createShopifyClient();
    const mutation = `
      mutation UpdateCustomer($token: String!, $customer: CustomerUpdateInput!) {
        customerUpdate(customerAccessToken: $token, customer: $customer) {
          customer { id email firstName lastName phone }
          userErrors { message field code }
        }
      }
    `;
    const resp = await client.request(mutation, { variables: { token, customer } });
    const data = handleGraphQLResponse(resp).customerUpdate;
    if (data.userErrors?.length) return createErrorResponse(data.userErrors[0].message, 400);
    return createApiResponse({ ok: true, customer: data.customer }, 200);
  } catch (err) {
    return createErrorResponse(err.message || "Failed to update profile", 500);
  }
};

