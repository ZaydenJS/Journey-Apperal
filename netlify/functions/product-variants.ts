import {
  createShopifyClient,
  handleGraphQLResponse,
  createApiResponse,
  createCachedApiResponse,
  createErrorResponse,
} from "./utils/shopify.js";

export const handler = async (event, context) => {
  // CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return createApiResponse({}, 200);
  }

  if (event.httpMethod !== "GET") {
    return createErrorResponse("Method not allowed", 405);
  }

  try {
    const { handle } = event.queryStringParameters || {};
    if (!handle) {
      return createErrorResponse("Product handle is required", 400);
    }

    const client = createShopifyClient();

    const query = `#graphql
      query ProductVariants($handle: String!) {
        product(handle: $handle) {
          title
          options { name values }
          variants(first: 250) {
            edges { node {
              id
              availableForSale
              quantityAvailable
              selectedOptions { name value }
            } }
          }
        }
      }
    `;

    const variables = { handle };
    const response = await client.request(query, { variables });
    const data = handleGraphQLResponse(response);

    if (!data || !data.product) {
      return createErrorResponse("Product not found", 404);
    }

    const options = data.product.options || [];
    const variants = (data.product.variants?.edges || []).map(
      (e: any) => e.node
    );

    return createCachedApiResponse({ ok: true, options, variants }, 200, 90);
  } catch (error: any) {
    return createErrorResponse(error.message || "Unexpected error", 500);
  }
};
