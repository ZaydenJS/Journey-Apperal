# Journeys Apparel Storefront

## Native Legacy Customer Accounts (on journeysapparel.com)

This site now uses Shopify Legacy Customer Accounts (email + password) with a native UI on our domain. All auth is handled via Netlify Functions that proxy the Shopify Storefront API.

### Session storage

- Upon login/register, we set an HttpOnly cookie `ja_customer_token` containing the Shopify customer access token (expires per Shopify policy).
- Client code never reads this cookie directly. Instead, it calls `/.netlify/functions/getCustomer` which validates the cookie and returns the current customer.
- For UX hints only, we set `localStorage.ja_logged_in = "true"` and cache the customer payload in `localStorage.shopify_user`. These are non-authoritative and cleared on logout.

### Endpoints

- `POST /.netlify/functions/customerLogin` → { token, customer }
- `POST /.netlify/functions/customerRegister` → { token, customer }
- `POST /.netlify/functions/customerRecover` → { ok }
- `POST /.netlify/functions/customerLogout` → clears cookie
- `GET /.netlify/functions/getCustomer` → { customer }
- `GET /.netlify/functions/customerOrders?first=20&after=...` → { orders, pageInfo }

### Run locally

1. Ensure env vars are set for Netlify functions (already used by product APIs):
   - SHOPIFY_STORE_DOMAIN
   - SHOPIFY_STOREFRONT_TOKEN
   - SHOPIFY_API_VERSION
2. Start dev server (example):
   - If using Netlify CLI: `netlify dev`
   - Or your existing local static server that serves `/.netlify/functions/*`

### Test flows

- Login: go to `/account/login.html`, submit email/password; you should land at `/account/index.html`.
- Register: `/account/register.html` creates the account and logs in.
- Forgot password: `/account/forgot.html` sends the reset email (uses Shopify customerRecover).
- Orders: `/account/orders.html` loads actual orders from Shopify via the customer token.
- Logout: `/account/logout.html` clears session and returns to login.

### Notes

- Profile icon in the header now links to `/account/login.html` when logged out and `/account/index.html` when logged in.
- All pages retain site header/footer and styling.

### Password reset (on-domain, reset-by-URL)

- Recover: `/account/forgot.html` triggers Shopify to send a reset email containing `reset_url`.
- The email link should land on our domain: `/account/reset.html?reset_url=<encoded>`.
- On that page, we call our Netlify function to perform `customerResetByUrl` with the new password and automatically log the user in, then redirect to `/account/index.html`.
- We also support legacy `id + token` params if present (same page handles both).

### Additional endpoints

- `GET /.netlify/functions/customerOrder?id=<gid|name|orderNumber>` → { order }
- `GET /.netlify/functions/customerAddresses` → { addresses: [], defaultAddressId }
- `POST /.netlify/functions/customerAddressCreate` → { address }
- `POST /.netlify/functions/customerAddressUpdate` → { address }
- `POST /.netlify/functions/customerAddressDelete` → { ok }
- `POST /.netlify/functions/customerDefaultAddressUpdate` → { customer }
- `POST /.netlify/functions/customerUpdate` → { customer }
- `POST /.netlify/functions/customerReset` → { ok } (supports reset-by-URL and legacy token modes)

### New/updated pages

- `/account/profile.html` → Edit first name, last name, phone (uses `customerUpdate`)
- `/account/addresses.html` → List/add/edit/delete addresses and set default
- `/account/orders.html` → Order history (unchanged URL, updated to use native APIs)
- `/account/order.html?id=...` → Dedicated order detail view using `customerOrder`
- `/account/reset.html` → On-domain password reset completion page

### How to test (quick)

1. Addresses

- Go to `/account/addresses.html` while logged in.
- Add a new address; optionally check "Set as default".
- Edit an address (prompt-based); delete an address; set default.

2. Profile

- Go to `/account/profile.html` and change first/last name or phone. Save and refresh; values persist.

3. Order detail

- From `/account/orders.html`, click an order to open `/account/order.html?id=...` and verify line items, addresses, and fulfillments render.

4. Reset-by-URL

- Trigger a recover via `/account/forgot.html`.
- From the email, open the reset link which should route to `/account/reset.html?reset_url=...` on this domain.
- Enter a new password; on success you should be logged in and redirected to the account dashboard.
