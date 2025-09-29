import { 
  createShopifyClient, 
  CART_FRAGMENT,
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
    const { id } = event.queryStringParameters || {};
    if (!id) {
      return createErrorResponse('cart id is required', 400);
    }

    const client = createShopifyClient();

    const query = `
      query CartQuery($id: ID!) {
        cart(id: $id) {
          ...CartFragment
        }
      }
      ${CART_FRAGMENT}
    `;

    const variables = { id };

    const response = await client.request(query, { variables });
    const data = handleGraphQLResponse(response);

    if (!data.cart) {
      return createErrorResponse('Cart not found', 404);
    }

    const cart = data.cart;
    const transformedCart = {
      id: cart.id,
      checkoutUrl: cart.checkoutUrl,
      totalQuantity: cart.totalQuantity,
      cost: cart.cost,
      lines: cart.lines.edges.map(edge => ({
        id: edge.node.id,
        quantity: edge.node.quantity,
        cost: edge.node.cost,
        merchandise: edge.node.merchandise
      })),
      attributes: cart.attributes
    };

    return createApiResponse({ cart: transformedCart });
  } catch (error) {
    return createErrorResponse(error.message);
  }
};

