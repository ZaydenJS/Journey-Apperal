# Checkout Redirect Fix - Deployment Guide

## Overview
This fix ensures that all checkout redirects use the proper Shopify checkout host (`7196su-vk.myshopify.com`) instead of the headless storefront domain (`journeysapparel.com`).

## Environment Variables Required

Add these environment variables to your Netlify site:

### Required Variables
```
SHOPIFY_CHECKOUT_HOST=7196su-vk.myshopify.com
SHOPIFY_STOREFRONT_DOMAIN=7196su-vk.myshopify.com
SHOPIFY_STOREFRONT_API_TOKEN=your_actual_token_here
SHOPIFY_API_VERSION=2024-07
DEFAULT_COUNTRY_CODE=AU
```

### How to Add Environment Variables in Netlify

1. Go to your Netlify site dashboard
2. Navigate to **Site settings** → **Environment variables**
3. Click **Add a variable** for each of the above
4. Set the **Scopes** to "All deploy contexts" and "All branches"
5. Click **Save**

## Files Changed

### New Files Created:
- `assets/checkout-utils.js` - Checkout URL normalization utilities
- `assets/env-config.js` - Client-side environment configuration
- `_redirects` - Netlify SPA fallback configuration

### Files Modified:
- `assets/cart.js` - Updated `goToCheckout()` method with URL normalization
- `script.js` - Updated checkout button handlers
- `index.html` - Added new script includes
- `collection.html` - Added new script includes  
- `product.html` - Added new script includes
- `.env.example` - Added `SHOPIFY_CHECKOUT_HOST`
- `netlify/functions/utils/shopify.js` - Added checkout host utility

## How It Works

1. **URL Normalization**: The `CheckoutUtils` class normalizes any checkout URL to use the correct Shopify host
2. **Security**: Only allows redirects to known Shopify domains (allowlist approach)
3. **Fallback**: If checkout URL is invalid, recreates cart from snapshot and retries
4. **Logging**: Console logs show the final redirect hostname for verification
5. **Error Handling**: Graceful error messages for users if checkout fails

## Testing

### Expected Behavior:
- ✅ Clicking "Proceed to Checkout" opens `https://7196su-vk.myshopify.com/cart/c/...`
- ✅ Never redirects to `journeysapparel.com/cart/...`
- ✅ Works in normal and incognito sessions
- ✅ Shows friendly error messages if cart is empty/expired

### Manual Testing Steps:
1. Open the site in a browser
2. Add items to cart
3. Click "Proceed to Checkout"
4. Verify the URL starts with `https://7196su-vk.myshopify.com/cart/c/`
5. Check browser console for checkout URL logs

### Console Verification:
Look for these console messages:
```
Using checkout host from SHOPIFY_CHECKOUT_HOST: 7196su-vk.myshopify.com
Final checkout redirect hostname: 7196su-vk.myshopify.com
Full checkout URL: https://7196su-vk.myshopify.com/cart/c/...
```

## Deployment Steps

1. **Set Environment Variables** (see above)
2. **Deploy to Netlify**:
   ```bash
   git add .
   git commit -m "Fix checkout redirect to use Shopify host"
   git push origin main
   ```
3. **Verify Deployment**:
   - Check that `_redirects` file is in the published directory
   - Test checkout flow on the live site
   - Verify environment variables are loaded correctly

## Troubleshooting

### Issue: Still redirecting to journeysapparel.com
- **Solution**: Check that `SHOPIFY_CHECKOUT_HOST` environment variable is set correctly in Netlify
- **Verify**: Look for console log "Using checkout host from SHOPIFY_CHECKOUT_HOST: 7196su-vk.myshopify.com"

### Issue: "Checkout is unavailable" error
- **Solution**: Verify Shopify API credentials are correct
- **Check**: `SHOPIFY_STOREFRONT_API_TOKEN` and `SHOPIFY_STOREFRONT_DOMAIN` are set

### Issue: 404 errors on page refresh
- **Solution**: Ensure `_redirects` file is deployed correctly
- **Verify**: Check Netlify deploy logs for "_redirects file processed"

### Issue: Environment variables not available
- **Solution**: Clear browser cache and hard refresh
- **Check**: Console should show "Environment configuration loaded: {...}"

## Security Notes

- Only allows redirects to known Shopify domains
- Validates checkout URLs before redirecting
- Prevents open redirect vulnerabilities
- Uses HTTPS for all checkout URLs

## Support

If you encounter issues:
1. Check browser console for error messages
2. Verify environment variables in Netlify dashboard
3. Test in incognito mode to rule out cache issues
4. Check Netlify function logs for API errors
