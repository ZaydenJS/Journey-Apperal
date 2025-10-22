import {
  createShopifyClient,
  handleGraphQLResponse,
  createApiResponse,
  createErrorResponse,
} from "./utils/shopify.js";

const FUNCTION_REV = "customerOrders-2025-10-21-13";

function getTokenFromCookie(cookieHeader) {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(/;\s*/);
  for (const p of parts) {
    if (p.startsWith("ja_customer_token=")) {
      return decodeURIComponent(p.split("=")[1] || "");
    }
  }
  return null;
}

const clearCookieHeader = () => {
  const expires = new Date(0).toUTCString();
  return `ja_customer_token=; Path=/; HttpOnly; Secure; SameSite=Lax; Expires=${expires}`;
};

function cookieDomainFromHost(host) {
  try {
    const h = String(host || "")
      .split(":")[0]
      .toLowerCase();
    if (!h || h === "localhost" || /^(\d+\.){3}\d+$/.test(h)) return "";
    const base = h.replace(/^www\./, "");
    return `; Domain=.${base}`;
  } catch (_) {
    return "";
  }
}

function unauthorizedResponse(event, reason) {
  const res = createErrorResponse("Unauthorized", 401);
  const domainAttr = cookieDomainFromHost(
    event?.headers?.host || event?.headers?.Host
  );
  if (reason === "no-cookie") {
    res.headers["Set-Cookie"] = clearCookieHeader().replace(
      /; Expires=[^;]+/,
      (m) => `${m}${domainAttr}`
    );
  }
  if (reason) res.headers["X-Auth-Reason"] = String(reason);
  return res;
}

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return createApiResponse({}, 200);
  }
  if (event.httpMethod !== "GET") {
    return createErrorResponse("Method not allowed", 405);
  }

  const token = getTokenFromCookie(
    event.headers.cookie || event.headers.Cookie
  );
  if (!token) return unauthorizedResponse(event, "no-cookie");

  const params = event.queryStringParameters || {};
  const first = Math.max(1, Math.min(50, parseInt(params.first || "20", 10)));
  const after = params.after || null;

  try {
    const client = createShopifyClient();

    const ORDERS_QUERY = `
      query Orders($token: String!, $first: Int!, $after: String) {
        customer(customerAccessToken: $token) {
          orders(first: $first, after: $after, sortKey: CREATED_AT, reverse: true) {
            edges {
              cursor
              node {
                id
                orderNumber
                name
                processedAt
                createdAt
                financialStatus
                fulfillmentStatus
                totalPriceSet {
                  presentmentMoney { amount currencyCode }
                  shopMoney { amount currencyCode }
                }
                statusUrl
                lineItems(first: 50) {
                  edges {
                    node {
                      title
                      quantity
                      variant { title sku image { url } }
                    }
                  }
                }
              }
            }
            pageInfo { hasNextPage hasPreviousPage endCursor startCursor }
          }
        }
      }
    `;

    const RENEW_MUTATION = `
      mutation Renew($customerAccessToken: String!) {
        customerAccessTokenRenew(customerAccessToken: $customerAccessToken) {
          customerAccessToken { accessToken expiresAt }
          userErrors { field message }
        }
      }
    `;

    // For Admin fallback: fetch customer email and then Admin orders by email
    const ME_QUERY = `
      query GetMe($token: String!) {
        customer(customerAccessToken: $token) { id email }
      }
    `;

    const adminStoreDomain =
      process.env.SHOPIFY_STORE_DOMAIN ||
      process.env.SHOPIFY_ADMIN_STORE_DOMAIN ||
      process.env.SHOPIFY_STOREFRONT_DOMAIN;
    const adminToken =
      process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN ||
      process.env.SHOPIFY_ADMIN_TOKEN ||
      process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

    const adminEnabled = !!(adminStoreDomain && adminToken);

    // Enable Admin fallback/merge so orders appear even if Storefront association fails
    // You can toggle this with env var ENABLE_ADMIN_ORDERS=true
    const ENABLE_ADMIN =
      String(process.env.ENABLE_ADMIN_ORDERS || "true").toLowerCase() ===
      "true";

    let lastAdminError = null;
    let lastAdminQuery = null;
    let lastAdminCustomerId = null;
    let lastStatusMetrics = null;
    function addDebugHeaders(resp, extra) {
      try {
        resp.headers = resp.headers || {};
        resp.headers["X-Function-Rev"] = FUNCTION_REV;
        resp.headers["X-Admin-Enabled"] = String(adminEnabled && ENABLE_ADMIN);
        if (adminStoreDomain)
          resp.headers["X-Admin-Store"] = String(adminStoreDomain);
        if (lastAdminQuery)
          resp.headers["X-Admin-Query"] = String(lastAdminQuery).slice(0, 200);
        if (lastAdminCustomerId)
          resp.headers["X-Admin-CustomerId"] = String(lastAdminCustomerId);
        if (lastStatusMetrics) {
          const {
            attempted = 0,
            gqlHits = 0,
            restHits = 0,
          } = lastStatusMetrics || {};
          resp.headers["X-Status-Attempted"] = String(attempted);
          resp.headers["X-Status-GQL-Hits"] = String(gqlHits);
          resp.headers["X-Status-REST-Hits"] = String(restHits);
        }
        if (extra && typeof extra.storefrontCount === "number") {
          resp.headers["X-Storefront-Orders-Count"] = String(
            extra.storefrontCount
          );
        }
        if (extra && typeof extra.adminCount === "number") {
          resp.headers["X-Admin-Orders-Count"] = String(extra.adminCount);
        }
        if (extra && typeof extra.statusFilled === "number") {
          resp.headers["X-Status-Filled"] = String(extra.statusFilled);
        }
        if (extra && extra.email)
          resp.headers["X-Customer-Email"] = String(extra.email);
        if (lastAdminError || (extra && extra.error)) {
          resp.headers["X-Admin-Error"] = String(
            extra?.error || lastAdminError
          ).slice(0, 200);
        }
      } catch (_) {}
      return resp;
    }

    async function getCustomerIdentity(tok) {
      try {
        const resp = await client.request(ME_QUERY, {
          variables: { token: tok },
        });
        const d = handleGraphQLResponse(resp);
        return {
          id: d?.customer?.id || null,
          email: d?.customer?.email || null,
        };
      } catch (_) {
        return { id: null, email: null };
      }
    }

    async function adminGraphQL(query, variables) {
      if (!adminEnabled) {
        lastAdminError = "admin-not-enabled";
        return null;
      }
      const url = `https://${adminStoreDomain}/admin/api/2024-07/graphql.json`;
      try {
        lastAdminQuery = `AdminGQL:${
          variables && variables.id ? variables.id : ""
        }`;
      } catch (_) {}
      const r = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": adminToken,
        },
        body: JSON.stringify({ query, variables }),
      });
      const json = await r.json().catch(() => ({}));
      if (!r.ok || json.errors) {
        lastAdminError = String(
          json?.errors?.[0]?.message || r.statusText || "unknown-admin-error"
        );
        console.error("Admin GraphQL error", json.errors || r.statusText);
        return null;
      }
      lastAdminError = null;
      return json.data || null;
    }

    // --- Enrichments: statusUrl via Admin GraphQL/REST, images via Storefront ---
    function orderNumericIdFromGid(gid) {
      const m = String(gid || "").match(/Order\/(\d+)/);
      return m ? m[1] : null;
    }

    async function adminRestGetOrderStatusUrl(orderNumericId) {
      if (!adminEnabled) return null;
      try {
        const url = `https://${adminStoreDomain}/admin/api/2024-07/orders/${orderNumericId}.json?fields=order_status_url`;
        const r = await fetch(url, {
          method: "GET",
          headers: { "X-Shopify-Access-Token": adminToken },
        });
        const json = await r.json().catch(() => ({}));
        if (!r.ok) return null;
        return json?.order?.order_status_url || null;
      } catch (_) {
        return null;
      }
    }

    async function adminGqlGetOrderStatusUrl(orderGid) {
      try {
        const data = await adminGraphQL(ADMIN_ORDER_STATUS_QUERY, {
          id: orderGid,
        });
        return data?.order?.statusPageUrl || null;
      } catch (_) {
        return null;
      }
    }

    async function fillAdminStatusUrls(arr) {
      try {
        let attempted = 0;
        let gqlHits = 0;
        let restHits = 0;
        const out = await Promise.all(
          (arr || []).map(async (o) => {
            if (!o || o.statusUrl) return o;
            attempted++;
            const numId = orderNumericIdFromGid(o.id);
            try {
              // Try Admin GraphQL regardless of numeric id availability
              const suGql = await adminGqlGetOrderStatusUrl(o.id);
              let su = suGql;
              if (suGql) gqlHits++;
              // If GQL did not return, and we have a numeric id, try REST fallback
              if (!su && numId) {
                const suRest = await adminRestGetOrderStatusUrl(numId);
                if (suRest) restHits++;
                su = suRest;
              }
              if (su) o.statusUrl = su;
            } catch (_) {}
            return o;
          })
        );
        lastStatusMetrics = { attempted, gqlHits, restHits };
        return out;
      } catch (_) {
        lastStatusMetrics = { attempted: 0, gqlHits: 0, restHits: 0 };
        return arr || [];
      }
    }

    const PRODUCT_SEARCH = `
	      query ProdByTitle($q: String!) {
	        products(first: 1, query: $q) {
	          edges { node { featuredImage { url } images(first: 1) { edges { node { url } } } } }
	        }
	      }
	    `;

    function baseProductTitle(raw) {
      const t = String(raw || "").trim();
      if (!t) return "";
      let b = t.split(" - ")[0];
      b = b.split(" – ")[0];
      b = b.split("(")[0];
      b = b.split(",")[0];
      return b.trim();
    }

    async function fillLineItemImagesViaStorefront(client, orders) {
      try {
        if (!orders || !orders.length) return orders || [];
        const titleToImage = new Map();
        for (const o of orders) {
          for (const li of o.items || []) {
            const hasImg = !!li?.variant?.image?.url;
            const base = baseProductTitle(li?.title);
            if (hasImg || !base || titleToImage.has(base)) continue;
            try {
              const resp = await client.request(PRODUCT_SEARCH, {
                variables: { q: base },
              });
              const d = handleGraphQLResponse(resp);
              const prod = d?.products?.edges?.[0]?.node || null;
              const imgUrl =
                prod?.featuredImage?.url ||
                prod?.images?.edges?.[0]?.node?.url ||
                "";
              if (imgUrl) titleToImage.set(base, imgUrl);
            } catch (_) {}
          }
        }
        for (const o of orders) {
          for (const li of o.items || []) {
            if (
              li &&
              (!li.variant || !li.variant.image || !li.variant.image.url)
            ) {
              const base = baseProductTitle(li?.title);
              const url = titleToImage.get(base);
              if (url) {
                li.variant = li.variant || {};
                li.variant.image = li.variant.image || {};
                li.variant.image.url = url;
              }
            }
          }
        }
        return orders;
      } catch (_) {
        return orders || [];
      }
    }

    const ADMIN_ORDERS_QUERY = `
      query AdminOrders($q: String!, $first: Int!) {
        orders(first: $first, query: $q, sortKey: CREATED_AT, reverse: true) {
          edges {
            node {
              id
              name
              processedAt
              createdAt
              displayFinancialStatus
              displayFulfillmentStatus
              currentTotalPriceSet { shopMoney { amount currencyCode } }
              lineItems(first: 50) {
                edges {
                  node {
                    name
                    quantity
                  }
                }
              }
            }
          }
        }
      }
    `;

    const ADMIN_CUSTOMER_BY_EMAIL = `
      query AdminCustomerByEmail($q: String!) {
        customers(first: 1, query: $q) {
          edges { node { id email } }
        }
      }
    `;

    const ADMIN_ORDER_STATUS_QUERY = `
      query AdminOrderStatus($id: ID!) {
        order(id: $id) { statusPageUrl }
      }
    `;

    function customerNumericIdFromGid(gid) {
      const m = String(gid || "").match(/Customer\/(\d+)/);
      return m ? m[1] : null;
    }

    async function fetchAdminOrders(customerId, email, limit) {
      // Try by customer_id first if available (does not require protected customer data)
      if (customerId) {
        lastAdminCustomerId = customerId;
        lastAdminQuery = `customer_id:${customerId}`;
        const data = await adminGraphQL(ADMIN_ORDERS_QUERY, {
          q: lastAdminQuery,
          first: limit,
        });
        const conn = data?.orders;
        const edges = conn?.edges || [];
        const mapped = edges.map(({ node }) => ({
          id: node.id,
          name: node.name,
          orderNumber:
            Number.parseInt(String(node.name || "").replace(/[^0-9]/g, "")) ||
            null,
          date: node.processedAt || node.createdAt,
          financialStatus: node.displayFinancialStatus,
          fulfillmentStatus: node.displayFulfillmentStatus,
          total: node.currentTotalPriceSet?.shopMoney || null,
          statusUrl: null,
          items:
            (node.lineItems?.edges || []).map((e) => ({
              title: e.node?.name || "",
              quantity: e.node?.quantity || 0,
              variant: {
                title: e.node?.variant?.title || "",
                sku: e.node?.variant?.sku || "",
                image: { url: e.node?.variant?.image?.url || "" },
              },
            })) || [],
        }));
        if (mapped.length) return mapped;
      }

      // Fallback to searching by email (works without protected customer data)
      if (email) {
        lastAdminQuery = `email:${email}`;
        const data2 = await adminGraphQL(ADMIN_ORDERS_QUERY, {
          q: lastAdminQuery,
          first: limit,
        });
        const conn2 = data2?.orders;
        const edges2 = conn2?.edges || [];
        return edges2.map(({ node }) => ({
          id: node.id,
          name: node.name,
          orderNumber:
            Number.parseInt(String(node.name || "").replace(/[^0-9]/g, "")) ||
            null,
          date: node.processedAt || node.createdAt,
          financialStatus: node.displayFinancialStatus,
          fulfillmentStatus: node.displayFulfillmentStatus,
          total: node.currentTotalPriceSet?.shopMoney || null,
          statusUrl: null,
          items:
            (node.lineItems?.edges || []).map((e) => ({
              title: e.node?.name || "",
              quantity: e.node?.quantity || 0,
              variant: {
                title: e.node?.variant?.title || "",
                sku: e.node?.variant?.sku || "",
                image: { url: e.node?.variant?.image?.url || "" },
              },
            })) || [],
        }));
      }

      return [];
    }

    async function fetchOrdersWith(tokenValue) {
      const resp = await client.request(ORDERS_QUERY, {
        variables: { token: tokenValue, first, after },
      });
      const data = handleGraphQLResponse(resp);
      return data;
    }

    let data = await fetchOrdersWith(token);
    if (!data || !data.customer) {
      // Try to renew an expired token and retry once
      try {
        const renewResp = await client.request(RENEW_MUTATION, {
          variables: { customerAccessToken: token },
        });
        const renewData =
          handleGraphQLResponse(renewResp).customerAccessTokenRenew;
        const newTok = renewData?.customerAccessToken?.accessToken || null;
        const newExp = renewData?.customerAccessToken?.expiresAt || null;
        if (newTok && newExp) {
          data = await fetchOrdersWith(newTok);
          const ordersConn = data.customer?.orders;
          let orders = ordersConn
            ? ordersConn.edges.map(({ node }) => ({
                id: node.id,
                name: node.name,
                orderNumber: node.orderNumber,
                date: node.processedAt || node.createdAt,
                financialStatus: node.financialStatus,
                fulfillmentStatus: node.fulfillmentStatus,
                total:
                  node.totalPriceSet?.presentmentMoney ||
                  node.totalPriceSet?.shopMoney ||
                  null,
                statusUrl: node.statusUrl || null,
                items: (node.lineItems?.edges || []).map((e) => e.node) || [],
              }))
            : [];

          // Merge Admin orders to include any that Storefront doesn't expose (dedupe by orderNumber)
          if (ENABLE_ADMIN && adminToken && adminStoreDomain) {
            try {
              const ident = await getCustomerIdentity(newTok);
              const adminOrders = await fetchAdminOrders(
                customerNumericIdFromGid(ident?.id),
                ident?.email,
                first
              );
              if (adminOrders && adminOrders.length) {
                const byNumber = new Map();
                // Prefer Storefront payload when overlapping
                [...orders, ...adminOrders].forEach((o) => {
                  if (!byNumber.has(o.orderNumber))
                    byNumber.set(o.orderNumber, o);
                });
                orders = Array.from(byNumber.values())
                  .sort((a, b) => {
                    const da = a?.date ? new Date(a.date).getTime() : 0;
                    const db = b?.date ? new Date(b.date).getTime() : 0;
                    return db - da;
                  })
                  .slice(0, first);
              }
            } catch (_) {}
          }

          // Admin fallback if no orders found after renewal
          if (
            (!orders || orders.length === 0) &&
            ENABLE_ADMIN &&
            adminToken &&
            adminStoreDomain
          ) {
            try {
              const ident = await getCustomerIdentity(newTok);
              const adminOrders = await fetchAdminOrders(
                customerNumericIdFromGid(ident?.id),
                ident?.email,
                first
              );
              if (adminOrders && adminOrders.length) {
                orders = await fillAdminStatusUrls(adminOrders);
                orders = await fillLineItemImagesViaStorefront(client, orders);
                const res2 = createApiResponse({ orders, pageInfo: {} }, 200);
                res2.headers["X-Orders-Source"] = "admin";
                const expires2 = new Date(newExp).toUTCString();
                res2.headers[
                  "Set-Cookie"
                ] = `ja_customer_token=${encodeURIComponent(
                  newTok
                )}; Path=/; HttpOnly; Secure; SameSite=Lax; Expires=${expires2}${cookieDomainFromHost(
                  event.headers.host || event.headers.Host
                )}`;
                return addDebugHeaders(res2, {
                  adminCount: orders.length,
                  email: ident?.email,
                  storefrontCount: 0,
                });
              }
            } catch (_) {}
          }

          const res = createApiResponse(
            { orders, pageInfo: ordersConn?.pageInfo || {} },
            200
          );
          res.headers["X-Orders-Source"] = "storefront";
          // Refresh cookie with renewed token
          const expires = new Date(newExp).toUTCString();
          res.headers["Set-Cookie"] = `ja_customer_token=${encodeURIComponent(
            newTok
          )}; Path=/; HttpOnly; Secure; SameSite=Lax; Expires=${expires}${cookieDomainFromHost(
            event.headers.host || event.headers.Host
          )}`;
          return addDebugHeaders(res, { storefrontCount: orders.length });
        }
      } catch (_) {}
      // If Storefront couldn't load the customer at all, still try Admin fallback by email
      if (ENABLE_ADMIN && adminToken && adminStoreDomain) {
        try {
          const ident = await getCustomerIdentity(token);
          const adminOrders = await fetchAdminOrders(
            customerNumericIdFromGid(ident?.id),
            ident?.email,
            first
          );
          if (adminOrders && adminOrders.length) {
            const enriched = await fillAdminStatusUrls(adminOrders);
            const withImages = await fillLineItemImagesViaStorefront(
              client,
              enriched
            );
            const r = createApiResponse(
              { orders: withImages, pageInfo: {} },
              200
            );
            r.headers["X-Orders-Source"] = "admin";
            return addDebugHeaders(r, {
              adminCount: withImages.length,
              email: ident?.email,
              storefrontCount: 0,
              statusFilled: withImages.filter((o) => !!o.statusUrl).length,
            });
          }
        } catch (_) {}
      }
      const r = createApiResponse({ orders: [], pageInfo: {} }, 200);
      r.headers["X-Orders-Source"] = "none";
      r.headers["X-Auth-Reason"] = "no-customer-or-orders";
      return addDebugHeaders(r, { storefrontCount: 0, adminCount: 0 });
    }

    const ordersConn = data.customer?.orders;
    let orders = ordersConn
      ? ordersConn.edges.map(({ node }) => ({
          id: node.id,
          name: node.name,
          orderNumber: node.orderNumber,
          date: node.processedAt || node.createdAt,
          financialStatus: node.financialStatus,
          fulfillmentStatus: node.fulfillmentStatus,
          total:
            node.totalPriceSet?.presentmentMoney ||
            node.totalPriceSet?.shopMoney ||
            null,
          statusUrl: node.statusUrl || null,
          items: (node.lineItems?.edges || []).map((e) => e.node) || [],
        }))
      : [];

    // Merge Admin orders to include any that Storefront doesn't expose (dedupe by orderNumber)
    if (ENABLE_ADMIN && adminToken && adminStoreDomain) {
      try {
        const ident = await getCustomerIdentity(token);
        const adminOrders = await fetchAdminOrders(
          customerNumericIdFromGid(ident?.id),
          ident?.email,
          first
        );
        if (adminOrders && adminOrders.length) {
          const byNumber = new Map();
          // Prefer Storefront payload when overlapping
          [...orders, ...adminOrders].forEach((o) => {
            if (!byNumber.has(o.orderNumber)) byNumber.set(o.orderNumber, o);
          });
          orders = Array.from(byNumber.values())
            .sort((a, b) => {
              const da = a?.date ? new Date(a.date).getTime() : 0;
              const db = b?.date ? new Date(b.date).getTime() : 0;
              return db - da;
            })
            .slice(0, first);
        }
      } catch (_) {}
    }

    // Admin fallback if Storefront returns no orders
    if (
      (!orders || orders.length === 0) &&
      ENABLE_ADMIN &&
      adminToken &&
      adminStoreDomain
    ) {
      try {
        const ident = await getCustomerIdentity(token);
        const adminOrders = await fetchAdminOrders(
          customerNumericIdFromGid(ident?.id),
          ident?.email,
          first
        );
        if (adminOrders && adminOrders.length) {
          const enriched2 = await fillAdminStatusUrls(adminOrders);
          const withImages2 = await fillLineItemImagesViaStorefront(
            client,
            enriched2
          );
          const r = createApiResponse(
            { orders: withImages2, pageInfo: {} },
            200
          );
          r.headers["X-Orders-Source"] = "admin";
          return addDebugHeaders(r, {
            adminCount: withImages2.length,
            statusFilled: withImages2.filter((o) => !!o.statusUrl).length,
          });
        }
      } catch (_) {}
    }

    // Final enrich: ensure statusUrl and images are present without changing order list
    orders = await fillAdminStatusUrls(orders);
    orders = await fillLineItemImagesViaStorefront(client, orders);

    const out = createApiResponse(
      { orders, pageInfo: ordersConn?.pageInfo || {} },
      200
    );
    out.headers["X-Orders-Source"] = "storefront";
    return addDebugHeaders(out, {
      storefrontCount: orders.length,
      statusFilled: orders.filter((o) => !!o.statusUrl).length,
    });
  } catch (err) {
    return createErrorResponse(err.message || "Failed to load orders", 500);
  }
};
