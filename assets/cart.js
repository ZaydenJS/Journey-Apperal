// Cart Management System
class CartManager {
  constructor() {
    this.cart = null;
    this.cartId = localStorage.getItem("shopify_cart_id");
    this.checkoutUrl = localStorage.getItem("shopify_checkout_url") || null;
    this.snapshotKey = "shopify_cart_snapshot";
    this.listeners = [];

    // Clear persisted cart if env (domain/API URL) changed
    this.ensureFreshEnv();

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
      const response = await window.shopifyAPI.createCart(lines, {
        countryCode: "AU",
      });
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

  async goToCheckout() {
    this.showCartMessage("Checkout is unavailable.", "error");
    return;

    // Feature-flagged V2: strict Storefront Cart API flow; redirect using EXACT checkoutUrl
    if (window.CHECKOUT_V2) {
      try {
        const snapshot = this.getSnapshot() || [];

        // Ensure cart exists and is fresh
        if (!this.cartId) {
          await this.createCart(snapshot);
        } else {
          try {
            const response = await window.shopifyAPI.getCart(this.cartId);
            this.cart = response.cart;
          } catch (e) {
            // If fetch fails (expired/invalid), recreate with snapshot
            await this.createCart(snapshot);
          }
        }

        const checkoutUrl = this.cart?.checkoutUrl || null;
        if (this.isDevMode()) {
          try {
            const host = checkoutUrl ? new URL(checkoutUrl).hostname : null;
            console.log({
              shop: host,
              cartId: this.cartId || this.cart?.id || null,
              checkoutUrl,
            });
          } catch (_) {
            console.log({
              shop: null,
              cartId: this.cartId || this.cart?.id || null,
              checkoutUrl,
            });
          }
        }

        if (!checkoutUrl) {
          throw new Error("Missing checkoutUrl from Cart API response");
        }

        // Redirect to the EXACT checkoutUrl (unchanged)
        window.location.assign(checkoutUrl);
      } catch (err) {
        console.error("Checkout V2 failed:", err);
        this.showCartMessage(
          "Checkout is unavailable. Please try again.",
          "error"
        );
      }
      return;
    }

    // Fallback (V1): legacy guarded flow
    try {
      const getValidUrl = async (recreate = false) => {
        let raw = null;
        if (recreate) {
          const snapshot = this.getSnapshot();
          await this.createCart(snapshot || []);
          raw = this.cart?.checkoutUrl || null;
        } else {
          raw = await this.getFreshCartCheckoutUrl();
        }
        if (!raw || !raw.includes("/cart/c/") || !raw.includes("?key=")) {
          return null;
        }
        return raw;
      };

      let raw = await getValidUrl(false);
      if (!raw) raw = await getValidUrl(true);
      if (!raw) {
        this.showCartMessage(
          "Checkout is unavailable. Please add an item to your cart and try again.",
          "error"
        );
        return;
      }

      const finalUrl = this.normalizeCheckoutUrl(raw);
      console.log("Raw checkoutUrl:", raw);
      console.log("Final checkout redirect URL:", finalUrl);
      window.location.assign(finalUrl);
    } catch (err) {
      console.error("Checkout redirect failed:", err);
      this.showCartMessage(
        "Checkout is unavailable. Please try again.",
        "error"
      );
    }
  }

  getCheckoutHost() {
    try {
      return window.SHOPIFY_CHECKOUT_HOST || "7196su-vk.myshopify.com";
    } catch (_) {
      return "7196su-vk.myshopify.com";
    }
  }

  normalizeCheckoutUrl(checkoutUrlStr) {
    try {
      const url = new URL(checkoutUrlStr);
      if (!url.pathname.startsWith("/cart/c/"))
        throw new Error("Invalid checkout path");
      if (!url.searchParams.has("key")) throw new Error("Missing key param");
      ["preview_theme_id", "preview", "theme_id"].forEach((p) =>
        url.searchParams.delete(p)
      );
      url.hostname = this.getCheckoutHost();
      return url.href;
    } catch (e) {
      console.warn("normalizeCheckoutUrl failed:", e);
      return checkoutUrlStr;
    }
  }

  async getFreshCartCheckoutUrl() {
    try {
      if (this.cartId) {
        const response = await window.shopifyAPI.getCart(this.cartId);
        this.cart = response.cart;
      } else {
        const snapshot = this.getSnapshot();
        await this.createCart(snapshot || []);
      }
      this.checkoutUrl = this.cart?.checkoutUrl || null;
      if (this.checkoutUrl) {
        try {
          localStorage.setItem("shopify_checkout_url", this.checkoutUrl);
        } catch (_) {}
      }
      return this.checkoutUrl;
    } catch (e) {
      console.warn("getFreshCartCheckoutUrl failed:", e);
      return null;
    }
  }

  // Event listeners for cart updates
  addListener(callback) {
    this.listeners.push(callback);
  }

  removeListener(callback) {
    this.listeners = this.listeners.filter((listener) => listener !== callback);
  }

  isDevMode() {
    try {
      if (window.__DEV__ === true) return true;
    } catch (_) {}
    const h = (window.location && window.location.hostname) || "";
    return h === "localhost" || h === "127.0.0.1" || h.endsWith(".netlify.app");
  }

  getEnvSignature() {
    const host = (
      window.SHOPIFY_CHECKOUT_HOST || "7196su-vk.myshopify.com"
    ).toLowerCase();
    const apiUrl = (window.SHOPIFY_STOREFRONT_API_URL || "").toLowerCase();
    return `${host}|${apiUrl}`;
  }

  ensureFreshEnv() {
    try {
      const sig = this.getEnvSignature();
      const prev = localStorage.getItem("shopify_env_sig");
      if (prev && prev !== sig) {
        localStorage.removeItem("shopify_cart_id");
        localStorage.removeItem("shopify_checkout_url");
        try {
          localStorage.removeItem(this.snapshotKey);
        } catch (_) {}
        this.cartId = null;
        this.checkoutUrl = null;
        this.cart = null;
      }
      localStorage.setItem("shopify_env_sig", sig);
    } catch (_) {}
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
