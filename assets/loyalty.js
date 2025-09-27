(function () {
  // Yotpo Loyalty helper (sticky bar + rewards page)
  // - Identifies customer by Shopify profile (prefers email)
  // - Exposes helpers to set/clear profile and re-identify
  // - Fails silently; polls up to ~20s for identify()

  var EMAIL_KEY = "ja_email";
  var POLL_MS = 50;
  var MAX_ATTEMPTS = Math.ceil(20000 / POLL_MS); // ~20s
  var didLog = false;

  function logOnce() {
    if (didLog) return;
    didLog = true;
    try {
      var loaderOk = !!document.querySelector(
        'script[src*="cdn-widgetsrepository.yotpo.com/v1/loader"]'
      );
      var stickyOk = !!document.querySelector(
        '[data-yotpo-instance-id="1218368"]'
      );
      console.log("[Yotpo] loader present:", loaderOk);
      console.log("[Yotpo] loyalty instance present (1218368):", stickyOk);
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

  function getShopifyProfile() {
    try {
      if (window.JAAccount && typeof JAAccount.getUser === "function") {
        var u = JAAccount.getUser() || null;
        if (u && (u.email || (u.defaultAddress && u.defaultAddress.email))) {
          return {
            email:
              u.email || (u.defaultAddress && u.defaultAddress.email) || "",
            firstName: u.firstName || "",
            lastName: u.lastName || "",
            id: u.id || "",
          };
        }
      }
    } catch (_) {}
    return null;
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

  function setCustomerProfile(profile) {
    try {
      if (profile && profile.email) {
        setEmail(profile.email);
        // Best-effort hint for Yotpo loader
        window.yotpoLoyalty = window.yotpoLoyalty || {};
        window.yotpoLoyalty.customer = {
          email: profile.email,
          firstName: profile.firstName || "",
          lastName: profile.lastName || "",
          externalId: profile.id || profile.externalId || "",
        };
      } else {
        setEmail("");
        if (window.yotpoLoyalty && window.yotpoLoyalty.customer) {
          try {
            delete window.yotpoLoyalty.customer;
          } catch (_) {}
        }
      }
    } catch (_) {}
    tryIdentify() || pollIdentify();
  }

  // Expose helpers
  window.setYotpoCustomerProfile = function (profile) {
    setCustomerProfile(profile || null);
  };
  window.setYotpoCustomerEmail = function (email) {
    setCustomerProfile(email ? { email: email } : null);
  };
  window.clearYotpoCustomer = function () {
    setCustomerProfile(null);
  };

  // Kick off on load
  // Seed from existing Shopify session if available
  try {
    var prof = getShopifyProfile();
    if (prof && !currentEmail()) setCustomerProfile(prof);
  } catch (_) {}
  logOnce();
  pollIdentify();
})();
