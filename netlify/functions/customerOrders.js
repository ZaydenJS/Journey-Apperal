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
  const debug = String(params.debug || "").trim() === "1";

  try {
    const client = createShopifyClient();
    const query = `
      query Orders($token: String!, $first: Int!, $after: String) {
        customer(customerAccessToken: $token) {
          id
          email
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
      variables: { token, first, after },
    });
    const data = handleGraphQLResponse(resp);
    const ordersConn = data.customer?.orders;
    if (!ordersConn) {
      try {
        console.log(
          "customerOrders: tokenPresent=",
          !!token,
          "customer=",
          data.customer ? data.customer.email : null,
          "orders=0 (no conn)"
        );
      } catch (_) {}
      return createErrorResponse("No orders", 200);
    }

    const orders = ordersConn.edges.map(({ node }) => ({
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
    }));

    try {
      console.log(
        "customerOrders: tokenPresent=",
        !!token,
        "orders=",
        orders.length
      );
    } catch (_) {}

    const payload = { orders, pageInfo: ordersConn.pageInfo };
    if (debug)
      payload.__debug = {
        customer: {
          id: data.customer?.id || null,
          email: data.customer?.email || null,
        },
      };
    return createApiResponse(payload, 200);
  } catch (err) {
    try {
      console.error("customerOrders error:", err?.message || err);
    } catch (_) {}
    return createErrorResponse(err.message || "Failed to load orders", 500);
  }
};
