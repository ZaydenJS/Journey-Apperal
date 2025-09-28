// Netlify Function: account-me
// Returns basic customer profile for the signed-in user.
// Production integration requires Shopify Customer Account API OAuth.
// Until configured, this function can run in MOCK mode.

export async function handler(event, context) {
  // CORS (simple)
  const headers = {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET, OPTIONS",
  };
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers };
  }

  const { MOCK_ACCOUNT } = process.env;
  if (MOCK_ACCOUNT === "1" || MOCK_ACCOUNT === "true") {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        email: "customer@example.com",
        first_name: "Alex",
        last_name: "Journey",
        id: "gid://shopify/Customer/1234567890",
      }),
    };
  }

  // Not configured yet: return 501 with a short message.
  return {
    statusCode: 501,
    headers,
    body: JSON.stringify({
      error: "Not Implemented",
      message:
        "Configure Shopify Customer Account API OAuth and set env vars. Set MOCK_ACCOUNT=1 in Netlify to return mock data during development.",
    }),
  };
}

