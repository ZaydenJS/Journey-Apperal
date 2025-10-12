# Search indexing, freshness, and ranking

This site uses a lightweight serverless search endpoint that indexes Shopify products and collections and exposes a fuzzy, typo-tolerant search to the header UI.

## Overview
- Endpoint: `/.netlify/functions/search`
- Data sources: Shopify Storefront API (products, collections) + a few static pages (Contact/Support/Policies)
- Matching: substring/prefix + plural normalization + simple edit-distance (typo tolerance)
- Results: top 10 ranked; includes label, url, meta, and optional thumbnail
- Freshness: index is warmed and rebuilt via a Shopify webhook and can also be rebuilt on deploy

## Fresh data flow
1. Any product create/update/delete in Shopify triggers the webhook pointing to `/.netlify/functions/shopify-search-webhook`.
2. The webhook validates the HMAC (when `SHOPIFY_WEBHOOK_SECRET` is set) and then warms the in‑memory index by calling `/.netlify/functions/search?warm=1`.
3. The search function will rebuild its cache if cold or when `rebuild=1` is passed.
4. On Netlify builds, you can optionally curl the warm endpoint post‑deploy:

   ```bash
   curl -s "https://<your-site>/.netlify/functions/search?warm=1" || true
   ```

## Config required
Set these environment variables in Netlify:
- SHOPIFY_STORE_DOMAIN (or SHOPIFY_STOREFRONT_DOMAIN)
- SHOPIFY_STOREFRONT_TOKEN (or SHOPIFY_STOREFRONT_API_TOKEN)
- SHOPIFY_API_VERSION (optional; defaults to 2024-07)
- SHOPIFY_WEBHOOK_SECRET (optional but recommended)

## Webhook setup (Shopify Admin)
- Admin → Settings → Notifications → Webhooks
- Create webhooks for Products create/update/delete
- Destination URL: `https://<your-site>/.netlify/functions/shopify-search-webhook`
- Format: JSON

Tip: You can also add webhooks for Collections if you change titles often.

## Adjusting result ranking
Open `netlify/functions/search.js` and edit:
- `scoreItem(q, item)`: tweak weights for exact/prefix/substring matches, typo bonus, and type bias
- To boost certain collections or pages, add a small constant to their score or insert them in `suggestions`

## Zero-result suggestions
When there are no matches, the UI shows up to 5 suggestions returned by the endpoint. Update the `suggestions` array in `search.js` to customize (e.g., Best Sellers, New Arrivals, Contact).

## Local testing
- Warm index: `/.netlify/functions/search?warm=1`
- Try queries: `/.netlify/functions/search?q=tee` or `?q=contact`

## Notes
- The function keeps an in-memory cache to respond in under ~200ms after warm. Functions can cold-start; the webhook keeps it warm.
- The product page now prefetches the full product (including variants) for instant sizes and zero layout shift on navigation from collections.
- The desktop product hero is wheel-locked to avoid image panning; page scroll continues normally.

