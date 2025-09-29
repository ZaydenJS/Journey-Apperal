import type { Handler } from "@netlify/functions";

// Netlify Function: product-variants
// Returns product options and variants (id, availableForSale, quantityAvailable, selectedOptions)
// Env: SHOPIFY_STORE_DOMAIN, SHOPIFY_STOREFRONT_TOKEN

const STOREFRONT_API_VERSION = "2024-01"; // keep consistent with existing utils

function jsonResponse(body: any, statusCode = 200, origin?: string) {
  const allowOrigin = origin || "*";
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": allowOrigin,
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      Vary: "Origin",
    },
    body: JSON.stringify(body),
  };
}

function requiredEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

export const handler: Handler = async (event) => {
  // CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return jsonResponse({}, 200, event.headers?.origin);
  }

  if (event.httpMethod !== "GET") {
    return jsonResponse({ error: "Method not allowed" }, 405, event.headers?.origin);
  }

  try {
    const handle = event.queryStringParameters?.handle;
    if (!handle) {
      return jsonResponse({ error: "Missing product handle" }, 400, event.headers?.origin);
    }

    const storeDomain = requiredEnv("SHOPIFY_STORE_DOMAIN");
    const token = requiredEnv("SHOPIFY_STOREFRONT_TOKEN");

    const url = `https://${storeDomain}/api/${STOREFRONT_API_VERSION}/graphql.json`;

    const query = /* GraphQL */ `#graphql
      query ProductVariants($handle: String!) {
        productByHandle(handle: $handle) {
          title
          options { name values }
          variants(first: 250) {
            edges {
              node {
                id
                availableForSale
                quantityAvailable
                selectedOptions { name value }
              }
            }
          }
        }
      }
    `;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": token,
      },
      body: JSON.stringify({ query, variables: { handle } }),
    });

    const json = await res.json();

    if (!res.ok || json.errors) {
      const msg = json.errors?.[0]?.message || `HTTP ${res.status}`;
      return jsonResponse({ error: msg }, 500, event.headers?.origin);
    }

    const product = json?.data?.productByHandle;
    if (!product) {
      return jsonResponse({ error: "Product not found" }, 404, event.headers?.origin);
    }

    const options = (product.options || []).map((o: any) => ({
      name: o.name,
      values: o.values,
    }));

    const variants = (product.variants?.edges || []).map((e: any) => e.node).map((v: any) => ({
      id: v.id,
      availableForSale: !!v.availableForSale,
      quantityAvailable: typeof v.quantityAvailable === "number" ? v.quantityAvailable : null,
      selectedOptions: (v.selectedOptions || []).map((so: any) => ({ name: so.name, value: so.value })),
    }));

    return jsonResponse({ ok: true, options, variants }, 200, event.headers?.origin);
  } catch (err: any) {
    return jsonResponse({ error: err?.message || "Internal error" }, 500, event.headers?.origin);
  }
};

