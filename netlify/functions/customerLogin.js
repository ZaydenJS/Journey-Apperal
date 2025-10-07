import { createShopifyClient, handleGraphQLResponse, createApiResponse, createErrorResponse } from "./utils/shopify.js";

const setSessionCookie = (token, expiresAt) => {
  const expires = new Date(expiresAt);
  const cookie = `ja_customer_token=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Expires=${expires.toUTCString()}`;
  return cookie;
};

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return createApiResponse({}, 200);
  }
  if (event.httpMethod !== "POST") {
    return createErrorResponse("Method not allowed", 405);
  }

  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const { email, password } = body;
    if (!email || !password) {
      return createErrorResponse("Email and password are required", 400);
    }

    const client = createShopifyClient();

    const loginMutation = `
      mutation Login($input: CustomerAccessTokenCreateInput!) {
        customerAccessTokenCreate(input: $input) {
          customerAccessToken { accessToken, expiresAt }
          userErrors { message, field, code }
        }
      }
    `;

    const loginResp = await client.request(loginMutation, {
      variables: { input: { email, password } },
    });
    const loginData = handleGraphQLResponse(loginResp);
    const payload = loginData.customerAccessTokenCreate;

    if (!payload || payload.userErrors?.length) {
      const msg = payload?.userErrors?.[0]?.message || "Invalid email or password";
      return createErrorResponse(msg, 401);
    }

    const { accessToken, expiresAt } = payload.customerAccessToken;

    const meQuery = `
      query GetCustomer($token: String!) {
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

    const meResp = await client.request(meQuery, { variables: { token: accessToken } });
    const meData = handleGraphQLResponse(meResp);
    const customer = meData.customer;

    if (!customer) {
      return createErrorResponse("Failed to retrieve customer", 401);
    }

    const res = createApiResponse({
      token: { accessToken, expiresAt },
      customer,
    });
    res.headers["Set-Cookie"] = setSessionCookie(accessToken, expiresAt);
    return res;
  } catch (err) {
    return createErrorResponse(err.message || "Login failed", 500);
  }
};

