import {
  createShopifyClient,
  CART_FRAGMENT,
  handleGraphQLResponse,
  createApiResponse,
  createErrorResponse,
} from "./utils/shopify.js";

export const handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return createApiResponse({}, 200);
  }

  if (event.httpMethod !== "POST") {
    return createErrorResponse("Method not allowed", 405);
  }

  try {
    const client = createShopifyClient();

    const query = `
      mutation CartCreate($input: CartInput!) {
        cartCreate(input: $input) {
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

    // Parse request body for initial cart items (optional)
    let cartInput = {};
    const defaultCountryCode = process.env.DEFAULT_COUNTRY_CODE || "AU";

    if (event.body) {
      try {
        const body = JSON.parse(event.body);
        if (body.lines && body.lines.length > 0) {
          cartInput.lines = body.lines.map((line) => ({
            merchandiseId: line.merchandiseId,
            quantity: line.quantity,
            attributes: line.attributes || [],
          }));
        }
        if (body.attributes) {
          cartInput.attributes = body.attributes;
        }
        if (body.buyerIdentity) {
          cartInput.buyerIdentity = body.buyerIdentity;
        }
      } catch (parseError) {
        return createErrorResponse("Invalid JSON in request body", 400);
      }
    }

    // Default buyer identity (country) if not provided
    if (!cartInput.buyerIdentity) {
      cartInput.buyerIdentity = { countryCode: defaultCountryCode };
    }

    const variables = { input: cartInput };

    const response = await client.request(query, { variables });
    const data = handleGraphQLResponse(response);

    if (data.cartCreate.userErrors && data.cartCreate.userErrors.length > 0) {
      return createErrorResponse(
        `Cart creation failed: ${data.cartCreate.userErrors[0].message}`,
        400
      );
    }

    // Transform the cart data
    const cart = data.cartCreate.cart;
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
