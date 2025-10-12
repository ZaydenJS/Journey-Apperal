import crypto from "crypto";

const WEBHOOK_HEADER = "shopify-hmac-sha256";

export const handler = async (event) => {
  // CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, shopify-hmac-sha256",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  const body = event.body || "";
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET || "";
  const sig = event.headers[WEBHOOK_HEADER] || event.headers[WEBHOOK_HEADER.toUpperCase()] || "";

  // Verify HMAC when secret is provided; otherwise accept (dev)
  if (secret) {
    try {
      const digest = crypto
        .createHmac("sha256", secret)
        .update(Buffer.from(body, event.isBase64Encoded ? "base64" : "utf8"))
        .digest("base64");
      if (digest !== sig) {
        return { statusCode: 401, body: "Invalid signature" };
      }
    } catch (_) {
      // proceed in dev
    }
  }

  // Fire-and-forget warm of search index; ignore result
  try {
    await fetch("/.netlify/functions/search?warm=1", { method: "GET", headers: { Accept: "application/json" } });
  } catch (_) {}

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({ ok: true }),
  };
};

