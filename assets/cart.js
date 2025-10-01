// Cart Management System
class CartManager {
  constructor() {
    this.cart = null;
    this.cartId = localStorage.getItem("shopify_cart_id");
    this.checkoutUrl = localStorage.getItem("shopify_checkout_url") || null;
    this.snapshotKey = "shopify_cart_snapshot";
    this.listeners = [];

    // Initialize cart on page load
    this.init();
  }

  async init() {
    try {
      if (this.cartId) {
        // Try to load existing cart from Shopify
        try {
          const response = await window.shopifyAPI.getCart(this.cartId);
          this.cart = response.cart;
          this.checkoutUrl = this.cart.checkoutUrl || null;
          localStorage.setItem("shopify_cart_id", this.cart.id);
          if (this.checkoutUrl) {
            localStorage.setItem("shopify_checkout_url", this.checkoutUrl);
          }
        } catch (e) {
          // If cart is invalid/expired, try to recreate from snapshot
          const snapshot = this.getSnapshot();
          if (snapshot && snapshot.length > 0) {
            await this.createCart(snapshot);
          } else {
            await this.createCart();
          }
        }
      } else {
        // No cart yet, create from snapshot if available
        const snapshot = this.getSnapshot();
        if (snapshot && snapshot.length > 0) {
          await this.createCart(snapshot);
        } else {
          await this.createCart();
        }
      }
    } catch (error) {
      console.error("Failed to initialize cart:", error);
      await this.createCart();
    }
  }

  async createCart(lines = []) {
    try {
      const response = await window.shopifyAPI.createCart(lines);
      this.cart = response.cart;
      this.cartId = this.cart.id;
      this.checkoutUrl = this.cart.checkoutUrl || null;
      localStorage.setItem("shopify_cart_id", this.cartId);
      if (this.checkoutUrl) {
        localStorage.setItem("shopify_checkout_url", this.checkoutUrl);
      }
      // Persist lightweight snapshot of lines
      this.persistSnapshotFromCart();
      this.notifyListeners();
      return this.cart;
    } catch (error) {
      console.error("Failed to create cart:", error);
      throw error;
    }
  }

  async addToCart(variantId, quantity = 1, properties = {}) {
    try {
      const lines = [
        {
          merchandiseId: variantId,
          quantity: quantity,
          attributes: Object.entries(properties).map(([key, value]) => ({
            key,
            value: String(value),
          })),
        },
      ];

      if (!this.cartId) {
        // Create cart with initial line
        await this.createCart(lines);
      } else {
        const response = await window.shopifyAPI.addToCart(this.cartId, lines);
        this.cart = response.cart;
      }

      this.checkoutUrl = this.cart.checkoutUrl || null;
      if (this.checkoutUrl) {
        localStorage.setItem("shopify_checkout_url", this.checkoutUrl);
      }
      this.persistSnapshotFromCart();
      this.notifyListeners();

      // Show success message
      this.showCartMessage(`Added to cart successfully!`, "success");

      return this.cart;
    } catch (error) {
      console.error("Failed to add to cart:", error);

      // Handle different error types gracefully
      let errorMessage = "Failed to add to cart";

      if (error.message.includes("API not available")) {
        errorMessage = "Cart functionality requires deployment to work";
      } else if (error.message.includes("Network")) {
        errorMessage = "Network error - please check your connection";
      } else if (error.originalError) {
        errorMessage = `Failed to add to cart: ${error.originalError.message}`;
      } else {
        errorMessage = `Failed to add to cart: ${error.message}`;
      }

      this.showCartMessage(errorMessage, "error");

      // Don't throw error for graceful degradation
      if (error.message.includes("API not available")) {
        console.warn("Cart functionality disabled in local development");
        return null;
      }

      throw error;
    }
  }

  async updateCartLine(lineId, quantity) {
    try {
      if (!this.cartId) {
        throw new Error("No cart found");
      }

      const lines = [
        {
          id: lineId,
          quantity: quantity,
        },
      ];

      const response = await window.shopifyAPI.updateCart(this.cartId, lines);
      this.cart = response.cart;
      this.checkoutUrl = this.cart.checkoutUrl || null;
      if (this.checkoutUrl) {
        localStorage.setItem("shopify_checkout_url", this.checkoutUrl);
      }
      this.persistSnapshotFromCart();
      this.notifyListeners();

      return this.cart;
    } catch (error) {
      console.error("Failed to update cart:", error);
      this.showCartMessage(`Failed to update cart: ${error.message}`, "error");
      throw error;
    }
  }

