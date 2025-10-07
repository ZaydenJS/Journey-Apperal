# Journey Apparel — Legacy Customer Accounts Setup Guide

## Overview

This guide explains how to configure the Journey Apparel website to work with Shopify Classic Customer Accounts (Legacy Accounts). All rewards functionality has been removed, and the authentication system now uses local login/register/forgot password pages that integrate with Shopify's Storefront API.

## What Has Been Changed

### 1. Rewards Functionality Removed
- ✅ Removed "Rewards" link from all page headers (desktop navigation)
- ✅ Removed "Rewards" link from mobile drawer navigation
- ✅ Deleted `rewards.html` page
- ✅ Removed "Join the Club" banner from homepage
- ✅ Removed rewards modal popup
- ✅ Updated footer text from "member rewards" to "special offers"
- ✅ Removed all Yotpo loyalty integration references

### 2. Profile Icon Behavior Updated
- ✅ Profile icon now redirects to `/account/login.html` when logged out
- ✅ Profile icon redirects to `/account.html` when logged in
- ✅ No longer redirects to Shopify.com URLs
- ✅ Logout now redirects to homepage instead of Shopify logout

### 3. Account Pages Implemented
- ✅ **Login Page** (`/account/login.html`) - Functional login form
- ✅ **Registration Page** (`/account/register.html`) - Functional account creation form
- ✅ **Forgot Password Page** (`/account/forgot.html`) - Functional password reset form
- ✅ All pages use consistent header and footer matching the main site design

### 4. Authentication System
- ✅ Implemented Shopify Storefront API integration for Classic Customer Accounts
- ✅ Login function with email/password authentication
- ✅ Registration function with first name, last name, email, and password
- ✅ Password recovery function to send reset emails
- ✅ Customer data fetching and storage in localStorage
- ✅ Session management with access tokens and expiry

## Required Configuration

### IMPORTANT: Update Shopify Credentials

You **MUST** update the following values in `assets/account.js` with your actual Shopify store credentials:

#### Lines to Update:

1. **Storefront Access Token** (appears in 4 places):
   ```javascript
   var STOREFRONT_TOKEN = "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"; // Replace with actual token
   ```
   
2. **Shop Domain** (appears in 4 places):
   ```javascript
   var SHOP_DOMAIN = "journeys-apparel.myshopify.com"; // Replace with actual domain
   ```

#### Where to Find These Values:

**Storefront Access Token:**
1. Go to your Shopify Admin
2. Navigate to **Settings** → **Apps and sales channels** → **Develop apps**
3. Create a new app or use an existing one
4. Under **API credentials**, find the **Storefront API access token**
5. Make sure the app has the following permissions:
   - `unauthenticated_read_customers`
   - `unauthenticated_write_customers`
   - `unauthenticated_read_customer_tags`

**Shop Domain:**
- Your Shopify store domain (e.g., `your-store.myshopify.com`)
- Found in your Shopify Admin URL

### Enable Classic Customer Accounts in Shopify

1. Go to **Settings** → **Customer accounts** in your Shopify Admin
2. Select **Classic customer accounts**
3. Enable **Accounts are optional** or **Accounts are required** based on your preference
4. Save changes

## How It Works

### Login Flow
1. User clicks profile icon → redirected to `/account/login.html`
2. User enters email and password
3. Form submits to `JourneyAuth.login(email, password)`
4. Function calls Shopify Storefront API `customerAccessTokenCreate` mutation
5. On success:
   - Access token and expiry stored in localStorage
   - Customer data fetched and stored
   - Login flag set (`ja_logged_in = true`)
   - User redirected to `/account.html`
6. On failure:
   - Error message displayed inline

### Registration Flow
1. User clicks "Create account" → redirected to `/account/register.html`
2. User enters first name, last name, email, and password
3. Form submits to `JourneyAuth.register(email, password, firstName, lastName)`
4. Function calls Shopify Storefront API `customerCreate` mutation
5. On success:
   - Automatically logs in the user (calls `login()`)
   - User redirected to `/account.html`
6. On failure:
   - Error message displayed inline (e.g., "Email already exists")

### Password Reset Flow
1. User clicks "Forgot password?" → redirected to `/account/forgot.html`
2. User enters email address
3. Form submits to `JourneyAuth.recover(email)`
4. Function calls Shopify Storefront API `customerRecover` mutation
5. Shopify sends password reset email to the customer
6. Success message displayed
7. User redirected back to login page after 1.5 seconds

### Logout Flow
1. User clicks "Sign out" in profile dropdown
2. Clears all authentication data from localStorage
3. Redirects to homepage (`/index.html`)

## Files Modified

### HTML Files
- `index.html` - Removed rewards links, banner, and modal
- `collection.html` - Removed rewards links
- `product.html` - Removed rewards links
- `shipping.html` - Updated footer text
- `returns.html` - Updated footer text
- `account/login.html` - Removed redirect, added functional login form
- `account/register.html` - Removed redirect, added functional registration form
- `account/forgot.html` - Already had correct implementation

### JavaScript Files
- `assets/account.js` - Complete rewrite of authentication functions for Classic Customer Accounts
- `script.js` - Removed rewards banner reference

### Files Deleted
- `rewards.html` - Completely removed

## Testing Checklist

Before going live, test the following:

### Login
- [ ] Can create a new account with valid email and password
- [ ] Cannot create account with existing email (shows error)
- [ ] Cannot create account with password < 5 characters (shows error)
- [ ] Can log in with correct credentials
- [ ] Cannot log in with incorrect credentials (shows error)
- [ ] Profile icon shows correct link when logged out
- [ ] Profile icon shows correct link when logged in

### Registration
- [ ] Registration form validates all required fields
- [ ] Successful registration auto-logs in and redirects to account page
- [ ] Error messages display correctly for invalid inputs

### Password Reset
- [ ] Can request password reset email
- [ ] Receives email from Shopify with reset link
- [ ] Reset link works and allows password change
- [ ] Can log in with new password

### Navigation
- [ ] No "Rewards" links appear anywhere on the site
- [ ] Profile icon redirects to `/account/login.html` when logged out
- [ ] Profile icon redirects to `/account.html` when logged in
- [ ] Logout redirects to homepage
- [ ] All account pages have consistent header and footer

## Troubleshooting

### "Could not sign in" Error
- Check that Storefront Access Token is correct
- Verify Shop Domain is correct
- Ensure Classic Customer Accounts are enabled in Shopify
- Check browser console for detailed error messages

### "Could not create account" Error
- Email may already be registered
- Password may be too short (minimum 5 characters)
- Check Shopify API permissions

### Password Reset Not Working
- Verify email address is registered
- Check spam folder for reset email
- Ensure Shopify email notifications are enabled

## Support

If you encounter issues:
1. Check browser console for error messages
2. Verify all credentials in `assets/account.js` are correct
3. Ensure Shopify Classic Customer Accounts are enabled
4. Test with a fresh browser session (clear cache and cookies)

## Next Steps

1. **Update credentials** in `assets/account.js` with your actual Shopify values
2. **Enable Classic Customer Accounts** in Shopify Admin
3. **Test thoroughly** using the checklist above
4. **Deploy** to your live site

---

**Note:** The placeholder credentials in `assets/account.js` will NOT work. You must replace them with your actual Shopify Storefront API credentials before the authentication system will function.

