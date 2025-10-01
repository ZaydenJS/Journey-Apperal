import {
  storefrontRequest,
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
    const query = `
      mutation CheckoutCreate($input: CheckoutCreateInput!) {
        checkoutCreate(input: $input) {
          checkout {
            id
            webUrl
          }
          checkoutUserErrors {
            field
            message
          }
        }
      }
    `;

    let input = { lineItems: [] };
    if (event.body) {
      try {
        const body = JSON.parse(event.body);
        if (Array.isArray(body.lines)) {
          input.lineItems = body.lines.map((l) => ({
            variantId: l.variantId,
            quantity: l.quantity || 1,
          }));
        }
        if (body.email) input.email = body.email;
        if (body.shippingAddress) input.shippingAddress = body.shippingAddress;
        if (body.note) input.note = body.note;
      } catch (e) {
        return createErrorResponse("Invalid JSON in request body", 400);
      }
    }

    const variables = { input };
    const response = await storefrontRequest(query, variables);
    const data = handleGraphQLResponse(response);

    const payload = data.checkoutCreate;
    if (payload.checkoutUserErrors && payload.checkoutUserErrors.length) {
      return createErrorResponse(
        `Checkout creation failed: ${payload.checkoutUserErrors[0].message}`,
        400
      );
    }

    const checkout = payload.checkout;
    if (!checkout || !checkout.webUrl) {
      return createErrorResponse("No checkout URL returned", 500);
    }

    return createApiResponse({ checkout: { id: checkout.id, webUrl: checkout.webUrl } });
  } catch (error) {
    return createErrorResponse(error.message);
  }
};

