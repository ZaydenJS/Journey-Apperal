import { createStorefrontApiClient } from '@shopify/storefront-api-client';

// Initialize Shopify Storefront API client
export const createShopifyClient = () => {
  const storeDomain = process.env.SHOPIFY_STORE_DOMAIN;
  const storefrontToken = process.env.SHOPIFY_STOREFRONT_TOKEN;

  if (!storeDomain || !storefrontToken) {
    throw new Error('Missing required Shopify environment variables');
  }

  return createStorefrontApiClient({
    storeDomain,
    apiVersion: '2024-01',
    publicAccessToken: storefrontToken,
  });
};

// Common GraphQL fragments
export const PRODUCT_FRAGMENT = `
  fragment ProductFragment on Product {
    id
    handle
    title
    description
    tags
    vendor
    productType
    createdAt
    updatedAt
    availableForSale
    totalInventory
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
      maxVariantPrice {
        amount
        currencyCode
      }
    }
    compareAtPriceRange {
      minVariantPrice {
        amount
        currencyCode
      }
      maxVariantPrice {
        amount
        currencyCode
      }
    }
    images(first: 10) {
      edges {
        node {
          id
          url
          altText
          width
          height
        }
      }
    }
    variants(first: 100) {
      edges {
        node {
          id
          title
          availableForSale
          quantityAvailable
          price {
            amount
            currencyCode
          }
          compareAtPrice {
            amount
            currencyCode
          }
          selectedOptions {
            name
            value
          }
          image {
            id
            url
            altText
            width
            height
          }
        }
      }
    }
    options {
      id
      name
      values
    }
    seo {
      title
      description
    }
  }
`;

export const COLLECTION_FRAGMENT = `
  fragment CollectionFragment on Collection {
    id
    handle
    title
    description
    image {
      id
      url
      altText
      width
      height
    }
    seo {
      title
      description
    }
  }
`;

export const CART_FRAGMENT = `
  fragment CartFragment on Cart {
    id
    createdAt
    updatedAt
    checkoutUrl
    totalQuantity
    cost {
      totalAmount {
        amount
        currencyCode
      }
      subtotalAmount {
        amount
        currencyCode
      }
      totalTaxAmount {
        amount
        currencyCode
      }
      totalDutyAmount {
        amount
        currencyCode
      }
    }
    lines(first: 100) {
      edges {
        node {
          id
          quantity
          cost {
            totalAmount {
              amount
              currencyCode
            }
          }
          merchandise {
            ... on ProductVariant {
              id
              title
              availableForSale
              quantityAvailable
              price {
                amount
                currencyCode
              }
              product {
                id
                handle
                title
                images(first: 1) {
                  edges {
                    node {
                      id
                      url
                      altText
                      width
                      height
                    }
                  }
                }
              }
              selectedOptions {
                name
                value
              }
              image {
                id
                url
                altText
                width
                height
              }
            }
          }
        }
      }
    }
    attributes {
      key
      value
    }
  }
`;

// Helper function to handle GraphQL errors
export const handleGraphQLResponse = (response) => {
  if (response.errors && response.errors.length > 0) {
    console.error('GraphQL Errors:', response.errors);
    throw new Error(`GraphQL Error: ${response.errors[0].message}`);
  }
  return response.data;
};

// Helper function to create standardized API responses
export const createApiResponse = (data, status = 200) => {
  return {
    statusCode: status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    },
    body: JSON.stringify(data),
  };
};

// Helper function to handle API errors
export const createErrorResponse = (message, status = 500) => {
  console.error('API Error:', message);
  return createApiResponse({ error: message }, status);
};
