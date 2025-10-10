import {
  createShopifyClient,
  COLLECTION_FRAGMENT,
  handleGraphQLResponse,
  createApiResponse,
  createCachedApiResponse,
  createErrorResponse,
} from "./utils/shopify.js";

export const handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return createApiResponse({}, 200);
  }

  if (event.httpMethod !== "GET") {
    return createErrorResponse("Method not allowed", 405);
  }

  try {
    const client = createShopifyClient();

    const query = `
      query GetCollections($first: Int!) {
        collections(first: $first) {
          edges {
            node {
              ...CollectionFragment
              products(first: 1) {
                edges {
                  node {
                    id
                  }
                }
              }
            }
          }
        }
      }
      ${COLLECTION_FRAGMENT}
    `;

    const variables = {
      first: 20,
    };

    const response = await client.request(query, { variables });
    const data = handleGraphQLResponse(response);

    // Transform the data to match your frontend expectations
    const collections = data.collections.edges.map((edge) => ({
      id: edge.node.id,
      handle: edge.node.handle,
      title: edge.node.title,
      description: edge.node.description,
      image: edge.node.image,
      seo: edge.node.seo,
      productCount: edge.node.products.edges.length,
    }));

    return createCachedApiResponse(
      {
        collections,
        total: collections.length,
      },
      200,
      300
    );
  } catch (error) {
    return createErrorResponse(error.message);
  }
};
