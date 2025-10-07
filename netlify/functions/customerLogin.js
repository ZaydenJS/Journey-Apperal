import { createShopifyClient, handleGraphQLResponse, createApiResponse, createErrorResponse } from "./utils/shopify.js";

function setCookieHeader(token, expiresAt) {
  try {
    const expires = new Date(expiresAt).toUTCString();
    return `ja_customer_token=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Expires=${expires}`;
  } catch (_) {
    // Fallback: 24h
    const expires = new Date(Date.now() + 24*60*60*1000).toUTCString();
    return `ja_customer_token=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Expires=${expires}`;
  }
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
    const { email, password } = body;
    if (!email || !password) return createErrorResponse("Email and password are required", 400);

    const client = createShopifyClient();

    const tokenMutation = `
      mutation CustomerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
        customerAccessTokenCreate(input: $input) {
          customerAccessToken { accessToken expiresAt }
          customerUserErrors { code field message }
        }
      }
    `;

    const tokenResp = await client.request(tokenMutation, { variables: { input: { email, password } } });
    const tokenData = handleGraphQLResponse(tokenResp).customerAccessTokenCreate;
    const errs = tokenData.customerUserErrors || [];
    if (!tokenData.customerAccessToken || errs.length) {
      const msg = errs[0]?.message || "Invalid email or password";
      return createErrorResponse(msg, 401);
    }

    const token = tokenData.customerAccessToken.accessToken;
    const expiresAt = tokenData.customerAccessToken.expiresAt;

    const meQuery = `
      query GetMe($token: String!) {
        customer(customerAccessToken: $token) {
          id email firstName lastName phone acceptsMarketing
          defaultAddress { id address1 address2 city province zip country }
        }
      }
    `;
    const meResp = await client.request(meQuery, { variables: { token } });
    const meData = handleGraphQLResponse(meResp);
    const customer = meData.customer || null;

    const res = createApiResponse({ ok: true, customer }, 200);
    res.headers["Set-Cookie"] = setCookieHeader(token, expiresAt);
    return res;
  } catch (err) {
    return createErrorResponse(err.message || "Login failed", 500);
  }
};

