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

  if (event.httpMethod !== 'GET') {
    return createErrorResponse('Method not allowed', 405);
  }

  try {
    const { accessToken } = event.queryStringParameters || {};
    
    if (!accessToken) {
      return createErrorResponse('Access token is required', 401);
    }

    const client = createShopifyClient();
    
    const query = `
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
          orders(first: 20, sortKey: PROCESSED_AT, reverse: true) {
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
                shippingAddress {
                  firstName
                  lastName
                  address1
                  address2
                  city
                  province
                  country
                  zip
                }
                lineItems(first: 10) {
                  edges {
                    node {
                      title
                      quantity
                      variant {
                        id
                        title
                        price {
                          amount
                          currencyCode
                        }
                        product {
                          handle
                        }
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

    const variables = { customerAccessToken: accessToken };

    const response = await client.request(query, { variables });
    const data = handleGraphQLResponse(response);

    if (!data.customer) {
      return createErrorResponse('Customer not found or invalid access token', 401);
    }

    // Transform orders data for easier frontend consumption
    const customer = {
      ...data.customer,
      addresses: data.customer.addresses.edges.map(edge => edge.node),
      orders: data.customer.orders.edges.map(edge => ({
        ...edge.node,
        lineItems: edge.node.lineItems.edges.map(lineEdge => lineEdge.node)
      }))
    };

    return createApiResponse({ customer });

  } catch (error) {
    return createErrorResponse(error.message);
  }
};
