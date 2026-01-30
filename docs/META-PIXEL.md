# Meta (Facebook) Pixel Tracking (Journey Apparel)

## Pixel installed
- **Meta Pixel ID:** `1891291328316515`
- **Loader script:** `assets/meta-pixel.js`
- **Included site-wide:** every `.html` page includes:
  - `<script src="/assets/meta-pixel.js"></script>` in the `<head>`

This loads the official Meta Pixel base snippet early and initializes `fbq`.

## Events tracked
### 1) PageView (all pages)
- Fired automatically by `assets/meta-pixel.js` on every page load:
  - `fbq('track', 'PageView')`

### 2) ViewContent (product pages)
- Fired when product data is available on `product.html`.
- Wired in `script.js` where the PDP renders/updates from the fetched product object:
  - Calls `window.JourneyPixel.trackViewContent(product)`
- Payload includes best-effort `content_ids`, `content_name`, `value`, `currency`.
- **Deduping:** ViewContent is deduped per product during a single page session.

### 3) AddToCart
- Fired when an item is added to cart.
- Wired in `script.js` in two places:
  1. The PDP “Add to cart” click handler (best-effort price/currency from the selected variant)
  2. A delegated fallback handler for generic add-to-cart UI
- Calls `window.JourneyPixel.trackAddToCart({ variantId, name, value, currency, quantity })`

### 4) InitiateCheckout
- Fired when the user clicks “Proceed to Checkout” from the cart drawer.
- Wired in `script.js` inside the checkout button click handler.
- Calls `window.JourneyPixel.trackInitiateCheckout()` **before** redirecting to Shopify.
- Uses `localStorage.ja_cart_lines` as the primary source of line quantities, and `localStorage.cartItems` as a best-effort source for price/value.

### 5) Purchase
- **Not tracked from this codebase by default** because checkout + thank-you page are hosted on Shopify’s domain.

If you need **Purchase** tracking, recommended options:
1. Install/configure the **Meta pixel inside Shopify** (e.g., via Shopify’s Meta/Facebook channel) so it can fire on the Shopify checkout/thank-you page.
2. Implement **Meta Conversions API** on the server side using Shopify order webhooks → Netlify Function (requires additional setup + access tokens).

## Debugging / validation
### Enable debug logging
- Add `?pixel_debug=1` to any page URL, **or**
- Run in console:
  - `localStorage.setItem('ja_pixel_debug', '1')` then refresh

With debug enabled, the script logs `[MetaPixel] ...` messages to the console.

### Validate events
- Install **Meta Pixel Helper** (Chrome extension) and confirm:
  - PageView on any page
  - ViewContent on a product page
  - AddToCart after adding a product
  - InitiateCheckout when clicking “Proceed to Checkout”
- Also verify in **Meta Events Manager → Test Events**.

## Public helper API (available on all pages)
`assets/meta-pixel.js` exposes a small API for future wiring:
- `window.JourneyPixel.trackViewContent(product)`
- `window.JourneyPixel.trackAddToCart(payload)`
- `window.JourneyPixel.trackInitiateCheckout()`

