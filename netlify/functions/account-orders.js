// Netlify Function: account-orders
// Returns a short list of recent orders for the signed-in user.
// Production integration requires Shopify Customer Account API OAuth.
// Until configured, this function can run in MOCK mode.

function mockOrders() {
  return [
    {
      name: "#1012",
      processedAt: "2025-03-12T17:24:00Z",
      financialStatus: "paid",
      fulfillmentStatus: "fulfilled",
      totalPrice: { amount: "58.00", currencyCode: "USD" },
      statusUrl: "https://shopify.com/94836293942/account/orders/1012",
    },
    {
      name: "#1009",
      processedAt: "2025-02-04T09:11:00Z",
      financialStatus: "paid",
      fulfillmentStatus: "partial",
      totalPrice: { amount: "112.00", currencyCode: "USD" },
      statusUrl: "https://shopify.com/94836293942/account/orders/1009",
    },
  ];
}

export async function handler(event, context) {
  const headers = {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET, OPTIONS",
  };
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers };
  }

  const limit = Math.max(1, Math.min(10, parseInt((event.queryStringParameters || {}).limit || "5", 10)));
  const { MOCK_ACCOUNT } = process.env;

  if (MOCK_ACCOUNT === "1" || MOCK_ACCOUNT === "true") {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ orders: mockOrders().slice(0, limit) }),
    };
  }

  return {
    statusCode: 501,
    headers,
    body: JSON.stringify({
      error: "Not Implemented",
      message:
        "Configure Customer Account API OAuth. Set MOCK_ACCOUNT=1 in Netlify to enable mock orders for development.",
    }),
  };
}