  async removeFromCart(lineId) {
    return this.updateCartLine(lineId, 0);
  }

  getCart() {
    return this.cart;
  }

  getCartCount() {
    return this.cart ? this.cart.totalQuantity : 0;
  }

  getCartTotal() {
    return this.cart
      ? this.cart.cost.totalAmount
      : { amount: "0.00", currencyCode: "AUD" };
  }

  /**
   * Get or create a valid checkout URL from Shopify
   * @param {Object} options - Options object
   * @param {Array} options.lines - Optional lines to add to cart
   * @returns {Promise<string>} - The checkout URL string from Shopify
   */
  async getOrCreateCheckoutUrl({ lines = [] } = {}) {
    try {
      // Try to use existing cart first
      if (this.cart && this.cart.id) {
        try {
          // Refresh cart data to get latest checkout URL
          const response = await window.shopifyAPI.getCart(this.cart.id);
          this.cart = response.cart;

          // Add lines if provided
          if (lines && lines.length > 0) {
            const addResponse = await window.shopifyAPI.addToCart(
              this.cart.id,
              lines
            );
            this.cart = addResponse.cart;
          }

          if (this.cart.checkoutUrl) {
            // Update stored checkout URL
            localStorage.setItem("shopify_checkout_url", this.cart.checkoutUrl);
            this.persistSnapshotFromCart();
            this.notifyListeners();
            return this.cart.checkoutUrl;
          }
        } catch (error) {
          console.warn("Existing cart is invalid, creating new cart:", error);
          // Cart is stale/invalid, create new one below
        }
      }

      // Create new cart (with lines if provided)
      console.log("Creating new cart for checkout...");
      const currentSnapshot = this.getSnapshot() || [];
      const allLines = [...currentSnapshot, ...lines];

      const response = await window.shopifyAPI.createCart(allLines);
      this.cart = response.cart;
      this.cartId = this.cart.id;

      if (!this.cart.checkoutUrl) {
        throw new Error("Cart created but no checkout URL returned");
      }

      // Store cart data
      localStorage.setItem("shopify_cart_id", this.cartId);
      localStorage.setItem("shopify_checkout_url", this.cart.checkoutUrl);
      this.persistSnapshotFromCart();
      this.notifyListeners();

      return this.cart.checkoutUrl;
    } catch (error) {
      console.error("Failed to get or create checkout URL:", error);
      throw new Error(`Unable to create checkout: ${error.message}`);
    }
  }

  async goToCheckout() {
    try {
      // Determine if there are any items in the cart or snapshot
      const snapshotLines = this.getSnapshot() || [];
      const hasCartItems =
        (this.cart &&
          ((typeof this.cart.totalQuantity === "number" &&
            this.cart.totalQuantity > 0) ||
            (Array.isArray(this.cart.lines) && this.cart.lines.length > 0))) ||
        snapshotLines.length > 0;

      if (!hasCartItems) {
        this.showCartMessage(
          "Your cart is empty. Please add items before checkout.",
          "error"
        );
        return;
      }

      // Get or create a valid checkout URL
      console.log("Getting checkout URL from Shopify...");
      const rawCheckoutUrl = await this.getOrCreateCheckoutUrl({ lines: [] });

      // Validate the checkout URL
      if (!rawCheckoutUrl || typeof rawCheckoutUrl !== "string") {
        throw new Error("No valid checkout URL returned from Shopify");
      }

      // Guard: check if URL contains expected checkout patterns
      if (
        !rawCheckoutUrl.includes("/cart/c/") &&
        !rawCheckoutUrl.includes("?key=") &&
        !rawCheckoutUrl.includes("/checkouts/")
      ) {
        console.warn("Checkout URL missing expected patterns:", rawCheckoutUrl);
        this.showCartMessage(
          "Invalid checkout URL received. Please try again.",
          "error"
        );
        return;
      }

      // Log the raw URL from Shopify
      console.log("Raw checkoutUrl from Shopify:", rawCheckoutUrl);

      // Normalize the checkout URL
      let finalUrl;
      try {
        finalUrl = window.checkoutUtils
          ? window.checkoutUtils.normalizeCheckoutUrl(rawCheckoutUrl)
          : rawCheckoutUrl;
      } catch (error) {
        console.error("Failed to normalize checkout URL:", error);
        this.showCartMessage(
          "Checkout URL is invalid. Please try again.",
          "error"
        );
        return;
      }

      // Log the final URL before redirect
      console.log("Final checkout redirect URL:", finalUrl);

      // Redirect to checkout
      window.location.assign(finalUrl);
    } catch (error) {
      console.error("Checkout failed:", error);

      // Try to recreate cart once more as fallback
      try {
        console.log("Attempting to recreate cart as fallback...");
        const snapshot = this.getSnapshot();
        if (snapshot && snapshot.length > 0) {
          await this.createCart(snapshot);
          if (this.cart && this.cart.checkoutUrl) {
            const fallbackUrl = window.checkoutUtils
              ? window.checkoutUtils.normalizeCheckoutUrl(this.cart.checkoutUrl)
              : this.cart.checkoutUrl;

            console.log("Fallback checkout URL:", fallbackUrl);
            window.location.assign(fallbackUrl);
            return;
          }
        }
      } catch (fallbackError) {
        console.error("Fallback cart creation also failed:", fallbackError);
      }

      this.showCartMessage(
        "Checkout is temporarily unavailable. Please try again.",
        "error"
      );
    }
  }

