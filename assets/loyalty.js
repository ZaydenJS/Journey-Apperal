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
    tryIdentify() || pollIdentify();
  };
  window.clearYotpoCustomer = function () {
    try {
      setEmail("");
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

  // --- Guest CTA interception (route to Shopify login) ---
  var LOGIN_URL = "/account/login.html";
  var INTERCEPT_TERMS = [
    "join now",
    "log in",
    "login",
    "sign up",
    "create account",
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
      ? scope.querySelectorAll('a,button,[role="button"]')
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
      el.addEventListener(
        "click",
        function (e) {
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
        },
        true
      );
    });
  }
  function ensureGuestInterception() {
    if (currentEmail()) return; // only when guest
    try {
      bindInterceptors(document);
    } catch (_) {}
    if (window.__yotpoObserver) return;
    try {
      window.__yotpoObserver = new MutationObserver(function (muts) {
        if (currentEmail()) return;
        muts.forEach(function (m) {
          if (m.addedNodes)
            m.addedNodes.forEach(function (node) {
              if (node && node.querySelector) bindInterceptors(node);
            });
        });
      });
      window.__yotpoObserver.observe(document.body, {
        childList: true,
        subtree: true,
      });
    } catch (_) {}
  }

  // Kick off on load
  // Seed email from existing session if available (and reconcile with localStorage)
  try {
    var sessionEmail =
      (window.JAAccount &&
        JAAccount.getUser &&
        JAAccount.getUser() &&
        JAAccount.getUser().email) ||
      "";
    if (sessionEmail && sessionEmail !== currentEmail()) {
      setEmail(sessionEmail);
    }
  } catch (_) {}
  logOnce();
  pollIdentify();
  ensureGuestInterception();
})();
