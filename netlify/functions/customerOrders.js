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

const clearCookieHeader = () => {
  const expires = new Date(0).toUTCString();
  return `ja_customer_token=; Path=/; HttpOnly; Secure; SameSite=Lax; Expires=${expires}`;
};

function unauthorizedResponse() {
  const res = createErrorResponse("Unauthorized", 401);
  res.headers["Set-Cookie"] = clearCookieHeader();
  return res;
}

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
  if (!token) return createErrorResponse("Unauthorized", 401);

  const params = event.queryStringParameters || {};
  const first = Math.max(1, Math.min(50, parseInt(params.first || "20", 10)));
  const after = params.after || null;

  try {
    const client = createShopifyClient();

    const ORDERS_QUERY = `
      query Orders($token: String!, $first: Int!, $after: String) {
        customer(customerAccessToken: $token) {
          orders(first: $first, after: $after, reverse: true) {
            edges {
              cursor
              node {
                id
                orderNumber
                name
                processedAt
                financialStatus
                fulfillmentStatus
                totalPriceSet {
                  presentmentMoney { amount currencyCode }
                  shopMoney { amount currencyCode }
                }
                statusUrl
                lineItems(first: 50) {
                  edges {
                    node {
                      title
                      quantity
                      variant { title sku image { url } }
                    }
                  }
                }
              }
            }
            pageInfo { hasNextPage hasPreviousPage endCursor startCursor }
          }
        }
      }
    `;

    const RENEW_MUTATION = `
      mutation Renew($customerAccessToken: String!) {
        customerAccessTokenRenew(customerAccessToken: $customerAccessToken) {
          customerAccessToken { accessToken expiresAt }
          userErrors { field message }
        }
      }
    `;

    // For Admin fallback: fetch customer email and then Admin orders by email
    const ME_QUERY = `
      query GetMe($token: String!) {
        customer(customerAccessToken: $token) { email }
      }
    `;

    const storeDomain =
      process.env.SHOPIFY_STOREFRONT_DOMAIN || process.env.SHOPIFY_STORE_DOMAIN;
    const adminToken =
      process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN ||
      process.env.SHOPIFY_ADMIN_TOKEN ||
      process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

    async function getCustomerEmail(tok) {
      try {
        const resp = await client.request(ME_QUERY, {
          variables: { token: tok },
        });
        const d = handleGraphQLResponse(resp);
        return d?.customer?.email || null;
      } catch (_) {
        return null;
      }
    }

    async function adminGraphQL(query, variables) {
      if (!storeDomain || !adminToken) return null;
      const url = `https://${storeDomain}/admin/api/2024-07/graphql.json`;
      const r = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": adminToken,
        },
        body: JSON.stringify({ query, variables }),
      });
      const json = await r.json().catch(() => ({}));
      if (!r.ok || json.errors) {
        console.error("Admin GraphQL error", json.errors || r.statusText);
        return null;
      }
      return json.data || null;
    }

    const ADMIN_ORDERS_QUERY = `
      query AdminOrders($q: String!, $first: Int!) {
        orders(first: $first, query: $q, sortKey: CREATED_AT, reverse: true) {
          edges {
            node {
              id
              name
              orderNumber
              processedAt
              displayFinancialStatus
              displayFulfillmentStatus
              currentTotalPriceSet { shopMoney { amount currencyCode } }
              statusUrl
              lineItems(first: 50) {
                edges {
                  node {
                    name
                    quantity
                    variant { title sku image { url } }
                  }
                }
              }
            }
          }
        }
      }
    `;

    async function fetchAdminOrdersByEmail(email, limit) {
      if (!email) return [];
      const data = await adminGraphQL(ADMIN_ORDERS_QUERY, {
        q: `email:${email}`,
        first: limit,
      });
      const conn = data?.orders;
      if (!conn) return [];
      return (conn.edges || []).map(({ node }) => ({
        id: node.id,
        name: node.name,
        orderNumber: node.orderNumber,
        date: node.processedAt,
        financialStatus: node.displayFinancialStatus,
        fulfillmentStatus: node.displayFulfillmentStatus,
        total: node.currentTotalPriceSet?.shopMoney || null,
        statusUrl: node.statusUrl || null,
        items:
          (node.lineItems?.edges || []).map((e) => ({
            title: e.node?.name || "",
            quantity: e.node?.quantity || 0,
            variant: {
              title: e.node?.variant?.title || "",
              sku: e.node?.variant?.sku || "",
              image: { url: e.node?.variant?.image?.url || "" },
            },
          })) || [],
      }));
    }

    async function fetchOrdersWith(tokenValue) {
      const resp = await client.request(ORDERS_QUERY, {
        variables: { token: tokenValue, first, after },
      });
      const data = handleGraphQLResponse(resp);
      return data;
    }

    let data = await fetchOrdersWith(token);
    if (!data || !data.customer) {
      // Try to renew an expired token and retry once
      try {
        const renewResp = await client.request(RENEW_MUTATION, {
          variables: { customerAccessToken: token },
        });
        const renewData =
          handleGraphQLResponse(renewResp).customerAccessTokenRenew;
        const newTok = renewData?.customerAccessToken?.accessToken || null;
        const newExp = renewData?.customerAccessToken?.expiresAt || null;
        if (newTok && newExp) {
          data = await fetchOrdersWith(newTok);
          const ordersConn = data.customer?.orders;
          let orders = ordersConn
            ? ordersConn.edges.map(({ node }) => ({
                id: node.id,
                name: node.name,
                orderNumber: node.orderNumber,
                date: node.processedAt,
                financialStatus: node.financialStatus,
                fulfillmentStatus: node.fulfillmentStatus,
                total:
                  node.totalPriceSet?.presentmentMoney ||
                  node.totalPriceSet?.shopMoney ||
                  null,
                statusUrl: node.statusUrl || null,
                items: (node.lineItems?.edges || []).map((e) => e.node) || [],
              }))
            : [];

          // Admin fallback if no orders found after renewal
          if ((!orders || orders.length === 0) && adminToken && storeDomain) {
            try {
              const email = await getCustomerEmail(newTok);
              const adminOrders = await fetchAdminOrdersByEmail(email, first);
              if (adminOrders && adminOrders.length) {
                orders = adminOrders;
                const res2 = createApiResponse({ orders, pageInfo: {} }, 200);
                const expires2 = new Date(newExp).toUTCString();
                res2.headers[
                  "Set-Cookie"
                ] = `ja_customer_token=${encodeURIComponent(
                  newTok
                )}; Path=/; HttpOnly; Secure; SameSite=Lax; Expires=${expires2}`;
                return res2;
              }
            } catch (_) {}
          }

          const res = createApiResponse(
            { orders, pageInfo: ordersConn?.pageInfo || {} },
            200
          );
          // Refresh cookie with renewed token
          const expires = new Date(newExp).toUTCString();
          res.headers["Set-Cookie"] = `ja_customer_token=${encodeURIComponent(
            newTok
          )}; Path=/; HttpOnly; Secure; SameSite=Lax; Expires=${expires}`;
          return res;
        }
      } catch (_) {}
      return unauthorizedResponse();
    }

    const ordersConn = data.customer?.orders;
    let orders = ordersConn
      ? ordersConn.edges.map(({ node }) => ({
          id: node.id,
          name: node.name,
          orderNumber: node.orderNumber,
          date: node.processedAt,
          financialStatus: node.financialStatus,
          fulfillmentStatus: node.fulfillmentStatus,
          total:
            node.totalPriceSet?.presentmentMoney ||
            node.totalPriceSet?.shopMoney ||
            null,
          statusUrl: node.statusUrl || null,
          items: (node.lineItems?.edges || []).map((e) => e.node) || [],
        }))
      : [];

    // Admin fallback if Storefront returns no orders
    if ((!orders || orders.length === 0) && adminToken && storeDomain) {
      try {
        const email = await getCustomerEmail(token);
        const adminOrders = await fetchAdminOrdersByEmail(email, first);
        if (adminOrders && adminOrders.length) {
          return createApiResponse({ orders: adminOrders, pageInfo: {} }, 200);
        }
      } catch (_) {}
    }

    return createApiResponse(
      { orders, pageInfo: ordersConn?.pageInfo || {} },
      200
    );
  } catch (err) {
    return createErrorResponse(err.message || "Failed to load orders", 500);
  }
};
