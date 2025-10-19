import {
  createShopifyClient,
  handleGraphQLResponse,
  createApiResponse,
  createErrorResponse,
} from "./utils/shopify.js";

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

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return createApiResponse({}, 200);
  }
  if (event.httpMethod !== "GET") {
    return createErrorResponse("Method not allowed", 405);
  }

  const token = getTokenFromCookie(
    event.headers.cookie || event.headers.Cookie
  );
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
      res.headers["Set-Cookie"] = clearCookieHeader(
        event.headers.host || event.headers.Host
      );
      return res;
    }

    return createApiResponse({ customer }, 200);
  } catch (err) {
    const res = createErrorResponse("Unauthorized", 401);
    res.headers["Set-Cookie"] = clearCookieHeader(
      event.headers.host || event.headers.Host
    );
    return res;
  }
};
