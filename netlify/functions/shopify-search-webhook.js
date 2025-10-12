import crypto from "crypto";

const HMAC_HEADER = "x-shopify-hmac-sha256";
const TOPIC_HEADER = "x-shopify-topic";

export const handler = async (event) => {
  // CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "Content-Type, x-shopify-hmac-sha256, x-shopify-topic",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  const rawBody = event.body || "";
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET || "";
  const headers = event.headers || {};
  const sig =
    headers[HMAC_HEADER] ||
    headers[HMAC_HEADER.toLowerCase()] ||
    headers[HMAC_HEADER.toUpperCase()] ||
    "";
  const topic =
    headers[TOPIC_HEADER] ||
    headers[TOPIC_HEADER.toLowerCase()] ||
    headers[TOPIC_HEADER.toUpperCase()] ||
    "";

  // Verify HMAC (required in prod; tolerate empty in local/dev)
  if (secret) {
    const computed = crypto
      .createHmac("sha256", secret)
      .update(Buffer.from(rawBody, event.isBase64Encoded ? "base64" : "utf8"))
      .digest("base64");
    if (computed !== sig) {
      return { statusCode: 401, body: "Invalid signature" };
    }
  }

  // Parse payload and log
  let payload = {};
  try {
    payload =
      JSON.parse(
        event.isBase64Encoded
          ? Buffer.from(rawBody, "base64").toString("utf8")
          : rawBody
      ) || {};
  } catch (_) {}
  const productId = payload?.id || payload?.admin_graphql_api_id || "unknown";
  console.log(`[shopify-webhook] topic=${topic} productId=${productId}`);

  // Fire-and-forget warm: hit production domain directly with short timeout
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 1500);
    fetch("https://journeysapparel.com/.netlify/functions/search?warm=1", {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal,
    })
      .catch(() => {})
      .finally(() => clearTimeout(t));
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
