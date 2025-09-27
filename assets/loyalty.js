(function () {
  // Minimal Yotpo Loyalty helper for Free plan (sticky bar only)
  // - Identifies customer by email via localStorage("ja_email")
  // - Exposes helpers to set/clear email and re-identify
  // - Fails silently; polls up to ~20s for identify()

  var EMAIL_KEY = "ja_email";
  var POLL_MS = 50;
  var MAX_ATTEMPTS = Math.ceil(20000 / POLL_MS); // ~20s
  var didLog = false;
  var DEBUG = (function () {
    try {
      return location.search.indexOf("yotpo-debug=1") !== -1;
    } catch (_) {
      return false;
    }
  })();

  function logOnce() {
    if (didLog) return;
    didLog = true;
    try {
      var loaderOk = !!document.querySelector(
        'script[src*="cdn-widgetsrepository.yotpo.com/v1/loader"]'
      );
      var stickyOk = !!document.querySelector(
        '[data-yotpo-instance-id="1218367"]'
      );
      console.log("[Yotpo] loader present:", loaderOk);
      console.log("[Yotpo] sticky instance present:", stickyOk);
    } catch (_) {}
  }

  function getIdentify() {
    try {
      if (
        window.Yotpo &&
        window.Yotpo.Loyalty &&
        typeof window.Yotpo.Loyalty.identify === "function"
      )
        return window.Yotpo.Loyalty.identify;
    } catch (_) {}
    try {
      if (
        window.yotpoModules &&
        window.yotpoModules.loyalty &&
        typeof window.yotpoModules.loyalty.identify === "function"
      )
        return window.yotpoModules.loyalty.identify;
    } catch (_) {}
    try {
      if (
        window.yotpoLoyalty &&
        typeof window.yotpoLoyalty.identify === "function"
      )
        return window.yotpoLoyalty.identify;
    } catch (_) {}
    return null;
  }

  function currentEmail() {
    try {
      return localStorage.getItem(EMAIL_KEY) || "";
    } catch (_) {
      return "";
    }
  }

  function setEmail(email) {
    try {
      if (email) localStorage.setItem(EMAIL_KEY, String(email));
      else localStorage.removeItem(EMAIL_KEY);
    } catch (_) {}
  }

  function tryIdentify() {
    var email = currentEmail();
    var identify = getIdentify();
    if (!identify) return false;
    try {
      if (email) identify({ email: email });
      else identify({}); // identify as guest if supported
    } catch (_) {}
    return true;
  }

  function pollIdentify() {
    var attempts = 0;
    (function tick() {
      attempts++;
      if (tryIdentify() || attempts > MAX_ATTEMPTS) return;
      setTimeout(tick, POLL_MS);
    })();
  }

  // Expose helpers
  window.setYotpoCustomerEmail = function (email) {
    try {
      setEmail(email);
    } catch (_) {}
    if (DEBUG) {
      try {
        console.log("[Yotpo] identified as:", email);
      } catch (_) {}
    }
    // Rebuild SSO div with signed token and ensure loader order
    try {
      setupSSOFromSession();
    } catch (_) {}
  };
  window.clearYotpoCustomer = function () {
    try {
      setEmail("");
    } catch (_) {}
    try {
      removeSwellDiv();
    } catch (_) {}
    if (DEBUG) {
      try {
        console.log("[Yotpo] cleared (guest)");
      } catch (_) {}
    }
    tryIdentify() || pollIdentify();
  };
  window.reloadYotpo = function () {
    tryIdentify() || pollIdentify();
  };

  // --- SSO via Swell/Yotpo identification div + controlled loader injection ---
  var LOADER_URL =
    "https://cdn-widgetsrepository.yotpo.com/v1/loader/ayCQoNgVgsMXREbYl_jUOQ";
  var LOADER_INSERTED = false;

  function injectLoaderOnce() {
    if (LOADER_INSERTED) return;
    try {
      if (
        document.querySelector(
          'script[src*="cdn-widgetsrepository.yotpo.com/v1/loader"]'
        )
      ) {
        LOADER_INSERTED = true;
        return;
      }
      var s = document.createElement("script");
      s.src = LOADER_URL;
      s.async = true;
      document.body.appendChild(s);
      LOADER_INSERTED = true;
    } catch (_) {}
  }

  function ensureSwellDiv(data) {
    try {
      var el = document.getElementById("swell-customer-identification");
      if (!el) {
        el = document.createElement("div");
        el.id = "swell-customer-identification";
        document.body.insertBefore(el, document.body.firstChild || null);
      }
      if (data && data.email) el.setAttribute("data-email", data.email);
      if (data && data.id) el.setAttribute("data-id", data.id);
      if (data && data.token) el.setAttribute("data-token", data.token);
    } catch (_) {}
  }
  function removeSwellDiv() {
    try {
      var el = document.getElementById("swell-customer-identification");
      if (el && el.parentNode) el.parentNode.removeChild(el);
    } catch (_) {}
  }

  async function setupSSOFromSession() {
    // Build the SSO div (if we have an email), then inject loader to avoid races
    var email = "";
    var id = "";
    try {
      var u = window.JAAccount && JAAccount.getUser && JAAccount.getUser();
      email =
        (u && (u.email || u?.defaultAddress?.email)) || currentEmail() || "";
      id = (u && (u.id || u?.customerId || u?.shopifyId)) || "";
    } catch (_) {}

    if (email) {
      try {
        var res = await fetch("/.netlify/functions/yotpo-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email }),
          credentials: "omit",
          cache: "no-store",
        });
        if (res && res.ok) {
          var json = await res.json();
          ensureSwellDiv({ email: email, id: id, token: json && json.token });
        } else {
          // Fallback: still set div with email only
          ensureSwellDiv({ email: email });
        }
      } catch (_) {
        ensureSwellDiv({ email: email });
      }
    }

    injectLoaderOnce();
    tryIdentify() || pollIdentify();
  }

  // --- Guest CTA interception (route to Shopify login) ---
  var LOGIN_URL = "/account/login.html";
  var INTERCEPT_TERMS = [
    "join now",
    "join",
    "log in",
    "login",
    "sign in",
    "sign up",
    "create account",
    "create an account",
    "continue",
    "continue with",
  ];
  var __BOUND = new WeakSet();
  var __UPDATED = new WeakSet();

  function withinYotpo(el) {
    try {
      return !!(el.closest && el.closest('[class*="yotpo"], [id*="yotpo"]'));
    } catch (_) {
      return false;
    }
  }
  function matchesJoinText(el) {
    try {
      var t = (el.textContent || "").trim().toLowerCase();
      return (
        !!t &&
        INTERCEPT_TERMS.some(function (term) {
          return t.indexOf(term) !== -1;
        })
      );
    } catch (_) {
      return false;
    }
  }
  function updateGuestCopy(container) {
    if (!container || __UPDATED.has(container)) return;
    try {
      var msg =
        "Use your site account to access rewards. Log in or create your account — your rewards sync automatically.";
      var nodes = container.querySelectorAll("p,div,span,h1,h2,h3,h4");
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        var txt = (n.textContent || "").toLowerCase();
        if (
          INTERCEPT_TERMS.some(function (term) {
            return txt.indexOf(term) !== -1;
          })
        ) {
          n.textContent = msg;
          __UPDATED.add(container);
          if (DEBUG) {
            try {
              console.log("[Yotpo] updated guest copy");
            } catch (_) {}
          }
          break;
        }
      }
    } catch (_) {}
  }
  function bindInterceptors(root) {
    if (!root) return;
    var scope = root.querySelector ? root : document;
    var list = scope.querySelectorAll
      ? scope.querySelectorAll(
          'a,button,[role="button"],div[role="button"],div[data-automation*="button"]'
        )
      : [];
    list.forEach(function (el) {
      if (__BOUND.has(el)) return;
      if (!withinYotpo(el)) return;
      if (!matchesJoinText(el)) return;
      __BOUND.add(el);
      try {
        var container = el.closest('[class*="yotpo"], [id*="yotpo"]');
        updateGuestCopy(container);
      } catch (_) {}
      function interceptToShopify(e) {
        if (currentEmail()) return; // already identified
        try {
          e.preventDefault();
          e.stopPropagation();
        } catch (_) {}
        if (DEBUG) {
          try {
            console.log("[Yotpo] intercepted guest CTA →", LOGIN_URL);
          } catch (_) {}
        }
        try {
          location.href = LOGIN_URL;
        } catch (_) {}
      }
      el.addEventListener("click", interceptToShopify, true);
      el.addEventListener("mousedown", interceptToShopify, true);
      el.addEventListener("touchstart", interceptToShopify, true);
    });
  }
  function enforceSingleAccountUI(root) {
    // Hide/replace join prompts even if identified (defensive UI)
    try {
      var scope = root && root.querySelector ? root : document;
      var nodes = scope.querySelectorAll('a,button,[role="button"],p,div,span');
      nodes.forEach(function (n) {
        var t = (n.textContent || "").trim().toLowerCase();
        if (!t) return;
        if (
          INTERCEPT_TERMS.some(function (term) {
            return t.indexOf(term) !== -1;
          })
        ) {
          if (currentEmail()) {
            var msg = "You are signed in. Your rewards sync automatically.";
            if (n.tagName === "A" || n.tagName === "BUTTON") {
              n.style.pointerEvents = "none";
              n.setAttribute("aria-disabled", "true");
            }
            n.textContent = msg;

            // Single-account message only; no inline auto-join here
          }
        }
      });
    } catch (_) {}
  }

  function ensureGuestInterception() {
    // Intercept guest CTAs and auto-join when logged-in
    try {
      if (!currentEmail()) {
        bindInterceptors(document);
        updateGuestCopy(document.body);
      } else {
        autoJoinIfPrompted(document);
      }
    } catch (_) {}
    if (window.__yotpoObserver) return;
    try {
      window.__yotpoObserver = new MutationObserver(function (muts) {
        muts.forEach(function (m) {
          if (m.addedNodes)
            m.addedNodes.forEach(function (node) {
              if (node && node.querySelector) {
                if (!currentEmail()) {
                  bindInterceptors(node);
                  updateGuestCopy(node);
                } else {
                  autoJoinIfPrompted(node);
                }
              }
            });
        });
      });
      window.__yotpoObserver.observe(document.body, {
        childList: true,
        subtree: true,
      });

      // Auto-enroll helper: if logged-in and drawer shows a Join CTA, click it once
      var __AUTO_JOINED_ONCE = false;
      function autoJoinIfPrompted(root) {
        if (__AUTO_JOINED_ONCE) return;
        if (!currentEmail()) return;
        try {
          var scope = root && root.querySelector ? root : document;
          var list = scope.querySelectorAll(
            'a,button,[role="button"],div[role="button"],div[data-automation*="button"]'
          );
          for (var i = 0; i < list.length; i++) {
            var el = list[i];
            if (!withinYotpo(el)) continue;
            if (!matchesJoinText(el)) continue;
            __AUTO_JOINED_ONCE = true;
            if (DEBUG) {
              try {
                console.log("[Yotpo] auto-joining program (single account)");
              } catch (_) {}
            }
            try {
              el.click();
            } catch (_) {}
            break;
          }
        } catch (_) {}
      }
    } catch (_) {}
  }

  // Kick off on load (build SSO div first, then load Yotpo, then bind interceptors)
  (function init() {
    // Reconcile stored email from session if needed
    try {
      var u = window.JAAccount && JAAccount.getUser && JAAccount.getUser();
      var sessionEmail = (u && (u.email || u?.defaultAddress?.email)) || "";
      if (sessionEmail && sessionEmail !== currentEmail())
        setEmail(sessionEmail);
    } catch (_) {}

    setupSSOFromSession()
      .then(function () {
        if (DEBUG)
          try {
            console.log("[Yotpo] SSO setup complete");
          } catch (_) {}
        ensureGuestInterception();
        logOnce();
      })
      .catch(function () {
        ensureGuestInterception();
        logOnce();
      });
  })();
})();
