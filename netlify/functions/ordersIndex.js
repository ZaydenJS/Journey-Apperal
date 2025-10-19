import {
  createShopifyClient,
  handleGraphQLResponse,
  createApiResponse,
  createErrorResponse,
} from "./utils/shopify.js";

function getTokenFromCookie(cookieHeader) {
  if (!cookieHeader) return null;
  const parts = String(cookieHeader).split(/;\s*/);
  for (const p of parts)
    if (p.startsWith("ja_customer_token="))
      return decodeURIComponent(p.split("=")[1] || "");
  return null;
}

function normalizeOrders(edges) {
  const arr = Array.isArray(edges) ? edges : [];
  return arr.map(({ node }) => {
    const n = node || {};
    const total =
      n.totalPriceSet?.presentmentMoney || n.totalPriceSet?.shopMoney || null;
    return {
      id: n.id,
      name: n.name,
      orderNumber: n.orderNumber,
      date: n.processedAt,
      financialStatus: n.financialStatus,
      fulfillmentStatus: n.fulfillmentStatus,
      total,
      statusUrl: n.statusUrl || null,
      items: (n.lineItems?.edges || []).map((e) => e.node) || [],
    };
  });
}

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return createApiResponse({}, 200);
  if (event.httpMethod !== "GET")
    return createErrorResponse("Method not allowed", 405);

  const token = getTokenFromCookie(
    event.headers.cookie || event.headers.Cookie
  );
  if (!token) return createErrorResponse("Unauthorized", 401);

  const params = event.queryStringParameters || {};
  const limit = Math.max(
    1,
    Math.min(50, parseInt(params.limit || params.first || "10", 10))
  );
  const debug = String(params.debug || "").trim() === "1";

  const mode = (
    process.env.SHOPIFY_CUSTOMER_ACCOUNTS_MODE || "classic"
  ).toLowerCase();

  try {
    if (mode !== "classic") {
      // Placeholder: for New Customer Accounts, use Customer Account API with OAuth and tokens scoped per customer
      return createErrorResponse(
        "Orders endpoint not implemented for new customer accounts. Set SHOPIFY_CUSTOMER_ACCOUNTS_MODE=classic or enable Customer Account API OAuth.",
        501
      );
    }

    const client = createShopifyClient();
    const query = `
      query Orders($token: String!, $first: Int!) {
        customer(customerAccessToken: $token) {
          id
          email
          orders(first: $first, sortKey: PROCESSED_AT, reverse: true) {
            edges {
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
                  edges { node { title quantity variant { title sku } } }
                }
              }
            }
            pageInfo { hasNextPage hasPreviousPage endCursor startCursor }
          }
        }
      }
    `;

    const resp = await client.request(query, {
      variables: { token, first: limit },
    });
    const data = handleGraphQLResponse(resp);
    const customer = data.customer || null;
    const ordersConn = customer?.orders || null;

    const orders = ordersConn ? normalizeOrders(ordersConn.edges) : [];

    // Sort defensively by processedAt desc in case reverse flag is ignored
    orders.sort((a, b) => {
      const da = a.date ? new Date(a.date).getTime() : 0;
      const db = b.date ? new Date(b.date).getTime() : 0;
      return db - da;
    });

    try {
      console.log("ordersIndex:", {
        mode,
        tokenPresent: !!token,
        email: customer?.email || null,
        count: orders.length,
      });
    } catch (_) {}

    const payload = {
      orders,
      pageInfo: ordersConn ? ordersConn.pageInfo : null,
    };
    if (debug)
      payload.__debug = {
        customer: { id: customer?.id || null, email: customer?.email || null },
        mode,
      };

    return createApiResponse(payload, 200);
  } catch (err) {
    try {
      console.error("ordersIndex error:", err?.message || err);
    } catch (_) {}
    const status = /Unauthorized|token/i.test(String(err?.message || ""))
      ? 401
      : 500;
    return createErrorResponse(err.message || "Failed to load orders", status);
  }
};
