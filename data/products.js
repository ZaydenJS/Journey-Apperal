// Shopify API Client for Frontend
class ShopifyAPI {
  constructor() {
    this.baseURL = "/.netlify/functions";
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}/${endpoint}`;
    const cacheKey = `${url}${JSON.stringify(options)}`;

    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      const response = await fetch(url, {
        method: options.method || "GET",
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      const data = await response.json();

      // Cache GET requests
      if (!options.method || options.method === "GET") {
        this.cache.set(cacheKey, {
          data,
          timestamp: Date.now(),
        });
      }

      return data;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // Collections
  async getCollections() {
    return this.request("listCollections");
  }

  async getCollection(handle, tag = null) {
    const params = new URLSearchParams({ handle });
    if (tag) params.append("tag", tag);
    return this.request(`getCollection?${params}`);
  }

  // Products
  async getProduct(handle) {
    return this.request(`getProduct?handle=${handle}`);
  }

  // Cart
  async createCart(lines = []) {
    return this.request("createCart", {
      method: "POST",
      body: { lines },
    });
  }

  async addToCart(cartId, lines) {
    return this.request("addToCart", {
      method: "POST",
      body: { cartId, lines },
    });
  }

  async updateCart(cartId, lines) {
    return this.request("updateCart", {
      method: "POST",
      body: { cartId, lines },
    });
  }

  // Customer
  async customerLogin(email, password) {
    return this.request("customerLogin", {
      method: "POST",
      body: { email, password },
    });
  }

  async customerRegister(customerData) {
    return this.request("customerRegister", {
      method: "POST",
      body: customerData,
    });
  }

  async getCustomer(accessToken) {
    return this.request(`getCustomer?accessToken=${accessToken}`);
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }
}

// Initialize global API client
window.shopifyAPI = new ShopifyAPI();

// Legacy catalog structure for backward compatibility
window.__CATALOG = {
  generatedAt: Date.now(),
  products: [],

  // Load products from Shopify
  async loadProducts(collectionHandle = null, tag = null) {
    try {
      let data;
      if (collectionHandle) {
        data = await window.shopifyAPI.getCollection(collectionHandle, tag);
        this.products = data.products || [];
      } else {
        // Load all collections and their products
        const collections = await window.shopifyAPI.getCollections();
        this.products = [];

        for (const collection of collections.collections) {
          const collectionData = await window.shopifyAPI.getCollection(
            collection.handle
          );
          this.products.push(...(collectionData.products || []));
        }
      }

      this.generatedAt = Date.now();
      return this.products;
    } catch (error) {
      console.error("Failed to load products:", error);
      return [];
    }
  },
};
