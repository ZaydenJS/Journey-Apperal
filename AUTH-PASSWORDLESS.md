Passwordless Shopify Accounts (New Customer Accounts)

This site uses Shopify's new customer accounts (passwordless, 6‑digit code) as the only login. We redirect users to Shopify's hosted login and return them to our local account landing page.

Key links (hardcoded):

- Local account page (always used by the profile icon): /account.html
- Login with return_url back to /account.html?logged_in=1:
  https://shopify.com/94836293942/account/login?return_url=https://journeysapparel.com/account.html?logged_in=1
- Logout with return to home:
  https://shopify.com/94836293942/account/logout?return_url=https://journeysapparel.com/

Where these are used:

- Header profile icon (all pages) always links to /account.html (never directly to Shopify).
- /account.html decides state using localStorage('ja_logged_in') and URL/referrer. It renders either a Sign-in button (to the Login URL above) or the Signed-in actions (Rewards / Sign out).
- Legacy local routes (/account/login, /account/register, /account/reset) instantly redirect to /account.html.

Updating URLs later:

- Update the two Shopify URLs inside /account.html for login/logout.
- Header behavior is static (/account.html) via assets/account.js setHeaderProfileLink().

Security note: This implementation intentionally does not expose secrets; Shopify handles authentication UI and session. The local "signed‑in" flag is a best‑effort UX signal and is cleared on explicit logout or after 24 hours.
