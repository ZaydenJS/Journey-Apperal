import {
  createShopifyClient,
  handleGraphQLResponse,
  createApiResponse,
  createErrorResponse,
} from "./utils/shopify.js";

function makeDomainAttr(host) {
  try {
    const h = String(host || "")
      .split(":")[0]
      .toLowerCase();
    if (!h) return "";
    if (h === "journeys.para.com" || h.endsWith(".journeys.para.com"))
      return "Domain=.journeys.para.com; ";
    if (h === "journeysapparel.com" || h.endsWith(".journeysapparel.com"))
      return "Domain=.journeysapparel.com; ";
    const parts = h.split(".");
    if (parts.length >= 2) {
      const base = parts.slice(-2).join(".");
      return `Domain=.${base}; `;
    }
    return "";
  } catch (_) {
    return "";
  }
}

const clearCookieHeader = (host) => {
  const expires = new Date(0).toUTCString();
  const domainAttr = makeDomainAttr(host);
  return `ja_customer_token=; ${domainAttr}Path=/; HttpOnly; Secure; SameSite=Lax; Expires=${expires}`;
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
