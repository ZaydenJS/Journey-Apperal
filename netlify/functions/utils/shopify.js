import { createStorefrontApiClient } from "@shopify/storefront-api-client";

// Initialize Shopify Storefront API client
export const createShopifyClient = () => {
  const storeDomain =
    process.env.SHOPIFY_STOREFRONT_DOMAIN || process.env.SHOPIFY_STORE_DOMAIN;
  const storefrontToken =
    process.env.SHOPIFY_STOREFRONT_API_TOKEN ||
    process.env.SHOPIFY_STOREFRONT_TOKEN;
  const apiVersion = process.env.SHOPIFY_API_VERSION || "2024-07";

  if (!storeDomain || !storefrontToken) {
    throw new Error("Missing required Shopify environment variables");
  }

  return createStorefrontApiClient({
    storeDomain,
    apiVersion,
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
    descriptionHtml
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
    metafield(namespace: "custom", key: "short_description") { value }
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

// CART_FRAGMENT removed: no longer using Cart API. Checkout now uses Shopify cart permalinks.

// Helper function to handle GraphQL errors
export const handleGraphQLResponse = (response) => {
  if (response.errors && response.errors.length > 0) {
    console.error("GraphQL Errors:", response.errors);
    throw new Error(`GraphQL Error: ${response.errors[0].message}`);
  }
  return response.data;
};

// Helper function to create standardized API responses
export const createApiResponse = (data, status = 200) => {
  return {
    statusCode: status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    },
    body: JSON.stringify(data),
  };
};

// Helper function to handle API errors
export const createErrorResponse = (message, status = 500) => {
  console.error("API Error:", message);
  return createApiResponse({ error: message }, status);
};
