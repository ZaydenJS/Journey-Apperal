// Netlify Function: ensure-metafield (GET/POST)
// Ensures a customer metafield definition exists for loyalty points.

import type { Handler } from "@netlify/functions";
import { adminGraphQL, envNs, envKey } from "./_lib/shopify";

export const handler: Handler = async (event) => {
  const headers = { "content-type": "application/json; charset=utf-8" };
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers } as any;

  const ns = envNs();
  const key = envKey();

  // Check if exists
  const data1 = await adminGraphQL<{ metafieldDefinitions: { nodes: Array<{ id: string }> } }>(
    `#graphql
    query CheckDef($ownerType: MetafieldOwnerType!, $ns: String!, $key: String!) {
      metafieldDefinitions(ownerType: $ownerType, namespace: $ns, key: $key, first: 1) { nodes { id } }
    }`,
    { ownerType: "CUSTOMER", ns, key }
  );

  if (data1?.metafieldDefinitions?.nodes?.length) {
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true, existed: true, id: data1.metafieldDefinitions.nodes[0].id, namespace: ns, key }) } as any;
  }

  // Create definition
  const data2 = await adminGraphQL<{ metafieldDefinitionCreate: { createdDefinition: { id: string }, userErrors: any[] } }>(
    `#graphql
    mutation CreateDef($def: MetafieldDefinitionInput!) {
      metafieldDefinitionCreate(definition: $def) {
        createdDefinition { id }
        userErrors { field message }
      }
    }`,
    {
      def: {
        name: "Loyalty Points",
        key,
        namespace: ns,
        ownerType: "CUSTOMER",
        type: "number_integer",
        access: { admin: "MERCHANT_READ_WRITE", storefront: "PUBLIC_READ" },
        visibleToStorefrontApi: true,
      },
    }
  );

  const id = data2?.metafieldDefinitionCreate?.createdDefinition?.id;
  const errors = data2?.metafieldDefinitionCreate?.userErrors || [];
  if (errors.length) {
    return { statusCode: 500, headers, body: JSON.stringify({ ok: false, errors }) } as any;
  }

  return { statusCode: 200, headers, body: JSON.stringify({ ok: true, created: true, id, namespace: ns, key }) } as any;
};

