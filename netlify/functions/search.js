import { createShopifyClient, handleGraphQLResponse, createCachedApiResponse, createApiResponse, createErrorResponse } from "./utils/shopify.js";

// In-memory warm cache (best-effort; functions may cold start)
let CACHE = {
  builtAt: 0,
  products: [], // {id, handle, title, tags, vendor, productType, images[], variants[], options[]}
  collections: [], // {handle, title}
};

const ONE_MIN = 60 * 1000;

async function fetchAllProducts(client) {
  const first = 250; // cap for Storefront API call; page if needed later
  const query = `#graphql
    query ListProducts($first: Int!, $after: String) {
      products(first: $first, after: $after) {
        pageInfo { hasNextPage endCursor }
        edges {
          node {
            id handle title vendor productType tags
            images(first: 1) { edges { node { url altText } } }
            variants(first: 100) { edges { node { id title availableForSale selectedOptions { name value } sku: title } } }
            options { name values }
          }
        }
      }
    }
  `;
  let after = null;
  let items = [];
  for (let i = 0; i < 2; i++) { // fetch up to 500
    const resp = await client.request(query, { variables: { first, after } });
    const data = handleGraphQLResponse(resp);
    const edges = (data.products?.edges || []);
    items.push(
      ...edges.map((e) => ({
        id: e.node.id,
        handle: e.node.handle,
        title: e.node.title,
        vendor: e.node.vendor,
        productType: e.node.productType,
        tags: e.node.tags || [],
        images: (e.node.images?.edges || []).map((ie) => ie.node),
        variants: (e.node.variants?.edges || []).map((ve) => ve.node),
        options: e.node.options || [],
      }))
    );
    const pi = data.products?.pageInfo;
    if (pi?.hasNextPage && pi?.endCursor) after = pi.endCursor; else break;
  }
  return items;
}

async function fetchCollections(client) {
  const query = `#graphql
    query ListCollections($first: Int!) {
      collections(first: $first) {
        edges { node { handle title } }
      }
    }
  `;
  const resp = await client.request(query, { variables: { first: 50 } });
  const data = handleGraphQLResponse(resp);
  return (data.collections?.edges || []).map((e) => ({
    handle: e.node.handle,
    title: e.node.title,
  }));
}

function singularize(s) {
  if (!s) return s;
  return s.replace(/\b([a-z]{3,})s\b/i, "$1");
}

function tokenize(str) {
  return String(str || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-_]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function editDistance(a, b) {
  a = a.toLowerCase();
  b = b.toLowerCase();
  const dp = Array(a.length + 1)
    .fill(0)
    .map(() => Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1, // del
        dp[i][j - 1] + 1, // ins
        dp[i - 1][j - 1] + cost // sub
      );
    }
  }
  return dp[a.length][b.length];
}

function buildIndex(products, collections) {
  const items = [];
  const add = (label, url, meta = "", thumb = "", type = "item") =>
    items.push({ label, url, meta, thumb, type });

  // Static pages with support terms
  const pages = [
    { label: "Contact", url: "/contact.html", meta: "Support" },
    { label: "Support", url: "/contact.html", meta: "Support" },
    { label: "Help", url: "/contact.html", meta: "Support" },
    { label: "Returns", url: "/returns.html", meta: "Policy" },
    { label: "Shipping", url: "/shipping.html", meta: "Policy" },
    { label: "Policies", url: "/policies.html", meta: "Policy" },
  ];
  pages.forEach((p) => add(p.label, p.url, p.meta));

  // Collections
  (collections || []).forEach((c) => {
    add(c.title, `/collection.html?collection=${encodeURIComponent(c.handle)}`, "Collection", "", "collection");
  });

  // Products
  (products || []).forEach((p) => {
    const img = (p.images && p.images[0] && p.images[0].url) || "";
    const skuTerms = (p.variants || []).map((v) => String(v.title || "").toLowerCase());
    const tagTerms = (p.tags || []).map((t) => String(t).toLowerCase());
    const meta = [p.vendor, p.productType].filter(Boolean).join(" • ");
    add(p.title, `/product.html?slug=${encodeURIComponent(p.handle)}`, meta, img, "product");
    // Attach lightweight terms for better matching
    items[items.length - 1].__terms = [
      ...tokenize(p.title),
      ...skuTerms,
      ...tagTerms,
      String(p.vendor || "").toLowerCase(),
      String(p.productType || "").toLowerCase(),
    ];
  });

  return items;
}

function scoreItem(q, item) {
  const s = q.toLowerCase();
  const lbl = String(item.label || "").toLowerCase();
  const meta = String(item.meta || "").toLowerCase();
  const tokens = item.__terms || tokenize(item.label + " " + item.meta);
  const sSing = singularize(s);

  let score = 0;
  if (lbl === s) score += 100;
  if (lbl.startsWith(s)) score += 60;
  if (lbl.includes(s)) score += 40;
  if (tokens.some((t) => t === s)) score += 35;
  if (tokens.some((t) => t.startsWith(s))) score += 25;
  if (tokens.some((t) => t.includes(s))) score += 20;
  if (s !== sSing) {
    if (lbl.includes(sSing)) score += 10;
    if (tokens.some((t) => t.includes(sSing))) score += 8;
  }
  // Simple typo tolerance: best token distance <= 2
  let bestEd = Infinity;
  for (const t of [lbl, ...tokens]) {
    const ed = editDistance(s, t.slice(0, Math.max(t.length, s.length)));
    if (ed < bestEd) bestEd = ed;
  }
  if (bestEd <= 1) score += 25;
  else if (bestEd === 2) score += 10;

  // Prefer products over others when tie
  if (item.type === "product") score += 1;

  return score;
}

async function ensureIndex(force = false) {
  const now = Date.now();
  if (!force && CACHE.builtAt && now - CACHE.builtAt < 5 * ONE_MIN) {
    return;
  }
  const client = createShopifyClient();
  const [products, collections] = await Promise.all([
    fetchAllProducts(client),
    fetchCollections(client),
  ]);
  CACHE.products = products;
  CACHE.collections = collections;
  CACHE.builtAt = Date.now();
}

export const handler = async (event, context) => {
  // CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return createApiResponse({}, 200);
  }
  const qs = event.queryStringParameters || {};
  const q = (qs.q || "").trim();
  const limit = Math.min(50, Math.max(1, parseInt(qs.limit || "10", 10)));
  const warm = qs.warm === "1" || qs.warm === "true";
  const rebuild = qs.rebuild === "1" || qs.rebuild === "true";

  try {
    await ensureIndex(rebuild || warm);

    const suggestions = [
      { label: "New Arrivals", url: "/index.html#new-arrivals", meta: "Section" },
      { label: "Best Sellers", url: "/index.html#best-sellers", meta: "Section" },
      { label: "Contact", url: "/contact.html", meta: "Support" },
    ];

    if (!q) {
      return createCachedApiResponse({ items: [], suggestions }, 200, 60);
    }

    // Build lightweight items from cache
    const base = buildIndex(CACHE.products, CACHE.collections);

    // Score and rank
    const ranked = base
      .map((it) => ({ it, score: scoreItem(q, it) }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((r) => ({ label: r.it.label, url: r.it.url, meta: r.it.meta, thumb: r.it.thumb, type: r.it.type }));

    return createCachedApiResponse({ items: ranked, suggestions }, 200, 30);
  } catch (err) {
    return createErrorResponse(err.message || "Search error", 500);
  }
};

