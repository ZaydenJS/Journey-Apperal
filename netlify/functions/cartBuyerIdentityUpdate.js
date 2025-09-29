import { 
  createShopifyClient,
  CART_FRAGMENT,
  handleGraphQLResponse,
  createApiResponse,
  createErrorResponse,
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

    const { cartId, buyerIdentity } = JSON.parse(event.body);

    if (!cartId || !buyerIdentity || typeof buyerIdentity !== 'object') {
      return createErrorResponse('cartId and buyerIdentity are required', 400);
    }

    const client = createShopifyClient();

    const mutation = `
      mutation CartBuyerIdentityUpdate($cartId: ID!, $buyerIdentity: CartBuyerIdentityInput!) {
        cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
          cart { ...CartFragment }
          userErrors { field message }
        }
      }
      ${CART_FRAGMENT}
    `;

    const variables = { cartId, buyerIdentity };

    const response = await client.request(mutation, { variables });
    const data = handleGraphQLResponse(response);

    const errs = data.cartBuyerIdentityUpdate?.userErrors || [];
    if (errs.length > 0) {
      return createErrorResponse(`Buyer identity update failed: ${errs[0].message}`, 400);
    }

    const cart = data.cartBuyerIdentityUpdate.cart;
    const transformedCart = {
      id: cart.id,
      checkoutUrl: cart.checkoutUrl,
      totalQuantity: cart.totalQuantity,
      cost: cart.cost,
      lines: cart.lines.edges.map((edge) => ({
        id: edge.node.id,
        quantity: edge.node.quantity,
        cost: edge.node.cost,
        merchandise: edge.node.merchandise,
      })),
      attributes: cart.attributes,
    };

    return createApiResponse({ cart: transformedCart });
  } catch (error) {
    return createErrorResponse(error.message);
  }
};

