Passwordless Shopify Accounts (New Customer Accounts)

This site uses Shopify's new customer accounts (passwordless, 6‑digit code) as the only login. We redirect users to Shopify's hosted login and return them to our local account landing page.

Key links (hardcoded):

- Local account page: /account.html
- Login with return_url back to HOME with ?logged_in=1:
  https://shopify.com/94836293942/account/login?return_url=https://journeysapparel.com/?logged_in=1
- Logout with return to HOME:
  https://shopify.com/94836293942/account/logout?return_url=https://journeysapparel.com/

Where these are used:

- Header profile icon (all pages):
  - Signed out → links to the Login URL above
  - Signed in → links to /account.html
- /account.html decides state using localStorage('ja_logged_in') and URL/referrer. It renders:
  - Signed out → a Sign-in button (Login URL above)
  - Signed in → Rewards (/rewards.html), Orders (Shopify, new tab), Settings placeholder, and Sign out (returns to HOME)
- Legacy local routes (/account/login, /account/register, /account/reset) instantly redirect to the Shopify login URL above (with return to HOME and ?logged_in=1).
- Home page: when reached with ?logged_in=1, the flag is set and the query param is removed.

Updating URLs later:

- Update the Shopify login/logout URLs (in /account.html) and shop ID if it changes (94836293942).
- Header behavior is controlled by assets/account.js setHeaderProfileLink() and the 'ja_logged_in' flag logic.

Security note: This implementation intentionally does not expose secrets; Shopify handles authentication UI and session. The local "signed‑in" flag is a best‑effort UX signal and is cleared on explicit logout or after 24 hours.
