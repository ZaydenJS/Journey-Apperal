# Journey Apparel - Shopify Headless Storefront Deployment Guide

## 🚀 Quick Start

Your headless Shopify storefront is now ready for deployment! Here's what has been built:

### ✅ What's Implemented

1. **Complete Shopify Integration**
   - Storefront API client with caching
   - Product and collection loading
   - Cart management with Shopify checkout
   - Customer authentication and account management

2. **Frontend Updates**
   - Homepage loads real products from Shopify
   - Collection pages with dynamic filtering
   - Product pages with variant selection
   - Cart functionality with persistent storage

3. **Netlify Functions**
   - `listCollections` - Get all collections
   - `getCollection` - Get products by collection/tag
   - `getProduct` - Get single product details
   - `createCart` - Create new shopping cart
   - `addToCart` - Add items to cart
   - `updateCart` - Update cart quantities
   - `customerLogin` - Customer authentication
   - `customerRegister` - New customer registration
   - `getCustomer` - Get customer profile and orders

4. **Security Features**
   - No API tokens exposed to client
   - CORS protection on functions
   - Secure customer authentication
   - Environment-based configuration

## 📋 Deployment Steps

### 1. Set Up Netlify Account
1. Go to [netlify.com](https://netlify.com) and sign up/login
2. Connect your GitHub repository
3. Choose "Deploy from Git"

### 2. Configure Build Settings
- **Build command**: Leave empty (or `npm run build`)
- **Publish directory**: `.` (root directory)
- **Functions directory**: `netlify/functions` (auto-detected)

### 3. Set Environment Variables
In Netlify Dashboard → Site Settings → Environment Variables, add:

```
SHOPIFY_STORE_DOMAIN=7196su-vk.myshopify.com
SHOPIFY_STOREFRONT_TOKEN=your_actual_storefront_token
```

**⚠️ Important**: Replace `your_actual_storefront_token` with your real Shopify Storefront API token.

### 4. Deploy
Click "Deploy Site" - your site will be live in minutes!

## 🧪 Testing Your Deployment

### Test Page
Visit `/test-shopify.html` on your deployed site to test all integrations:
- Collections loading
- Product filtering by tags
- Cart creation and management
- Customer registration/login

### Manual Testing
1. **Homepage**: Should show real products in New Arrivals and Best Sellers
2. **Collection Pages**: Navigate to `/collection.html?category=Tops`
3. **Product Pages**: Click any product to see details and add to cart
4. **Cart**: Add items and proceed to Shopify checkout
5. **Account**: Register/login at `/account/login.html`

## 🛍️ Shopify Store Setup

### Required Collections
Make sure these collections exist in your Shopify admin:
- **Tops** (with products tagged "Tops")
- **Hoodies** (with products tagged "Hoodies")
- **Bottoms** (with products tagged "Bottoms")
- **Hats** (with products tagged "Hats")

### Storefront API Permissions
Verify these scopes are enabled in Shopify Admin → Apps → Develop apps:
- `unauthenticated_read_product_listings`
- `unauthenticated_read_product_tags`
- `unauthenticated_read_checkouts`
- `unauthenticated_write_checkouts`
- `unauthenticated_read_customers`
- `unauthenticated_write_customers`

## 🔧 Customization

### Adding New Collections
1. Create collection in Shopify Admin
2. Update navigation links in HTML files
3. Products will automatically load via API

### Styling Changes
- Main styles: `styles.css`
- Component-specific styles: Inline in HTML files
- Desktop overrides: `<style id="desktop-overrides">` blocks

### Adding Features
- **Mailchimp**: Integration points ready in code
- **Smile.io**: Loyalty program slots prepared
- **Judge.me**: Review widget areas marked

## 🚨 Troubleshooting

### Common Issues

**Products not loading:**
- Check environment variables are set correctly
- Verify Storefront API token has correct permissions
- Check Netlify Functions logs

**Cart not working:**
- Ensure Shopify checkout settings allow external domains
- Verify cart creation in Netlify Functions logs

**Customer login failing:**
- Check Customer Accounts are enabled in Shopify
- Verify customer registration is allowed

### Debug Tools
- **Netlify Functions logs**: Netlify Dashboard → Functions
- **Browser console**: Check for JavaScript errors
- **Test page**: Use `/test-shopify.html` for API testing

## 📈 Next Steps

### Immediate
1. **Add Real Products**: Upload your actual inventory to Shopify
2. **Configure Payments**: Set up PayPal/Shopify Payments
3. **Test Checkout**: Complete a test purchase

### Soon
1. **SEO Optimization**: Add meta tags and structured data
2. **Performance**: Optimize images and caching
3. **Analytics**: Add Google Analytics/Facebook Pixel

### Later
1. **Mailchimp Integration**: Newsletter signup and automation
2. **Loyalty Program**: Implement Smile.io points system
3. **Reviews**: Add Judge.me product reviews
4. **Advanced Features**: Wishlist, product recommendations

## 🆘 Support

### Shopify Issues
- Check Shopify Admin → Settings → Apps and sales channels
- Test GraphQL queries in Shopify GraphQL Admin API
- Verify API permissions and rate limits

### Netlify Issues
- Check build logs and function logs
- Verify environment variables
- Test functions directly via URL

### Code Issues
- All source code is documented
- API client has error handling and caching
- Frontend gracefully handles empty states

---

**🎉 Congratulations!** Your headless Shopify storefront is ready to go live. The integration is complete and production-ready.