  // Event listeners for cart updates
  addListener(callback) {
    this.listeners.push(callback);
  }

  removeListener(callback) {
    this.listeners = this.listeners.filter((listener) => listener !== callback);
  }

  notifyListeners() {
    this.listeners.forEach((callback) => callback(this.cart));
  }

  // Lightweight snapshot helpers
  getSnapshot() {
    try {
      const raw = localStorage.getItem(this.snapshotKey);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  persistSnapshotFromCart() {
    try {
      if (!this.cart || !this.cart.lines) return;
      const lines = (this.cart.lines || [])
        .map((l) => ({
          merchandiseId: l.merchandise?.id,
          quantity: l.quantity,
        }))
        .filter((x) => x.merchandiseId && x.quantity > 0);
      localStorage.setItem(this.snapshotKey, JSON.stringify(lines));
    } catch {}
  }

  clearCart() {
    this.cart = null;
    this.cartId = null;
    this.checkoutUrl = null;
    localStorage.removeItem("shopify_cart_id");
    localStorage.removeItem("shopify_checkout_url");
    localStorage.removeItem(this.snapshotKey);
    this.notifyListeners();
  }

  // UI Helper methods
  showCartMessage(message, type = "info") {
    // Create or update cart message element
    let messageEl = document.getElementById("cart-message");
    if (!messageEl) {
      messageEl = document.createElement("div");
      messageEl.id = "cart-message";
      messageEl.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 4px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        transition: all 0.3s ease;
        transform: translateX(100%);
      `;
      document.body.appendChild(messageEl);
    }

    // Set message and style based on type
    messageEl.textContent = message;
    messageEl.className = `cart-message cart-message-${type}`;

    const colors = {
      success: "#10B981",
      error: "#EF4444",
      info: "#3B82F6",
    };

    messageEl.style.backgroundColor = colors[type] || colors.info;
    messageEl.style.transform = "translateX(0)";

    // Auto hide after 3 seconds
    setTimeout(() => {
      messageEl.style.transform = "translateX(100%)";
    }, 3000);
  }

  updateCartUI() {
    // Update cart count in header
    const cartCountElements = document.querySelectorAll(
      ".cart-count, [data-cart-count]"
    );
    const count = this.getCartCount();

    cartCountElements.forEach((el) => {
      el.textContent = count;
      el.style.display = count > 0 ? "inline" : "none";
    });

    // Update cart total
    const cartTotalElements = document.querySelectorAll(
      ".cart-total, [data-cart-total]"
    );
    const total = this.getCartTotal();

    cartTotalElements.forEach((el) => {
      el.textContent = `$${parseFloat(total.amount).toFixed(2)} ${
        total.currencyCode
      }`;
    });
  }
}

// Initialize global cart manager
window.cartManager = new CartManager();

// Update UI when cart changes
window.cartManager.addListener(() => {
  window.cartManager.updateCartUI();
});

// Helper function for product pages
window.addToCartFromForm = async function (form) {
  const formData = new FormData(form);
  const variantId = formData.get("variant_id");
  const quantity = parseInt(formData.get("quantity") || "1");

  if (!variantId) {
    window.cartManager.showCartMessage("Please select a variant", "error");
    return;
  }

  try {
    await window.cartManager.addToCart(variantId, quantity);
  } catch (error) {
    console.error("Add to cart failed:", error);
  }
};

// Initialize cart UI on page load
document.addEventListener("DOMContentLoaded", () => {
  window.cartManager.updateCartUI();
});
