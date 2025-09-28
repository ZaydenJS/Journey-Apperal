// Netlify Function: loyalty-points
// Returns a placeholder points balance. Replace with real metafield logic later.

export async function handler(event, context) {
  const headers = {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET, OPTIONS",
  };
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers };

  // Mock only for now.
  const balance = 250; // placeholder
  return { statusCode: 200, headers, body: JSON.stringify({ balance }) };
}

