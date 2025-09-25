/* Journey Apparel — Yotpo Loyalty integration (Free Plan)
 * Safe, idempotent helper that initializes the Yotpo Loyalty SDK, identifies
 * the current user by email (if known), exposes helpers, and never breaks the site.
 */
(function () {
  var API_KEY = "E6xIQzHz5VFAmpzWirYAZAtt";
  var EMAIL_KEY = "ja_email"; // persisted customer email
  var DISCOUNT_KEY = "yotpo_discount_code"; // latest generated discount code
  var INIT_TRIES = 0;
  var INIT_MAX_TRIES = 300; // ~150s max (300 * 500ms)
  var INIT_INTERVAL = 500;
  var inited = false;

  function getSDK() {
    try {
      // Try multiple commonly seen namespaces to be resilient across versions
      return (
        window.YotpoLoyalty ||
        (window.Yotpo && (window.Yotpo.Loyalty || window.Yotpo.loyalty)) ||
        window.yotpoLoyalty ||
        (window.yotpo && (window.yotpo.loyalty || window.yotpo.Loyalty)) ||
        window.swellAPI ||
        null
      );
    } catch (_) {
      return null;
    }
  }

  function whenSDKReady(cb) {
    (function wait() {
      var sdk = getSDK();
      if (sdk) return cb(sdk);
      if (INIT_TRIES++ > INIT_MAX_TRIES) return; // give up silently
      setTimeout(wait, INIT_INTERVAL);
    })();
  }

  function safeGetEmail() {
    try {
      return localStorage.getItem(EMAIL_KEY) || "";
    } catch (_) {
      return "";
    }
  }

  function identifyNow(email) {
    if (!email) return;
    whenSDKReady(function (sdk) {
      try {
        if (typeof sdk.identify === "function") sdk.identify({ email: email });
        else if (typeof sdk.setCustomer === "function")
          sdk.setCustomer({ email: email });
        else if (typeof sdk.customer === "function")
          sdk.customer({ email: email });
        else if (typeof sdk.setUser === "function")
          sdk.setUser({ email: email });
      } catch (_) {}
    });
  }

  function clearIdentityNow() {
    whenSDKReady(function (sdk) {
      try {
        if (typeof sdk.logout === "function") sdk.logout();
        else if (typeof sdk.reset === "function") sdk.reset();
        else if (typeof sdk.identify === "function")
          sdk.identify({ email: null });
      } catch (_) {}
    });
  }

  function init() {
    if (inited) return;
    whenSDKReady(function (sdk) {
      try {
        // Attempt common init signatures
        if (typeof sdk.init === "function") sdk.init({ apiKey: API_KEY });
        else if (typeof sdk.initialize === "function")
          sdk.initialize({ apiKey: API_KEY });
        else if (typeof sdk === "function") {
          try {
            sdk(API_KEY);
          } catch (_) {}
        }
        inited = true;
        var saved = safeGetEmail();
        if (saved) identifyNow(saved);
      } catch (_) {}
    });
  }

  // Expose helpers globally
  window.setYotpoCustomerEmail = function (email) {
    try {
      if (email) localStorage.setItem(EMAIL_KEY, String(email));
    } catch (_) {}
    identifyNow(email);
  };
  window.clearYotpoCustomer = function () {
    try {
      localStorage.removeItem(EMAIL_KEY);
    } catch (_) {}
    clearIdentityNow();
  };

  // Assist applying discount codes at checkout: capture any code hinted via postMessage
  window.setYotpoDiscountCode = function (code) {
    try {
      if (code) localStorage.setItem(DISCOUNT_KEY, String(code));
    } catch (_) {}
  };
  window.addEventListener("message", function (e) {
    try {
      var data = e.data;
      var code = null;
      if (data && typeof data === "object") {
        code =
          (data.coupon && (data.coupon.code || data.coupon)) ||
          data.code ||
          (data.payload && data.payload.code) ||
          null;
      } else if (typeof data === "string") {
        var m = data.match(/(coupon|code)[:=]\s*([A-Z0-9_-]{4,})/i);
        if (m) code = m[2];
      }
      if (code) window.setYotpoDiscountCode(code);
    } catch (_) {}
  });

  // Ensure a visible balance widget appears in the header across pages
  function ensureHeaderBalanceWidget() {
    try {
      var host =
        document.querySelector("header.header .nav-right") ||
        document.querySelector("header .nav-right");
      if (!host) return;
      if (
        host.querySelector('.yotpo-loyalty-widget[data-widget-type="balance"]')
      )
        return;
      var div = document.createElement("div");
      div.className = "yotpo-loyalty-widget";
      div.setAttribute("data-widget-type", "balance");
      div.style.marginLeft = "8px";
      var accountEl = host.querySelector("#headerProfileLink");
      if (accountEl && accountEl.parentNode === host) {
        accountEl.insertAdjacentElement("afterend", div);
      } else {
        host.appendChild(div);
      }
    } catch (_) {}
  }

  // Kick things off safely
  document.addEventListener("DOMContentLoaded", function () {
    ensureHeaderBalanceWidget();
    init();
    var saved = safeGetEmail();
    if (saved) identifyNow(saved);
  });
})();
