/* Meta (Facebook) Pixel – Journey Apparel
 * Pixel ID: 1891291328316515
 * Loaded on every page via <script src="/assets/meta-pixel.js"></script> in <head>.
 */
(function () {
  var PIXEL_ID = "1891291328316515";

  // Optional debug:
  // - add ?pixel_debug=1 or set localStorage.ja_pixel_debug="1"
  var debug = false;
  try {
    var qs = new URLSearchParams(window.location.search || "");
    debug = qs.get("pixel_debug") === "1" || localStorage.getItem("ja_pixel_debug") === "1";
  } catch (_) {}

  function log() {
    if (!debug) return;
    try {
      // eslint-disable-next-line no-console
      console.log.apply(console, ["[MetaPixel]"].concat([].slice.call(arguments)));
    } catch (_) {}
  }

  // Meta Pixel base code (official snippet)
  // eslint-disable-next-line no-unused-vars
  !(function (f, b, e, v, n, t, s) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    n.queue = [];
    t = b.createElement(e);
    t.async = true;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");

  try {
    window.fbq("init", PIXEL_ID);
    window.fbq("track", "PageView");
    log("init + PageView", { pixelId: PIXEL_ID });
  } catch (e) {
    log("init failed", e);
  }

  function gidToNumeric(gid) {
    if (!gid) return "";
    var m = String(gid).match(/\/(\d+)$/) || String(gid).match(/ProductVariant\/(\d+)/);
    return m ? String(m[1]) : "";
  }

  function parsePrice(any) {
    if (typeof any === "number" && isFinite(any)) return any;
    if (!any) return null;
    var s = String(any).replace(/,/g, "");
    var m = s.match(/([0-9]+(?:\.[0-9]+)?)/);
    return m ? parseFloat(m[1]) : null;
  }

  function safeTrack(eventName, params, opts) {
    try {
      if (typeof window.fbq !== "function") return;
      window.fbq("track", eventName, params || {}, opts || undefined);
      log("track", eventName, params || {}, opts || {});
    } catch (e) {
      log("track failed", eventName, e);
    }
  }

  function genEventID(prefix) {
    return String(prefix || "evt") + ":" + Date.now() + ":" + Math.random().toString(16).slice(2);
  }

  function getCartItems() {
    try {
      var raw = localStorage.getItem("cartItems") || "[]";
      var arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch (_) {
      return [];
    }
  }

  function getCartLines() {
    try {
      var raw = localStorage.getItem("ja_cart_lines") || "[]";
      var arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch (_) {
      return [];
    }
  }

  function cartValueAndCurrency() {
    var items = getCartItems();
    var lines = getCartLines();
    var value = 0;
    var currency = "USD";

    // Build a lookup of price by variant for best-effort value calculation.
    var priceByVariant = {};
    try {
      items.forEach(function (it) {
        var vid = gidToNumeric(it && it.variantGid) || (it && it.variantGid) || "";
        var p = parsePrice(it && it.price);
        if (vid && p != null) priceByVariant[String(vid)] = p;
        if (it && typeof it.price === "string" && /\bGBP\b/i.test(it.price)) currency = "GBP";
        if (it && typeof it.price === "string" && /\bEUR\b/i.test(it.price)) currency = "EUR";
      });
    } catch (_) {}

    // Prefer quantities from ja_cart_lines (source of truth for permalink checkout)
    try {
      if (Array.isArray(lines) && lines.length) {
        lines.forEach(function (l) {
          var vid = gidToNumeric(l && l.variantGid) || (l && l.variantGid) || "";
          var qty = Math.max(1, Number(l && (l.quantity || l.qty) || 1));
          var p = vid ? priceByVariant[String(vid)] : null;
          if (p != null) value += p * qty;
        });
      } else {
        // Fallback: compute purely from cartItems
        items.forEach(function (it) {
          var qty = Math.max(1, Number(it && (it.qty || it.quantity) || 1));
          var p = parsePrice(it && it.price);
          if (p != null) value += p * qty;
        });
      }
    } catch (_) {}

    value = Math.round(value * 100) / 100;
    return { value: value > 0 ? value : null, currency: currency };
  }

  // Public helper used by script.js
  window.JourneyPixel = window.JourneyPixel || {};
  window.JourneyPixel.pixelId = PIXEL_ID;
  window.JourneyPixel.debug = debug;

  var __seenView = {};

  window.JourneyPixel.trackViewContent = function (product) {
    try {
      var key = (product && (product.id || product.handle || product.slug || product.title)) || "";
      if (key && __seenView[key]) return;
      if (key) __seenView[key] = 1;

      var value = null;
      var currency = "USD";
      try {
        value = parsePrice(product && product.priceRange && product.priceRange.minVariantPrice && product.priceRange.minVariantPrice.amount);
        currency =
          (product && product.priceRange && product.priceRange.minVariantPrice && product.priceRange.minVariantPrice.currencyCode) ||
          currency;
      } catch (_) {}

      safeTrack(
        "ViewContent",
        {
          content_ids: [gidToNumeric(product && product.id) || (product && product.id) || (product && product.handle) || ""],
          content_type: "product",
          content_name: (product && product.title) || "",
          value: value != null ? value : undefined,
          currency: currency,
        },
        { eventID: genEventID("ViewContent") }
      );
    } catch (_) {}
  };

  window.JourneyPixel.trackAddToCart = function (payload) {
    payload = payload || {};
    var id = gidToNumeric(payload.variantId || payload.productId) || payload.variantId || payload.productId || payload.sku || "";
    safeTrack(
      "AddToCart",
      {
        content_ids: id ? [id] : undefined,
        content_type: "product",
        content_name: payload.name || "",
        value: payload.value != null ? payload.value : undefined,
        currency: payload.currency || "USD",
        contents: id ? [{ id: id, quantity: Math.max(1, Number(payload.quantity || 1)) }] : undefined,
      },
      { eventID: genEventID("AddToCart") }
    );
  };

  window.JourneyPixel.trackInitiateCheckout = function () {
    var vc = cartValueAndCurrency();
    var items = getCartItems();
    var lines = getCartLines();
    var contents = [];
    try {
      if (Array.isArray(lines) && lines.length) {
        lines.forEach(function (l) {
          var id = gidToNumeric(l && l.variantGid) || (l && l.variantGid) || "";
          if (!id) return;
          contents.push({ id: id, quantity: Math.max(1, Number(l && (l.quantity || l.qty) || 1)) });
        });
      } else {
        items.forEach(function (it) {
          var id = gidToNumeric(it && it.variantGid) || (it && it.variantGid) || "";
          if (!id) return;
          contents.push({ id: id, quantity: Math.max(1, Number(it && it.qty || 1)) });
        });
      }
    } catch (_) {}

    safeTrack(
      "InitiateCheckout",
      {
        value: vc.value != null ? vc.value : undefined,
        currency: vc.currency || "USD",
        contents: contents.length ? contents : undefined,
      },
      { eventID: genEventID("InitiateCheckout") }
    );
  };
})();

