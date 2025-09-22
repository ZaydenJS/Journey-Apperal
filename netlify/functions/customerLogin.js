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

    const { email, password } = JSON.parse(event.body);
    
    if (!email || !password) {
      return createErrorResponse('Email and password are required', 400);
    }

    const client = createShopifyClient();
    
    const query = `
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

    const variables = {
      input: {
        email,
        password
      }
    };

    const response = await client.request(query, { variables });
    const data = handleGraphQLResponse(response);

    if (data.customerAccessTokenCreate.customerUserErrors && 
        data.customerAccessTokenCreate.customerUserErrors.length > 0) {
      return createErrorResponse(
        `Login failed: ${data.customerAccessTokenCreate.customerUserErrors[0].message}`, 
        401
      );
    }

    const accessToken = data.customerAccessTokenCreate.customerAccessToken;

    if (!accessToken) {
      return createErrorResponse('Login failed: Invalid credentials', 401);
    }

    // Get customer details
    const customerQuery = `
      query GetCustomer($customerAccessToken: String!) {
        customer(customerAccessToken: $customerAccessToken) {
          id
          firstName
          lastName
          displayName
          email
          phone
          createdAt
          updatedAt
          acceptsMarketing
          defaultAddress {
            id
            firstName
            lastName
            company
            address1
            address2
            city
            province
            country
            zip
            phone
          }
          addresses(first: 10) {
            edges {
              node {
                id
                firstName
                lastName
                company
                address1
                address2
                city
                province
                country
                zip
                phone
              }
            }
          }
          orders(first: 10) {
            edges {
              node {
                id
                orderNumber
                processedAt
                financialStatus
                fulfillmentStatus
                totalPrice {
                  amount
                  currencyCode
                }
                lineItems(first: 10) {
                  edges {
                    node {
                      title
                      quantity
                      variant {
                        id
                        title
                        image {
                          url
                          altText
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    const customerResponse = await client.request(customerQuery, {
      variables: { customerAccessToken: accessToken.accessToken }
    });
    const customerData = handleGraphQLResponse(customerResponse);

    return createApiResponse({
      accessToken: accessToken.accessToken,
      expiresAt: accessToken.expiresAt,
      customer: customerData.customer
    });

  } catch (error) {
    return createErrorResponse(error.message);
  }
};
