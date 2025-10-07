import { createShopifyClient, handleGraphQLResponse, createApiResponse, createErrorResponse } from "./utils/shopify.js";

function getTokenFromCookie(cookieHeader) {
  if (!cookieHeader) return null;
  const parts = String(cookieHeader).split(/;\s*/);
  for (const p of parts) if (p.startsWith("ja_customer_token=")) return decodeURIComponent(p.split("=")[1] || "");
  return null;
}

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return createApiResponse({}, 200);
  if (event.httpMethod !== "GET") return createErrorResponse("Method not allowed", 405);

  const token = getTokenFromCookie(event.headers.cookie || event.headers.Cookie);
  if (!token) return createErrorResponse("Unauthorized", 401);

  const params = event.queryStringParameters || {};
  let id = params.id || params.orderId || "";
  if (!id) return createErrorResponse("Missing id", 400);

  try {
    const client = createShopifyClient();

    async function fetchById(orderId) {
      const query = `
        query Order($token: String!, $id: ID!) {
          customer(customerAccessToken: $token) {
            order(id: $id) {
              id name orderNumber processedAt financialStatus fulfillmentStatus
              subtotalPriceSet { shopMoney { amount currencyCode } }
              totalDiscountsSet { shopMoney { amount currencyCode } }
              totalShippingPriceSet { shopMoney { amount currencyCode } }
              totalTaxSet { shopMoney { amount currencyCode } }
              totalPriceSet { shopMoney { amount currencyCode } }
              shippingAddress { firstName lastName address1 address2 city province zip country phone }
              billingAddress { firstName lastName address1 address2 city province zip country phone }
              shippingLines { title priceSet { shopMoney { amount currencyCode } } }
              lineItems(first: 250) {
                edges { node {
                  title quantity
                  originalTotalPrice { amount currencyCode }
                  discountAllocations { allocatedAmount { amount currencyCode } }
                  variant { title sku image { url } selectedOptions { name value } }
                } }
              }
              fulfillments { status trackingCompany trackingInfo { number url } }
            }
          }
        }
      `;
      const resp = await client.request(query, { variables: { token, id: orderId } });
      const data = handleGraphQLResponse(resp);
      return data.customer?.order || null;
    }

    // If id is not a gid, try to find it by scanning order pages until found
    if (!/^gid:/.test(id)) {
      let cursor = null; let found = null; let safety = 0;
      const listQuery = `
        query Orders($token: String!, $first: Int!, $after: String) {
          customer(customerAccessToken: $token) {
            orders(first: $first, after: $after, reverse: true) {
              edges { cursor node { id name orderNumber } }
              pageInfo { hasNextPage endCursor }
            }
          }
        }
      `;
      while (!found && safety++ < 50) {
        const resp = await client.request(listQuery, { variables: { token, first: 50, after: cursor } });
        const data = handleGraphQLResponse(resp);
        const edges = data.customer?.orders?.edges || [];
        for (const e of edges) {
          const n = e.node;
          if (n.id === id || n.name === id || String(n.orderNumber) === String(id)) { found = n; break; }
        }
        const pageInfo = data.customer?.orders?.pageInfo;
        if (!found && pageInfo?.hasNextPage) cursor = pageInfo.endCursor; else break;
      }
      if (found) id = found.id;
    }

    const order = await fetchById(id);
    if (!order) return createErrorResponse("Order not found", 404);

    return createApiResponse({ order }, 200);
  } catch (err) {
    return createErrorResponse(err.message || "Failed to load order", 500);
  }
};

