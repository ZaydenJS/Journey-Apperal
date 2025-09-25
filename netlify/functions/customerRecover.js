import { 
  createShopifyClient,
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

    const { email } = JSON.parse(event.body);
    if (!email) {
      return createErrorResponse('Email is required', 400);
    }

    const client = createShopifyClient();

    const mutation = `
      mutation CustomerRecover($email: String!) {
        customerRecover(email: $email) {
          customerUserErrors { message }
        }
      }
    `;

    const response = await client.request(mutation, { variables: { email } });
    const data = handleGraphQLResponse(response);

    const errors = data.customerRecover?.customerUserErrors || [];
    if (errors.length > 0) {
      // Shopify intentionally does not reveal whether the email exists. Return generic error.
      return createErrorResponse(`Reset failed: ${errors[0].message}`, 400);
    }

    // Success: Shopify will send the reset email if the customer exists.
    return createApiResponse({ ok: true, message: 'If an account exists for this email, a reset link has been sent.' });
  } catch (error) {
    return createErrorResponse(error.message);
  }
};

