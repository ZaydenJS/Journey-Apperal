import {
  createShopifyClient,
  PRODUCT_FRAGMENT,
  COLLECTION_FRAGMENT,
  handleGraphQLResponse,
  createApiResponse,
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
    const {
      handle,
      tag,
      first = 20,
      after,
    } = event.queryStringParameters || {};

    if (!handle) {
      return createErrorResponse("Collection handle is required", 400);
    }

    const client = createShopifyClient();

    // Build the query based on whether we're filtering by tag
    let query;
    let variables;

    if (tag) {
      // Query products by tag across the store (Storefront API does not support filtering
      // collection.products by query). We also fetch the collection itself for metadata.
      query = `
        query GetProductsByTag($handle: String!, $tag: String!, $first: Int!, $after: String) {
          collection(handle: $handle) {
            ...CollectionFragment
          }
          products(first: $first, after: $after, query: $tag) {
            pageInfo {
              hasNextPage
              hasPreviousPage
              startCursor
              endCursor
            }
            edges {
              cursor
              node {
                ...ProductFragment
              }
            }
          }
        }
        ${COLLECTION_FRAGMENT}
        ${PRODUCT_FRAGMENT}
      `;
      variables = { handle, tag: `tag:${tag}`, first: parseInt(first), after };
    } else {
      // Query all products in a collection
      query = `
        query GetCollection($handle: String!, $first: Int!, $after: String) {
          collection(handle: $handle) {
            ...CollectionFragment
            products(first: $first, after: $after) {
              pageInfo {
                hasNextPage
                hasPreviousPage
                startCursor
                endCursor
              }
              edges {
                cursor
                node {
                  ...ProductFragment
                }
              }
            }
          }
        }
        ${COLLECTION_FRAGMENT}
        ${PRODUCT_FRAGMENT}
      `;
      variables = { handle, first: parseInt(first), after };
    }

    const response = await client.request(query, { variables });
    const data = handleGraphQLResponse(response);

    if (!data.collection) {
      return createErrorResponse("Collection not found", 404);
    }

    // Transform the data to match your frontend expectations
    const collection = {
      id: data.collection.id,
      handle: data.collection.handle,
      title: data.collection.title,
      description: data.collection.description,
      image: data.collection.image,
      seo: data.collection.seo,
    };

    const productEdges =
      data.collection &&
      data.collection.products &&
      data.collection.products.edges
        ? data.collection.products.edges
        : data.products && data.products.edges
        ? data.products.edges
        : [];

    const products = productEdges.map((edge) => ({
      id: edge.node.id,
      handle: edge.node.handle,
      title: edge.node.title,
      description: edge.node.description,
      tags: edge.node.tags,
      vendor: edge.node.vendor,
      productType: edge.node.productType,
      availableForSale: edge.node.availableForSale,
      totalInventory: edge.node.totalInventory,
      priceRange: edge.node.priceRange,
      compareAtPriceRange: edge.node.compareAtPriceRange,
      images: edge.node.images.edges.map((imgEdge) => imgEdge.node),
      variants: edge.node.variants.edges.map((varEdge) => varEdge.node),
      options: edge.node.options,
      seo: edge.node.seo,
      slug: edge.node.handle, // For compatibility with your existing frontend
    }));

    return createApiResponse({
      collection,
      products,
      pageInfo:
        data.collection &&
        data.collection.products &&
        data.collection.products.pageInfo
          ? data.collection.products.pageInfo
          : data.products
          ? data.products.pageInfo
          : null,
      total: products.length,
    });
  } catch (error) {
    return createErrorResponse(error.message);
  }
};
