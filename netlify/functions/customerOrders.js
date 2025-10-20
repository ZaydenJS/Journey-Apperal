import {
  createShopifyClient,
  createShopifyAdminRequester,
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

  try {
    const client = createShopifyClient();
    const query = `
      query Orders($token: String!, $first: Int!, $after: String) {
        customer(customerAccessToken: $token) {
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
                  edges { node {
                    title
                    quantity
                    variant {
                      id
                      title
                      sku
                      selectedOptions { name value }
                      image { url altText width height }
                    }
                  } }
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
    const email = data.customer?.email || null;

    if (!ordersConn) return createErrorResponse("No orders", 200);

    let orders = (ordersConn.edges || []).map(({ node }) => ({
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

    // Fallback: if Storefront returns no orders (e.g., guest checkout), try Admin API by email
    if ((!orders || orders.length === 0) && email) {
      const adminRequest = createShopifyAdminRequester();
      if (adminRequest) {
        const adminQuery = `
          query OrdersByEmail($first: Int!, $after: String, $q: String!) {
            orders(first: $first, after: $after, reverse: true, query: $q) {
              edges {
                cursor
                node {
                  id
                  number
                  name
                  processedAt
                  displayFinancialStatus
                  displayFulfillmentStatus
                  totalPriceSet { shopMoney { amount currencyCode } }
                  statusPageUrl
                  lineItems(first: 50) {
                    edges { node {
                      name
                      quantity
                      sku
                      variant { id title selectedOptions { name value } }
                    } }
                  }
                }
              }
              pageInfo { hasNextPage hasPreviousPage endCursor startCursor }
            }
          }
        `;
        const q = `email:${email}`;
        const adminResp = await adminRequest(adminQuery, { first, after, q });
        const adminData = handleGraphQLResponse(adminResp);
        const adminConn = adminData.orders;
        if (adminConn) {
          orders = (adminConn.edges || []).map(({ node }) => ({
            id: node.id,
            name: node.name,
            orderNumber: node.number, // Admin uses `number` (Int)
            date: node.processedAt,
            financialStatus: node.displayFinancialStatus,
            fulfillmentStatus: node.displayFulfillmentStatus,
            total: node.totalPriceSet?.shopMoney || null,
            statusUrl: node.statusPageUrl || null,
            items:
              (node.lineItems?.edges || []).map((e) => ({
                title: e.node.name,
                quantity: e.node.quantity,
                variant: e.node.variant || null,
                sku: e.node.sku || null,
              })) || [],
          }));
          return createApiResponse(
            { orders, pageInfo: adminConn.pageInfo },
            200
          );
        }
      }
    }

    return createApiResponse({ orders, pageInfo: ordersConn.pageInfo }, 200);
  } catch (err) {
    return createErrorResponse(err.message || "Failed to load orders", 500);
  }
};
