// Cart Management System
class CartManager {
  constructor() {
    this.cart = null;
    this.cartId = localStorage.getItem("shopify_cart_id");
    this.listeners = [];

    // Initialize cart on page load
    this.init();
  }

  async init() {
    try {
      if (this.cartId) {
        // Try to load existing cart (we'll need to implement getCart function)
        // For now, create a new cart if we don't have one
        await this.createCart();
      } else {
        await this.createCart();
      }
    } catch (error) {
      console.error("Failed to initialize cart:", error);
      await this.createCart();
    }
  }

  async createCart() {
    try {
      const response = await window.shopifyAPI.createCart();
      this.cart = response.cart;
      this.cartId = this.cart.id;
      localStorage.setItem("shopify_cart_id", this.cartId);
      this.notifyListeners();
      return this.cart;
    } catch (error) {
      console.error("Failed to create cart:", error);
      throw error;
    }
  }

  async addToCart(variantId, quantity = 1, properties = {}) {
    try {
      if (!this.cartId) {
        await this.createCart();
      }

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

      const response = await window.shopifyAPI.addToCart(this.cartId, lines);
      this.cart = response.cart;
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

  // Build a reliable checkout URL. By default we force the myshopify.com host
  // to avoid rare redirects/bounces on custom domains. You can override at runtime:
  //   window.FORCE_MYSHOPIFY_CHECKOUT = false  // to prefer custom domain
  //   window.SHOPIFY_CHECKOUT_HOST = "shop.journeysapparel.com";
  //   window.SHOPIFY_CHECKOUT_FALLBACK_HOST = "7196su-vk.myshopify.com";
  resolveCheckoutUrl(url) {
    try {
      if (!url) return url;
      const u = new URL(url);
      const preferredHost = (
        window.SHOPIFY_CHECKOUT_HOST || "shop.journeysapparel.com"
      ).replace(/^https?:\/\//, "");
      const fallbackHost = (
        window.SHOPIFY_CHECKOUT_FALLBACK_HOST || "7196su-vk.myshopify.com"
      ).replace(/^https?:\/\//, "");
      const forceMyShopify = window.FORCE_MYSHOPIFY_CHECKOUT !== false; // default true
      const always = window.ALWAYS_USE_MYSHOPIFY === true;
      u.host = always
        ? fallbackHost
        : forceMyShopify
        ? fallbackHost
        : preferredHost;
      return u.href;
    } catch (_) {
      return url;
    }
  }

  goToCheckout() {
    if (this.cart && this.cart.checkoutUrl) {
      window.location.href = this.resolveCheckoutUrl(this.cart.checkoutUrl);
    } else {
      this.showCartMessage("Cart is empty", "error");
    }
  }

  async prefillAndCheckout(prefill = {}) {
    try {
      if (!this.cartId) {
        await this.createCart();
      }

      // Try to use known customer data if available
      const customer =
        window.JourneyAuth && typeof window.JourneyAuth.getUser === "function"
          ? window.JourneyAuth.getUser()
          : null;

      // Buyer identity
      const buyerIdentity = {};
      if (prefill.email) buyerIdentity.email = prefill.email;
      if (prefill.phone) buyerIdentity.phone = prefill.phone;
      if (customer && customer.email && !buyerIdentity.email)
        buyerIdentity.email = customer.email;
      if (customer && customer.phone && !buyerIdentity.phone)
        buyerIdentity.phone = customer.phone;

      if (
        Object.keys(buyerIdentity).length > 0 &&
        window.shopifyAPI?.updateCartBuyerIdentity
      ) {
        const r = await window.shopifyAPI.updateCartBuyerIdentity(
          this.cartId,
          buyerIdentity
        );
        if (r && r.cart) {
          this.cart = r.cart;
        }
      }

      // Shipping/delivery address
      const addr =
        prefill.address || (customer && customer.defaultAddress) || null;
      if (addr && window.shopifyAPI?.updateCartDeliveryAddress) {
        const deliveryAddress = {
          firstName: addr.firstName || addr.first_name || undefined,
          lastName: addr.lastName || addr.last_name || undefined,
          address1: addr.address1 || undefined,
          address2: addr.address2 || undefined,
          city: addr.city || undefined,
          province: addr.province || undefined,
          country: addr.country || undefined,
          zip: addr.zip || addr.postcode || undefined,
          phone: addr.phone || undefined,
          company: addr.company || undefined,
        };
        const r2 = await window.shopifyAPI.updateCartDeliveryAddress(
          this.cartId,
          deliveryAddress
        );
        if (r2 && r2.cart) {
          this.cart = r2.cart;
        }
      }

      // Redirect
      if (this.cart && this.cart.checkoutUrl) {
        window.location.href = this.resolveCheckoutUrl(this.cart.checkoutUrl);
      } else {
        this.goToCheckout();
      }
    } catch (e) {
      console.warn("Prefill checkout failed; falling back to checkout", e);
      this.goToCheckout();
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
