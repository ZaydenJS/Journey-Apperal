import { createShopifyClient, handleGraphQLResponse, createApiResponse, createErrorResponse } from "./utils/shopify.js";

const setSessionCookie = (token, expiresAt) => {
  const expires = new Date(expiresAt);
  return `ja_customer_token=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Expires=${expires.toUTCString()}`;
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
    const { resetUrl, password, id, resetToken } = body;

    const client = createShopifyClient();

    let data;
    if (resetUrl && password) {
      const mutation = `
        mutation ResetByUrl($resetUrl: URL!, $password: String!) {
          customerResetByUrl(resetUrl: $resetUrl, password: $password) {
            customer { id email }
            customerAccessToken { accessToken expiresAt }
            userErrors { message field code }
          }
        }
      `;
      const resp = await client.request(mutation, { variables: { resetUrl, password } });
      data = handleGraphQLResponse(resp).customerResetByUrl;
    } else if (id && resetToken && password) {
      const mutation = `
        mutation Reset($id: ID!, $input: CustomerResetInput!) {
          customerReset(id: $id, input: $input) {
            customer { id email }
            customerAccessToken { accessToken expiresAt }
            userErrors { message field code }
          }
        }
      `;
      const resp = await client.request(mutation, { variables: { id, input: { resetToken, password } } });
      data = handleGraphQLResponse(resp).customerReset;
    } else {
      return createErrorResponse("Missing parameters", 400);
    }

    if (!data || data.userErrors?.length) {
      return createErrorResponse(data?.userErrors?.[0]?.message || "Reset failed", 400);
    }

    const tok = data.customerAccessToken;
    const res = createApiResponse({ ok: true, token: tok, customer: data.customer }, 200);
    if (tok?.accessToken && tok?.expiresAt) {
      res.headers["Set-Cookie"] = setSessionCookie(tok.accessToken, tok.expiresAt);
    }
    return res;
  } catch (err) {
    return createErrorResponse(err.message || "Reset failed", 500);
  }
};

