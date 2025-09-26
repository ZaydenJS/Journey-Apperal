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

  // Kick off on load
  // Seed email from existing session if available
  try {
    if (!currentEmail() && window.JAAccount && JAAccount.getUser) {
      var u = JAAccount.getUser();
      if (u && u.email) setEmail(u.email);
    }
  } catch (_) {}
  logOnce();
  pollIdentify();
})();
