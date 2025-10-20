import {
  createShopifyClient,
  handleGraphQLResponse,
  createApiResponse,
  createErrorResponse,
} from "./utils/shopify.js";

function cookieDomainFromHost(host) {
  try {
    const h = String(host || "")
      .split(":")[0]
      .toLowerCase();
    if (!h || h === "localhost" || /^(\d+\.){3}\d+$/.test(h)) return "";
    const base = h.replace(/^www\./, "");
    return `; Domain=.${base}`;
  } catch (_) {
    return "";
  }
}

const clearCookieHeader = (host) => {
  const expires = new Date(0).toUTCString();
  const domainAttr = cookieDomainFromHost(host);
  return `ja_customer_token=; Path=/; HttpOnly; Secure; SameSite=Lax; Expires=${expires}${domainAttr}`;
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
    res.headers["Set-Cookie"] = clearCookieHeader(
      event.headers.host || event.headers.Host
    );
    return res;
  }
  if (event.httpMethod !== "POST") {
    return createErrorResponse("Method not allowed", 405);
  }

  try {
    const token = getTokenFromCookie(
      event.headers.cookie || event.headers.Cookie
    );
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
      } catch (_) {
        /* swallow */
      }
    }

    const res = createApiResponse({ ok: true }, 200);
    res.headers["Set-Cookie"] = clearCookieHeader(
      event.headers.host || event.headers.Host
    );
    return res;
  } catch (err) {
    const res = createErrorResponse(err.message || "Logout failed", 500);
    res.headers["Set-Cookie"] = clearCookieHeader(
      event.headers.host || event.headers.Host
    );
    return res;
  }
};
