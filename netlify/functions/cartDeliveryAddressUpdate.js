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

    const { cartId, deliveryAddress } = JSON.parse(event.body);

    if (!cartId || !deliveryAddress || typeof deliveryAddress !== 'object') {
      return createErrorResponse('cartId and deliveryAddress are required', 400);
    }

    const client = createShopifyClient();

    const mutation = `
      mutation CartDeliveryAddressUpdate($cartId: ID!, $deliveryAddress: MailingAddressInput!) {
        cartDeliveryAddressUpdate(cartId: $cartId, deliveryAddress: $deliveryAddress) {
          cart { ...CartFragment }
          userErrors { field message }
        }
      }
      ${CART_FRAGMENT}
    `;

    const variables = { cartId, deliveryAddress };

    const response = await client.request(mutation, { variables });
    const data = handleGraphQLResponse(response);

    const errs = data.cartDeliveryAddressUpdate?.userErrors || [];
    if (errs.length > 0) {
      return createErrorResponse(`Delivery address update failed: ${errs[0].message}`, 400);
    }

    const cart = data.cartDeliveryAddressUpdate.cart;
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

