Journey Apparel — Single-Login Rewards (Headless Shopify + Netlify)

This repo implements an industry-standard hybrid:
- Shopify New Customer Accounts (passwordless) for authentication
- A local Account hub (/account.html) for Rewards + quick links
- Customer points tracked in a Shopify customer metafield (Phase 1)

Environment variables (use exactly these names in Netlify):
- SHOP_ADMIN_TOKEN, SHOP_API_SECRET
- SHOPIFY_STORE_DOMAIN, SHOPIFY_STOREFRONT_TOKEN
- PUBLIC_SITE_DOMAIN (e.g., journeysapparel.com)
- LOYALTY_NAMESPACE=custom, LOYALTY_POINTS_KEY=loyalty_points
- EARN_RATE_POINTS_PER_AUD=1
- REDEEM_FIXED_POINTS=500, REDEEM_FIXED_AMOUNT=5, REDEEM_SHIP_POINTS=1000

Serverless functions (/.netlify/functions):
- ensure-metafield  → ensures the customer metafield definition exists (idempotent)
- webhook-orders-create  → adds points on order create (idempotent/guarded)
- webhook-refunds-create → subtracts points on refund
- register-webhooks      → upsert the two webhooks to current site domain

Client pages:
- /account.html — conditional UI, links to Rewards, Orders (new tab), Sign out
- /rewards.html — Phase 1 placeholder (balance and redemption to be added in Phase 2)

Header/profile behavior (already implemented in assets/account.js):
- If localStorage.ja_logged_in === "true" → link to /account.html
- Else → link to Shopify login with return_url to HOME + ?logged_in=1

How to run the one-off setup
1) Ensure env vars above are set on Netlify.
2) Ensure the metafield definition exists (once):
   curl -s https://$PUBLIC_SITE_DOMAIN/.netlify/functions/ensure-metafield | jq
3) Register/refresh webhooks (any time you change domain):
   curl -s https://$PUBLIC_SITE_DOMAIN/.netlify/functions/register-webhooks | tee docs/webhooks.json

QA checklist
1) ensure-metafield returns created/existed
2) Place a small real test order → metafield custom.loyalty_points increases by floor(order total * EARN_RATE_POINTS_PER_AUD)
3) Partially refund → points decrease by floor(refund amount)
4) Login flow → back to HOME (?logged_in=1), header shows signed-in; /account.html works
5) /rewards.html while logged in shows Phase 1 placeholder without errors

Notes
- No secrets are exposed client-side. Webhooks and metafields use Admin API via serverless only.
- You can preview mock inline account UI via the temporary functions account-me and account-orders (set MOCK_ACCOUNT=1) if desired for demos; not required for Phase 1.

