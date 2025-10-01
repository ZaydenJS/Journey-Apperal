# Shopify Checkout via Cart Permalinks (Client-only)

This site now uses Shopify cart permalinks for checkout. The frontend stores cart lines in localStorage and builds a native Shopify cart URL:

https://7196su-vk.myshopify.com/cart/NUMERIC_ID:QTY,NUMERIC_ID:QTY?discount=CODE

No tokens or server functions are required.

## Helpers

- File: `src/lib/cartPermalink.js` (also attached to `window.CartPermalink`)
  - `gidToNumeric(variantGid)` → "gid://shopify/ProductVariant/123" → "123"
  - `getLines()` / `setLines(lines)` → localStorage key `ja_cart_lines`
  - `buildCartPermalink(lines)` → returns full Shopify cart URL, appends `?discount=...` if `localStorage.ja_discount` set

## Frontend flow

- Add to Cart: updates `ja_cart_lines` (increments existing line or adds new).
- Proceed to Checkout: reads `ja_cart_lines` → if empty, alerts; otherwise builds permalink and sets `window.location.href`.

## Removed

- Netlify checkout function and Storefront Cart API client code.
- Global `window.JCart` and related JS Buy/Cart API checkout logic.

## QA

- One item → Proceed → lands on `https://7196su-vk.myshopify.com/cart/<ID>:1`
- Multiple items → `/cart/A:2,B:1` shows both items
- Discount → set `localStorage.ja_discount="WELCOME10"` → URL includes `?discount=WELCOME10`
- Empty cart → Proceed shows alert and does not navigate

No `preview_theme_id`, `/checkouts/cn`, or `/404.json` are generated.
