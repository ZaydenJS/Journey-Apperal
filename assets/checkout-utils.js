// Checkout URL normalization utilities
class CheckoutUtils {
  constructor() {
    this.checkoutHost = this.getCheckoutHost();
    this.allowedHosts = new Set([
      '7196su-vk.myshopify.com', // Primary Shopify domain
      'shopify.com', // Shopify's checkout domain
      'checkout.shopify.com' // Alternative checkout domain
    ]);
    
    // Add the configured checkout host to allowed hosts
    if (this.checkoutHost) {
      this.allowedHosts.add(this.checkoutHost);
    }
  }

  /**
   * Get the checkout host from environment variables
   * Tries multiple possible env var names and prefixes
   */
  getCheckoutHost() {
    // Try different possible environment variable names
    const possibleEnvVars = [
      'SHOPIFY_CHECKOUT_HOST',
      'VITE_SHOPIFY_CHECKOUT_HOST',
      'NEXT_PUBLIC_SHOPIFY_CHECKOUT_HOST',
      'REACT_APP_SHOPIFY_CHECKOUT_HOST'
    ];

    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      // Try import.meta.env if available (Vite)
      if (typeof import !== 'undefined' && import.meta && import.meta.env) {
        for (const envVar of possibleEnvVars) {
          const value = import.meta.env[envVar];
          if (value) {
            console.log(`Using checkout host from ${envVar}: ${value}`);
            return value;
          }
        }
      }

      // Try process.env if available (Node.js style or bundled)
      if (typeof process !== 'undefined' && process.env) {
        for (const envVar of possibleEnvVars) {
          const value = process.env[envVar];
          if (value) {
            console.log(`Using checkout host from ${envVar}: ${value}`);
            return value;
          }
        }
      }

      // Try window-based environment variables (injected by build tools)
      for (const envVar of possibleEnvVars) {
        const value = window[envVar];
        if (value) {
          console.log(`Using checkout host from window.${envVar}: ${value}`);
          return value;
        }
      }
    }

    // Fallback to the primary domain
    console.log('Using fallback checkout host: 7196su-vk.myshopify.com');
    return '7196su-vk.myshopify.com';
  }

  /**
   * Normalize a checkout URL to use the correct host
   * @param {string} checkoutUrl - The original checkout URL from Shopify
   * @returns {string} - The normalized checkout URL
   */
  normalizeCheckoutUrl(checkoutUrl) {
    if (!checkoutUrl) {
      throw new Error('Checkout URL is required');
    }

    try {
      const url = new URL(checkoutUrl);
      
      // Security check: only allow known Shopify hosts
      if (!this.allowedHosts.has(url.hostname)) {
        console.warn(`Unsafe checkout URL host: ${url.hostname}. Using fallback.`);
        throw new Error('Invalid checkout URL host');
      }

      // If the hostname is already our target checkout host, return as-is
      if (url.hostname === this.checkoutHost) {
        console.log(`Checkout URL already uses correct host: ${this.checkoutHost}`);
        return checkoutUrl;
      }

      // Store original hostname for logging
      const originalHostname = url.hostname;

      // Replace the hostname with our checkout host
      url.hostname = this.checkoutHost;
      const normalizedUrl = url.href;

      console.log(`Normalized checkout URL: ${originalHostname} -> ${this.checkoutHost}`);
      console.log(`Full checkout URL: ${normalizedUrl}`);
      return normalizedUrl;
      
    } catch (error) {
      console.error('Failed to normalize checkout URL:', error);
      throw new Error(`Invalid checkout URL: ${error.message}`);
    }
  }

  /**
   * Validate that a checkout URL is safe to redirect to
   * @param {string} checkoutUrl - The checkout URL to validate
   * @returns {boolean} - Whether the URL is safe
   */
  isValidCheckoutUrl(checkoutUrl) {
    if (!checkoutUrl) return false;
    
    try {
      const url = new URL(checkoutUrl);
      return this.allowedHosts.has(url.hostname) && 
             (url.pathname.startsWith('/cart/') || url.pathname.startsWith('/checkouts/'));
    } catch {
      return false;
    }
  }

  /**
   * Get the final redirect URL with logging
   * @param {string} checkoutUrl - The original checkout URL
   * @returns {string} - The final URL to redirect to
   */
  getFinalCheckoutUrl(checkoutUrl) {
    try {
      const normalizedUrl = this.normalizeCheckoutUrl(checkoutUrl);
      const finalUrl = new URL(normalizedUrl);
      
      console.log(`Final checkout redirect hostname: ${finalUrl.hostname}`);
      console.log(`Full checkout URL: ${normalizedUrl}`);
      
      return normalizedUrl;
    } catch (error) {
      console.error('Checkout URL processing failed:', error);
      throw error;
    }
  }
}

// Create global instance
window.checkoutUtils = new CheckoutUtils();
