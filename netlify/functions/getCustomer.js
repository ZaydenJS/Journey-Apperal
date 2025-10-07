import { createShopifyClient, handleGraphQLResponse, createApiResponse, createErrorResponse } from "./utils/shopify.js";

function getTokenFromCookie(cookieHeader) {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(/;\s*/);
  for (const p of parts) {
    if (p.startsWith("ja_customer_token=")) {
      return decodeURIComponent(p.split("=")[1] || "");
    }
  }
  return null;
}

const clearCookieHeader = () => {
  const expires = new Date(0).toUTCString();
  return `ja_customer_token=; Path=/; HttpOnly; Secure; SameSite=Lax; Expires=${expires}`;
};

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return createApiResponse({}, 200);
  }
  if (event.httpMethod !== "GET") {
    return createErrorResponse("Method not allowed", 405);
  }

  const token = getTokenFromCookie(event.headers.cookie || event.headers.Cookie);
  if (!token) {
    return createErrorResponse("Unauthorized", 401);
  }

  try {
    const client = createShopifyClient();
    const query = `
      query GetMe($token: String!) {
        customer(customerAccessToken: $token) {
          id
          email
          firstName
          lastName
          phone
          acceptsMarketing
          defaultAddress { id address1 address2 city province zip country }
        }
      }
    `;
    const resp = await client.request(query, { variables: { token } });
    const data = handleGraphQLResponse(resp);
    const customer = data.customer;

    if (!customer) {
      const res = createErrorResponse("Unauthorized", 401);
      res.headers["Set-Cookie"] = clearCookieHeader();
      return res;
    }

    return createApiResponse({ customer }, 200);
  } catch (err) {
    const res = createErrorResponse("Unauthorized", 401);
    res.headers["Set-Cookie"] = clearCookieHeader();
    return res;
  }
};

