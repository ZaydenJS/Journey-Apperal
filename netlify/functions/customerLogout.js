import { createShopifyClient, handleGraphQLResponse, createApiResponse, createErrorResponse } from "./utils/shopify.js";

const clearCookieHeader = () => {
  const expires = new Date(0).toUTCString();
  return `ja_customer_token=; Path=/; HttpOnly; Secure; SameSite=Lax; Expires=${expires}`;
};

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

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    const res = createApiResponse({}, 200);
    res.headers["Set-Cookie"] = clearCookieHeader();
    return res;
  }
  if (event.httpMethod !== "POST") {
    return createErrorResponse("Method not allowed", 405);
  }

  try {
    const token = getTokenFromCookie(event.headers.cookie || event.headers.Cookie);
    if (token) {
      const client = createShopifyClient();
      const mutation = `
        mutation Logout($token: String!) {
          customerAccessTokenDelete(customerAccessToken: $token) {
            deletedAccessToken
            userErrors { message }
          }
        }
      `;
      try {
        const resp = await client.request(mutation, { variables: { token } });
        handleGraphQLResponse(resp);
      } catch (_) { /* swallow */ }
    }

    const res = createApiResponse({ ok: true }, 200);
    res.headers["Set-Cookie"] = clearCookieHeader();
    return res;
  } catch (err) {
    const res = createErrorResponse(err.message || "Logout failed", 500);
    res.headers["Set-Cookie"] = clearCookieHeader();
    return res;
  }
};

