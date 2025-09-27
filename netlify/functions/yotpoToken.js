import crypto from "crypto";

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json; charset=utf-8",
};

function ok(body, status = 200) {
  return { statusCode: status, headers, body: JSON.stringify(body) };
}
function err(message, status = 400) {
  return ok({ error: message }, status);
}

// Generates Yotpo Loyalty customer identification token
// Spec: token = SHA256(sortedConcat([email, YOTPO_LOYALTY_API_KEY]))
export const handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return ok({ ok: true }, 200);
  }
  if (event.httpMethod !== "POST") {
    return err("Method not allowed", 405);
  }
  try {
    if (!event.body) return err("Request body is required", 400);
    const { email, customerId, tags } = JSON.parse(event.body);
    if (!email) return err("Email is required", 400);

    const apiKey =
      process.env.YOTPO_API_KEY || process.env.YOTPO_LOYALTY_API_KEY;
    if (!apiKey) {
      return err("Missing YOTPO_API_KEY env var", 500);
    }

    // Most Yotpo Loyalty sites expect token = sha256(email + apiKey)
    const message = String(email).trim() + String(apiKey).trim();
    const token = crypto.createHash("sha256").update(message).digest("hex");

    return ok({
      token,
      email,
      customerId: customerId || null,
      tags: tags || null,
    });
  } catch (e) {
    return err(e.message || "Failed to generate token", 500);
  }
};
