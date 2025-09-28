Passwordless Shopify Accounts (New Customer Accounts)

This site uses Shopify's new customer accounts (passwordless, 6‑digit code) as the only login. We redirect users to Shopify's hosted login and return them to our local account landing page.

Key links (hardcoded):
- Login (with return_url):
  https://shopify.com/94836293942/account/login?return_url=https%3A%2F%2Fjourneysapparel.com%2Faccount.html
- Logout (with return_url):
  https://shopify.com/94836293942/account/logout?return_url=https%3A%2F%2Fjourneysapparel.com%2F
- Local account page: /account.html

Where these are used:
- Header profile icon (all pages) links to the Login URL when signed out.
- When the lightweight signed‑in flag is present, the header icon opens a small menu with:
  - My Account → /account.html
  - Sign out → Logout URL (and clears the flag)
- Legacy routes (/account/login, /account/register, /account/reset) instantly redirect to the Login URL with return_url.

Updating the return_url later:
- Change RETURN_TO_ACCOUNT and RETURN_TO_HOME constants in assets/account.js, which will update header/menu behavior.
- Update hardcoded URLs in /account.html and in the small legacy redirect scripts in account/login.html, account/register.html, and account/forgot.html.

Security note: This implementation intentionally does not expose secrets; Shopify handles authentication UI and session. The local "signed‑in" flag is a best‑effort UX signal and is cleared on explicit logout or after 24 hours.
