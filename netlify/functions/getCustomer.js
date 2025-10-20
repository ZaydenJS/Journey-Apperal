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
    const res = createErrorResponse("Unauthorized", 401);
    res.headers["X-Auth-Reason"] = "no-cookie";
    return res;
  }

  try {
    const client = createShopifyClient();
    const QUERY = `
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
    const RENEW = `
      mutation Renew($customerAccessToken: String!) {
        customerAccessTokenRenew(customerAccessToken: $customerAccessToken) {
          customerAccessToken { accessToken expiresAt }
          userErrors { field message }
        }
      }
    `;

    async function getMe(tok) {
      const resp = await client.request(QUERY, { variables: { token: tok } });
      return handleGraphQLResponse(resp);
    }

    let data = await getMe(token);
    if (!data || !data.customer) {
      // Attempt token renewal once
      try {
        const renewResp = await client.request(RENEW, {
          variables: { customerAccessToken: token },
        });
        const renewData =
          handleGraphQLResponse(renewResp).customerAccessTokenRenew;
        const newTok = renewData?.customerAccessToken?.accessToken || null;
        const newExp = renewData?.customerAccessToken?.expiresAt || null;
        if (newTok && newExp) {
          data = await getMe(newTok);
          if (data && data.customer) {
            const res = createApiResponse({ customer: data.customer }, 200);
            const expires = new Date(newExp).toUTCString();
            const domainAttr = cookieDomainFromHost(
              event.headers.host || event.headers.Host
            );
            res.headers["Set-Cookie"] = `ja_customer_token=${encodeURIComponent(
              newTok
            )}; Path=/; HttpOnly; Secure; SameSite=Lax; Expires=${expires}${domainAttr}`;
            return res;
          }
        }
      } catch (_) {}
    }

    const customer = data.customer;
    if (!customer) {
      const res = createErrorResponse("Unauthorized", 401);
      // Do not clear cookie here; let caller decide. Include reason for diagnostics.
      res.headers["X-Auth-Reason"] = "invalid-or-expired-token";
      return res;
    }

    return createApiResponse({ customer }, 200);
  } catch (err) {
    const res = createErrorResponse("Unauthorized", 401);
    // Do not clear cookie on transient error; include reason for debugging
    res.headers["X-Auth-Reason"] = "error";
    return res;
  }
};
