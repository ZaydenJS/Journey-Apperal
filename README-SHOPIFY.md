# Journey Apparel - Shopify Headless Storefront

This is a headless Shopify storefront built with HTML/CSS/JavaScript and deployed on Netlify.

## Setup Instructions

### 1. Shopify Configuration

Your Shopify store is already configured:
- **Store Domain**: `7196su-vk.myshopify.com`
- **Storefront API**: Enabled with required scopes
- **Collections**: Tops, Hoodies, Bottoms, Hats
- **Customer Accounts**: Enabled

### 2. Environment Variables

Set these environment variables in Netlify:

```
SHOPIFY_STORE_DOMAIN=7196su-vk.myshopify.com
SHOPIFY_STOREFRONT_TOKEN=your_actual_token_here
```

### 3. Deployment

1. Connect your repository to Netlify
2. Set build command: `npm run build` (or leave empty)
3. Set publish directory: `.` (root)
4. Add environment variables in Netlify dashboard
5. Deploy!

### 4. Features Implemented

#### ✅ Products & Collections
- Fetch products by collection
- Support filtering by product tags
- Dynamic product loading on homepage and collection pages
- Product detail pages with variants and add-to-cart

#### ✅ Cart & Checkout
- Add-to-cart functionality
- Cart management (create, update, remove items)
- Redirect to Shopify Checkout
- Cart persistence across sessions

#### ✅ Customer Accounts
- Customer registration and login
- Order history display
- Account management
- Secure token-based authentication

#### ✅ Collections & Categories
- **Tops** (tag: "Tops")
- **Hoodies** (tag: "Hoodies") 
- **Bottoms** (tag: "Bottoms")
- **Hats** (tag: "Hats")

#### 🔄 Ready for Integration
- **Mailchimp**: Popup and welcome automation slots ready
- **Smile.io**: Loyalty program integration points prepared
- **Judge.me**: Product review widget slots ready

### 5. API Endpoints

All Shopify calls go through Netlify Functions:

- `/.netlify/functions/listCollections` - Get all collections
- `/.netlify/functions/getCollection?handle=collection-name&tag=optional` - Get collection products
- `/.netlify/functions/getProduct?handle=product-handle` - Get single product
- `/.netlify/functions/createCart` - Create new cart
- `/.netlify/functions/addToCart` - Add items to cart
- `/.netlify/functions/updateCart` - Update cart items
- `/.netlify/functions/customerLogin` - Customer login
- `/.netlify/functions/customerRegister` - Customer registration
- `/.netlify/functions/getCustomer` - Get customer data

### 6. Frontend Integration

The frontend automatically loads products from Shopify:

- **Homepage**: New Arrivals and Best Sellers sections
- **Collection Pages**: Dynamic product grids with filtering
- **Product Pages**: Full product details with variants
- **Cart**: Persistent cart with Shopify checkout integration

### 7. Security

- No Shopify tokens exposed to client-side
- CORS restrictions on Netlify Functions
- Secure customer authentication
- Environment-based configuration

### 8. Testing

Use Shopify's Bogus Gateway for test orders:
- Test card: `4242 4242 4242 4242`
- Any future expiry date
- Any 3-digit CVC

### 9. Next Steps

1. **Add Real Products**: Upload your actual products to Shopify
2. **Configure Payment**: Set up PayPal/Shopify Payments
3. **Add Integrations**: Implement Mailchimp, Smile.io, Judge.me
4. **Customize Design**: Adjust styling to match your brand
5. **SEO Optimization**: Add meta tags and structured data

### 10. Support

For Shopify-specific issues:
- Check Shopify Admin → Settings → Apps and sales channels → Develop apps
- Verify Storefront API permissions
- Test API calls in Shopify GraphQL Admin API

For deployment issues:
- Check Netlify Functions logs
- Verify environment variables are set
- Test API endpoints directly
