Journey Apparel — Account Hub (Hybrid)

This site uses Shopify New Customer Accounts (passwordless) for authentication and returns shoppers to our domain. The /account.html page acts as the branded hub for Rewards and quick access to Orders/Settings. For a best‑practice headless setup, the hub can also show inline summaries (recent orders, profile) using Netlify Functions that call Shopify’s Customer Account API without exposing secrets in the browser.

Endpoints added (serverless, no secrets checked into the repo):
- /.netlify/functions/account-me — profile summary (email/name)
- /.netlify/functions/account-orders?limit=5 — recent orders
- /.netlify/functions/loyalty-points — placeholder balance (replace with real logic)

Local behavior:
- Signed out: /account.html shows a “Sign in / Join” button (Shopify hosted login, return to HOME).
- Signed in: /account.html shows Rewards, Orders (Shopify in new tab), Settings placeholder, points line, and a preview of recent orders fetched from the endpoints above.

How to enable live Shopify data (Customer Account API):
1) In Shopify Admin, create a custom app for Customer Account API and enable the required scopes for reading customer and order summaries.
2) In Netlify site settings → Environment variables, add (do NOT commit secrets):
   - SHOPIFY_SHOP_DOMAIN=94836293942.myshopify.com
   - CUSTOMER_ACCOUNT_API_CLIENT_ID=...
   - CUSTOMER_ACCOUNT_API_CLIENT_SECRET=...
   - (any other values required by your OAuth flow)
3) Implement the OAuth exchange in the Netlify functions to verify the signed‑in customer and call Shopify’s Customer Account API. Until then, you can preview the UI using mocks by setting MOCK_ACCOUNT=1 in Netlify.

Changing return_url targets later:
- Login: assets/account.js (SHOPIFY_LOGIN_URL) — currently returns to HOME with ?logged_in=1
- Logout: used in account.html — returns to HOME

Notes:
- Rewards is intentionally kept local; Orders/Settings deep actions still open on Shopify (industry‑standard hybrid). You can expand the inline previews over time.

