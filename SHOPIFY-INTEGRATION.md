# Shopify Integration — Audit & Cleanup (2025-10)

This document summarizes the comprehensive audit and cleanup of Shopify-related code across the repository. The goal was to retain only essential live product/collection fetching and the simplified checkout via Shopify cart permalinks. All legacy/unused implementations were removed.

## What remains (active)
- Netlify Functions (Storefront API reads only):
  - /.netlify/functions/listCollections
  - /.netlify/functions/getCollection?handle=...
  - /.netlify/functions/getProduct?handle=...
  - /.netlify/functions/product-variants?handle=... (for PDP size availability)
- Frontend checkout: src/lib/cartPermalink.js builds native Shopify cart URLs client-side and redirects to https://<store>.myshopify.com/cart/ID:QTY,...
- Frontend data client: data/products.js (only collections/products endpoints)
- Utilities: netlify/functions/utils/shopify.js (Storefront client, PRODUCT_FRAGMENT, COLLECTION_FRAGMENT, helpers)

## Removed (legacy/unused)
- Server-side Cart API (Storefront Cart mutations):
  - netlify/functions/createCart.js
  - netlify/functions/addToCart.js
  - netlify/functions/getCart.js
  - netlify/functions/updateCart.js
- Client cart manager that depended on the above:
  - assets/cart.js
- Customer auth endpoints (local auth not used; we use Shopify New Customer Accounts only):
  - netlify/functions/customerLogin.js
  - netlify/functions/customerRegister.js
  - netlify/functions/customerRecover.js
  - netlify/functions/getCustomer.js
- Admin/webhooks and loyalty scaffolding (out of scope for this storefront cleanup):
  - netlify/functions/register-webhooks.ts
  - netlify/functions/webhook-orders-create.ts
  - netlify/functions/webhook-refunds-create.ts
  - netlify/functions/ensure-metafield.ts
  - netlify/functions/_lib/shopify.ts
  - netlify/functions/loyalty-points.js
  - docs/webhooks.json
- Unused fragment:
  - CART_FRAGMENT removed from netlify/functions/utils/shopify.js

## Files modified
- data/products.js
  - Removed Cart and Customer methods and related fallbacks; kept only product/collection requests
- netlify/functions/utils/shopify.js
  - Removed CART_FRAGMENT export; left PRODUCT_FRAGMENT, COLLECTION_FRAGMENT, helpers
- assets/account.js
  - Replaced local login/register/recover with redirects to Shopify New Customer Accounts; no calls to backend auth
- index.html, collection.html, product.html, test-local.html, test-integration.html, test-shopify.html
  - Removed <script src="assets/cart.js"> includes
- README-SHOPIFY.md
  - Updated features and API endpoints to reflect simplified checkout and removed endpoints

## Audited files (Shopify references)
- Frontend
  - script.js (Add to Cart UI, cart drawer UI, proceed-to-checkout uses CartPermalink)
  - src/lib/cartPermalink.js (active)
  - data/products.js (active, reduced scope)
  - assets/account.js (active, redirects to Shopify login/account)
  - HTML pages: index.html, collection.html, product.html, test-*.html
- Netlify Functions
  - getProduct.js, getCollection.js, listCollections.js (active)
  - product-variants.ts (active)
  - utils/shopify.js (active)
  - [removed] createCart.js, addToCart.js, getCart.js, updateCart.js
  - [removed] customerLogin.js, customerRegister.js, customerRecover.js, getCustomer.js
  - [removed] register-webhooks.ts, webhook-orders-create.ts, webhook-refunds-create.ts, ensure-metafield.ts, _lib/shopify.ts, loyalty-points.js

## Environment variables (required)
- SHOPIFY_STOREFRONT_DOMAIN or SHOPIFY_STORE_DOMAIN
- SHOPIFY_STOREFRONT_API_TOKEN or SHOPIFY_STOREFRONT_TOKEN
- SHOPIFY_API_VERSION (optional; defaults inside utils)

No sensitive tokens are exposed client-side.

## Checkout flow (current)
1) Add to Cart updates localStorage cart lines (key: ja_cart_lines)
2) Proceed to Checkout builds cart URL via CartPermalink and navigates
3) Optional: If localStorage.ja_discount is set, it appends ?discount=CODE

## Post-cleanup verification
- Product pages: Load product via getProduct Netlify function (OK)
- Collection pages: Load products via getCollection (OK)
- Add to Cart: Updates localStorage and cart drawer UI (OK)
- Proceed to Checkout: Navigates to Shopify cart permalink (OK)
- Grep for legacy terms (no active code remains): JCart, checkoutCreate, cartLinesAdd, cartLinesUpdate, preview_theme_id, /checkouts/cn

## Immediate next steps
- Ensure Netlify environment variables are set for Storefront API
- Optional: remove or adjust test pages that referenced old auth/cart tests
- Keep README-CHECKOUT.md as the source of truth for checkout behavior

If you need any of the removed features reinstated later (e.g., webhooks, loyalty, server cart), we can restore them in a separate, scoped change.

