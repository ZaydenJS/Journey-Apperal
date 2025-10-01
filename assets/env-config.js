// Environment configuration for client-side
// This file can be dynamically generated during build or deployment
// to inject environment variables into the client-side code

(function() {
  'use strict';
  
  // Create a global config object for environment variables
  window.ENV_CONFIG = window.ENV_CONFIG || {};
  
  // Default configuration - these should be overridden by build process
  const defaultConfig = {
    SHOPIFY_CHECKOUT_HOST: '7196su-vk.myshopify.com',
    SHOPIFY_STOREFRONT_DOMAIN: '7196su-vk.myshopify.com',
    NODE_ENV: 'production'
  };
  
  // Merge with any existing config
  Object.assign(window.ENV_CONFIG, defaultConfig);
  
  // Make environment variables available via multiple methods for compatibility
  
  // Method 1: Direct window properties
  window.SHOPIFY_CHECKOUT_HOST = window.ENV_CONFIG.SHOPIFY_CHECKOUT_HOST;
  
  // Method 2: Simulate process.env for compatibility with Node.js-style code
  if (typeof window.process === 'undefined') {
    window.process = {};
  }
  if (typeof window.process.env === 'undefined') {
    window.process.env = {};
  }
  Object.assign(window.process.env, window.ENV_CONFIG);
  
  // Method 3: Simulate import.meta.env for Vite-style code
  if (typeof window.import === 'undefined') {
    window.import = {};
  }
  if (typeof window.import.meta === 'undefined') {
    window.import.meta = {};
  }
  if (typeof window.import.meta.env === 'undefined') {
    window.import.meta.env = {};
  }
  Object.assign(window.import.meta.env, window.ENV_CONFIG);
  
  console.log('Environment configuration loaded:', window.ENV_CONFIG);
})();
