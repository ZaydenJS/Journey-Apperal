import { 
  createShopifyClient,
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

    const { email, password, firstName, lastName, acceptsMarketing = false } = JSON.parse(event.body);
    
    if (!email || !password) {
      return createErrorResponse('Email and password are required', 400);
    }

    const client = createShopifyClient();
    
    const query = `
      mutation CustomerCreate($input: CustomerCreateInput!) {
        customerCreate(input: $input) {
          customer {
            id
            firstName
            lastName
            displayName
            email
            phone
            createdAt
            acceptsMarketing
          }
          customerUserErrors {
            field
            message
          }
        }
      }
    `;

    const variables = {
      input: {
        email,
        password,
        firstName: firstName || '',
        lastName: lastName || '',
        acceptsMarketing
      }
    };

    const response = await client.request(query, { variables });
    const data = handleGraphQLResponse(response);

    if (data.customerCreate.customerUserErrors && 
        data.customerCreate.customerUserErrors.length > 0) {
      return createErrorResponse(
        `Registration failed: ${data.customerCreate.customerUserErrors[0].message}`, 
        400
      );
    }

    const customer = data.customerCreate.customer;

    if (!customer) {
      return createErrorResponse('Registration failed: Unable to create account', 400);
    }

    // Automatically log in the customer after registration
    const loginQuery = `
      mutation CustomerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
        customerAccessTokenCreate(input: $input) {
          customerAccessToken {
            accessToken
            expiresAt
          }
          customerUserErrors {
            field
            message
          }
        }
      }
    `;

    const loginVariables = {
      input: {
        email,
        password
      }
    };

    const loginResponse = await client.request(loginQuery, { variables: loginVariables });
    const loginData = handleGraphQLResponse(loginResponse);

    const accessToken = loginData.customerAccessTokenCreate.customerAccessToken;

    return createApiResponse({
      customer,
      accessToken: accessToken ? accessToken.accessToken : null,
      expiresAt: accessToken ? accessToken.expiresAt : null,
      message: 'Account created successfully'
    });

  } catch (error) {
    return createErrorResponse(error.message);
  }
};
