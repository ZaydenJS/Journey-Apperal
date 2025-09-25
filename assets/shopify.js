/* Minimal front-end client for our Netlify Shopify functions */
(function(){
  const API_BASE = '/.netlify/functions';

  async function request(path, { method = 'GET', body, headers } = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(headers || {})
      },
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'omit'
    });
    let data = null;
    try { data = await res.json(); } catch(_) { data = null; }
    if (!res.ok || (data && data.error)) {
      const msg = (data && data.error) || res.statusText || 'Request failed';
      const err = new Error(msg);
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data || {};
  }

  const shopifyAPI = {
    // Customers
    async customerRegister({ email, password, firstName, lastName, acceptsMarketing }){
      return request('/customerRegister', {
        method: 'POST',
        body: { email, password, firstName, lastName, acceptsMarketing: !!acceptsMarketing }
      });
    },
    async customerLogin(email, password){
      return request('/customerLogin', { method: 'POST', body: { email, password } });
    },
    async getCustomer(accessToken){
      return request(`/getCustomer?accessToken=${encodeURIComponent(accessToken)}`, { method: 'GET' });
    },

    // Cart
    async createCart(){
      return request('/createCart', { method: 'POST', body: {} });
    },
    async addToCart(cartId, lines){
      return request('/addToCart', { method: 'POST', body: { cartId, lines } });
    },
    async updateCart(cartId, lines){
      return request('/updateCart', { method: 'POST', body: { cartId, lines } });
    },

    // Catalog (used by product/collection pages)
    async getProduct(handle){
      return request(`/getProduct?handle=${encodeURIComponent(handle)}`, { method: 'GET' });
    },
    async getCollection(handle, tag){
      const qs = new URLSearchParams({ handle, ...(tag ? { tag } : {}) });
      return request(`/getCollection?${qs.toString()}`, { method: 'GET' });
    },
    async getCollections(){
      return request('/listCollections', { method: 'GET' });
    }
  };

  // Expose globally
  window.shopifyAPI = shopifyAPI;
})();

