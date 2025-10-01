import type { Handler } from "@netlify/functions";
import { storefrontRequest } from "./utils/shopify.js";

const CART_CREATE_MUTATION = /* GraphQL */ `#graphql
mutation CartCreate($lines: [CartLineInput!]!) {
  cartCreate(input: { lines: $lines }) {
    cart { id checkoutUrl }
    userErrors { field message }
  }
}`;

function parseLines(event: Parameters<Handler>[0]): Array<{ quantity: number; merchandiseId: string }> {
  const method = (event.httpMethod || "GET").toUpperCase();
  let raw: any = undefined;

  if (method === "GET") {
    raw = event.queryStringParameters?.lines;
  } else {
    const ct = String(event.headers["content-type"] || event.headers["Content-Type"] || "").toLowerCase();
    const body = event.body || "";
    if (ct.includes("application/json")) {
      try {
        const json = JSON.parse(body);
        raw = (json && (json.lines ?? json)) as any;
      } catch (_) {
        raw = undefined;
      }
    } else if (ct.includes("application/x-www-form-urlencoded")) {
      const params = new URLSearchParams(body);
      raw = params.get("lines");
    } else {
      // try JSON by default
      try {
        const json = JSON.parse(body);
        raw = (json && (json.lines ?? json)) as any;
      } catch (_) {
        const params = new URLSearchParams(body || "");
        raw = params.get("lines");
      }
    }
  }

  // If raw is a string, parse JSON
  if (typeof raw === "string") {
    try {
      raw = JSON.parse(raw);
    } catch (_) {
      raw = undefined;
    }
  }

  const lines = Array.isArray(raw) ? raw : [];
  // Validate shape quickly
  return lines
    .filter((l) => l && typeof l.merchandiseId === "string" && Number(l.quantity) > 0)
    .map((l) => ({ merchandiseId: l.merchandiseId, quantity: Number(l.quantity) }));
}

export const handler: Handler = async (event) => {
  try {
    if (event.httpMethod !== "GET" && event.httpMethod !== "POST") {
      return { statusCode: 405, headers: { Allow: "GET, POST" }, body: "" };
    }

    const lines = parseLines(event);
    if (!lines.length) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "No lines provided" }),
      };
    }

    const { data, errors } = await storefrontRequest(CART_CREATE_MUTATION, { lines });
    if (errors && errors.length) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ errors }),
      };
    }

    const userErrors = data?.cartCreate?.userErrors || [];
    const checkoutUrl: string | undefined = data?.cartCreate?.cart?.checkoutUrl;

    if (userErrors.length || !checkoutUrl) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userErrors, checkoutUrl: checkoutUrl || null }),
      };
    }

    // Debug log visible in Netlify function logs
    console.log("CHECKOUT_DEBUG server final →", checkoutUrl);

    // 302 redirect to Shopify checkout (no modifications)
    return {
      statusCode: 302,
      headers: {
        Location: checkoutUrl,
        // Avoid caching this redirect
        "Cache-Control": "no-store",
      },
      body: "",
    };
  } catch (err: any) {
    console.error("Checkout endpoint failed:", err?.message || err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};

