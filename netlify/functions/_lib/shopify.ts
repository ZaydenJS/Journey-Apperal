// Shopify Admin helpers for Netlify Functions (TypeScript)
// Uses env: SHOP_ADMIN_TOKEN, SHOPIFY_STORE_DOMAIN, SHOP_API_SECRET

import crypto from "node:crypto";

const ADMIN_API_VERSION = "2024-07"; // adjust if needed

function requiredEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

export async function adminGraphQL<T = any>(query: string, variables?: any): Promise<T> {
  const domain = requiredEnv("SHOPIFY_STORE_DOMAIN");
  const token = requiredEnv("SHOP_ADMIN_TOKEN");
  const url = `https://${domain}/admin/api/${ADMIN_API_VERSION}/graphql.json`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (!res.ok || json.errors) {
    const msg = `Admin GraphQL error: ${res.status} ${JSON.stringify(json.errors || json)}`;
    throw new Error(msg);
  }
  return json.data as T;
}

export function toCustomerGID(input: any): string | null {
  if (!input) return null;
  if (typeof input === "string" && input.startsWith("gid://")) return input;
  if (typeof input === "number") return `gid://shopify/Customer/${input}`;
  if (typeof input === "object") {
    if (input.admin_graphql_api_id) return input.admin_graphql_api_id;
    if (input.id && typeof input.id === "number") return `gid://shopify/Customer/${input.id}`;
  }
  return null;
}

export async function metafieldGet(customerId: string, namespace: string, key: string): Promise<number> {
  const data = await adminGraphQL<{ customer: { metafield: { value: string | null } | null } }>(
    `#graphql
    query GetCustomerMetafield($id: ID!, $ns: String!, $key: String!) {
      customer(id: $id) { metafield(namespace: $ns, key: $key) { value } }
    }`,
    { id: customerId, ns: namespace, key }
  );
  const raw = data?.customer?.metafield?.value;
  const n = parseInt(raw || "0", 10);
  return Number.isFinite(n) ? n : 0;
}

export async function metafieldSet(customerId: string, namespace: string, key: string, intValue: number): Promise<void> {
  const value = Math.max(0, Math.floor(Number(intValue))).toString();
  const data = await adminGraphQL<{ metafieldsSet: { userErrors: Array<{ field: string[]; message: string }> } }>(
    `#graphql
    mutation SetCustomerMetafield($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) { userErrors { field message } }
    }`,
    {
      metafields: [
        {
          ownerId: customerId,
          namespace,
          key,
          type: "number_integer",
          value,
        },
      ],
    }
  );
  const errs = data?.metafieldsSet?.userErrors || [];
  if (errs.length) throw new Error(`metafieldsSet errors: ${JSON.stringify(errs)}`);
}

export function verifyWebhookHmac(rawBody: string, received?: string | null): boolean {
  if (!received) return false;
  const secret = requiredEnv("SHOP_API_SECRET");
  const digest = crypto.createHmac("sha256", secret).update(rawBody, "utf8").digest("base64");
  try {
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(received));
  } catch {
    return false;
  }
}

export function envNs(): string {
  return process.env["LOYALTY_NAMESPACE"] || "custom";
}
export function envKey(): string {
  return process.env["LOYALTY_POINTS_KEY"] || "loyalty_points";
}
export function earnRate(): number {
  const v = parseFloat(process.env["EARN_RATE_POINTS_PER_AUD"] || "1");
  return Number.isFinite(v) ? v : 1;
}

