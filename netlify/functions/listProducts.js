import {
  createShopifyClient,
  PRODUCT_FRAGMENT,
  handleGraphQLResponse,
  createCachedApiResponse,
  createErrorResponse,
} from "./utils/shopify.js";

export const handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return createCachedApiResponse({}, 200, 60);
  }

  if (event.httpMethod !== "GET") {
    return createErrorResponse("Method not allowed", 405);
  }

  try {
    const qs = event.queryStringParameters || {};
    const tag = qs.tag || null;
    const first = Math.min(250, parseInt(qs.first || "100", 10) || 100);
    const after = qs.after || null;

    const client = createShopifyClient();

    const query = `
      query ListProducts($first: Int!, $after: String, $query: String) {
        products(first: $first, after: $after, query: $query) {
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
          }
          edges {
            cursor
            node { ...ProductFragment }
          }
        }
      }
      ${PRODUCT_FRAGMENT}
    `;

    const variables = {
      first,
      after,
      query: tag ? `tag:${tag}` : null,
    };

    const response = await client.request(query, { variables });
    const data = handleGraphQLResponse(response);

    const edges = (data.products && data.products.edges) || [];
    const products = edges.map((edge) => ({
      id: edge.node.id,
      handle: edge.node.handle,
      title: edge.node.title,
      description: edge.node.description,
      descriptionHtml: edge.node.descriptionHtml,
      tags: edge.node.tags,
      vendor: edge.node.vendor,
      productType: edge.node.productType,
      availableForSale: edge.node.availableForSale,
      totalInventory: edge.node.totalInventory,
      priceRange: edge.node.priceRange,
      compareAtPriceRange: edge.node.compareAtPriceRange,
      images: (edge.node.images?.edges || []).map((imgEdge) => imgEdge.node),
      variants: (edge.node.variants?.edges || []).map((varEdge) => varEdge.node),
      options: edge.node.options,
      seo: edge.node.seo,
      slug: edge.node.handle,
    }));

    return createCachedApiResponse(
      {
        products,
        pageInfo: data.products ? data.products.pageInfo : null,
        total: products.length,
      },
      200,
      180
    );
  } catch (error) {
    return createErrorResponse(error.message);
  }
};

