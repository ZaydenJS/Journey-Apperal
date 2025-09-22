import { 
  createShopifyClient, 
  PRODUCT_FRAGMENT,
  handleGraphQLResponse, 
  createApiResponse, 
  createErrorResponse 
} from './utils/shopify.js';

export const handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return createApiResponse({}, 200);
  }

  if (event.httpMethod !== 'GET') {
    return createErrorResponse('Method not allowed', 405);
  }

  try {
    const { handle } = event.queryStringParameters || {};
    
    if (!handle) {
      return createErrorResponse('Product handle is required', 400);
    }

    const client = createShopifyClient();
    
    const query = `
      query GetProduct($handle: String!) {
        product(handle: $handle) {
          ...ProductFragment
        }
      }
      ${PRODUCT_FRAGMENT}
    `;

    const variables = { handle };

    const response = await client.request(query, { variables });
    const data = handleGraphQLResponse(response);

    if (!data.product) {
      return createErrorResponse('Product not found', 404);
    }

    // Transform the data to match your frontend expectations
    const product = {
      id: data.product.id,
      handle: data.product.handle,
      title: data.product.title,
      description: data.product.description,
      tags: data.product.tags,
      vendor: data.product.vendor,
      productType: data.product.productType,
      availableForSale: data.product.availableForSale,
      totalInventory: data.product.totalInventory,
      priceRange: data.product.priceRange,
      compareAtPriceRange: data.product.compareAtPriceRange,
      images: data.product.images.edges.map(edge => edge.node),
      variants: data.product.variants.edges.map(edge => edge.node),
      options: data.product.options,
      seo: data.product.seo,
      slug: data.product.handle // For compatibility with your existing frontend
    };

    return createApiResponse({ product });

  } catch (error) {
    return createErrorResponse(error.message);
  }
};
