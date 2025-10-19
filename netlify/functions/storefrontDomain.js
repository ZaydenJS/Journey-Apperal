import { createApiResponse, createErrorResponse } from "./utils/shopify.js";

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return createApiResponse({}, 200);
  }
  if (event.httpMethod !== "GET") {
    return createErrorResponse("Method not allowed", 405);
  }
  try {
    const domain =
      process.env.SHOPIFY_STOREFRONT_DOMAIN || process.env.SHOPIFY_STORE_DOMAIN || "";
    if (!domain) {
      return createErrorResponse("Shopify Storefront domain not configured", 500);
    }
    return createApiResponse({ domain }, 200);
  } catch (err) {
    return createErrorResponse(err.message || "Failed to read store domain", 500);
  }
};

