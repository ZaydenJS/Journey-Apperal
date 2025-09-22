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

  if (event.httpMethod !== 'POST') {
    return createErrorResponse('Method not allowed', 405);
  }

  try {
    if (!event.body) {
      return createErrorResponse('Request body is required', 400);
    }

    const { cartId, lines } = JSON.parse(event.body);
    
    if (!cartId || !lines || !Array.isArray(lines) || lines.length === 0) {
      return createErrorResponse('cartId and lines array are required', 400);
    }

    const client = createShopifyClient();
    
    const query = `
      mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
        cartLinesAdd(cartId: $cartId, lines: $lines) {
          cart {
            ...CartFragment
          }
          userErrors {
            field
            message
          }
        }
      }
      ${CART_FRAGMENT}
    `;

    // Transform lines to match Shopify's expected format
    const cartLines = lines.map(line => ({
      merchandiseId: line.merchandiseId,
      quantity: line.quantity,
      attributes: line.attributes || []
    }));

    const variables = { 
      cartId, 
      lines: cartLines 
    };

    const response = await client.request(query, { variables });
    const data = handleGraphQLResponse(response);

    if (data.cartLinesAdd.userErrors && data.cartLinesAdd.userErrors.length > 0) {
      return createErrorResponse(
        `Add to cart failed: ${data.cartLinesAdd.userErrors[0].message}`, 
        400
      );
    }

    // Transform the cart data
    const cart = data.cartLinesAdd.cart;
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
