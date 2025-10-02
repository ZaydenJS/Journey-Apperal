/* Journey Apparel — Account utilities with Shopify integration */
(function () {
  var AUTH_KEY = "shopify_access_token";
  var USER_KEY = "shopify_customer";
  var TOKEN_EXPIRY_KEY = "shopify_token_expiry";

  // Shopify New Customer Accounts URLs (passwordless) with return_url back to our site
  var RETURN_TO_ACCOUNT = "https://journeysapparel.com/account.html";
  var RETURN_TO_HOME = "https://journeysapparel.com/";
  var SHOPIFY_LOGIN_URL =
    "https://shopify.com/94836293942/account/login?return_url=" +
    encodeURIComponent(RETURN_TO_HOME + "?logged_in=1");
  // Local account landing page (when signed in)
  var SHOPIFY_ACCOUNT_URL = "/account.html";
  var SHOPIFY_LOGOUT_URL =
    "https://shopify.com/94836293942/account/logout?return_url=" +
    encodeURIComponent(RETURN_TO_HOME);

  // Lightweight signed-in signal (best-effort) with TTL
  var LOGIN_FLAG_KEY = "ja_logged_in_until";
  var LOGIN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
  function setLoginFlag() {
    try {
      localStorage.setItem(LOGIN_FLAG_KEY, String(Date.now() + LOGIN_TTL_MS));
    } catch (_) {}
  }
  function clearLoginFlag() {
    try {
      localStorage.removeItem(LOGIN_FLAG_KEY);
    } catch (_) {}
  }
  function isLoginFlagActive() {
    try {
      var v = localStorage.getItem(LOGIN_FLAG_KEY);
      return !!v && Number(v) > Date.now();
    } catch (_) {
      return false;
    }
  }

  function isAuthed() {
    try {
      var token = localStorage.getItem(AUTH_KEY);
      var expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
      if (!token || !expiry) return false;

      // Check if token is expired
      if (new Date(expiry) <= new Date()) {
        clearAuth();
        return false;
      }

      return true;
    } catch (_) {
      return false;
    }
  }

  function setAuth(accessToken, expiresAt, customer) {
    try {
      localStorage.setItem(AUTH_KEY, accessToken);
      localStorage.setItem(TOKEN_EXPIRY_KEY, expiresAt);
      localStorage.setItem(USER_KEY, JSON.stringify(customer));
    } catch (_) {}
  }

  function clearAuth() {
    try {
      localStorage.removeItem(AUTH_KEY);
      localStorage.removeItem(TOKEN_EXPIRY_KEY);
      localStorage.removeItem(USER_KEY);
    } catch (_) {}
  }

  function setUser(user) {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user || {}));
    } catch (_) {}
  }

  function setAuthed(val) {
    if (!val) {
      clearAuth();
    }
  }

  function getAccessToken() {
    try {
      return isAuthed() ? localStorage.getItem(AUTH_KEY) : null;
    } catch (_) {
      return null;
    }
  }

  function getUser() {
    try {
      var raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  }

  // Shopify Authentication Functions (client does not handle credentials)
  async function login() {
    console.warn("Use Shopify New Customer Accounts for authentication");
    try {
      window.location.href = SHOPIFY_LOGIN_URL;
    } catch (_) {
      location.href = SHOPIFY_LOGIN_URL;
    }
    return { redirected: true };
  }

  async function register() {
    console.warn("Use Shopify New Customer Accounts for registration");
    try {
      window.location.href = SHOPIFY_LOGIN_URL;
    } catch (_) {
      location.href = SHOPIFY_LOGIN_URL;
    }
    return { redirected: true };
  }

  async function recover() {
    console.warn("Use Shopify New Customer Accounts for passwordless recovery");
    try {
      window.location.href = SHOPIFY_LOGIN_URL;
    } catch (_) {
      location.href = SHOPIFY_LOGIN_URL;
    }
    return { redirected: true };
  }

  async function refreshCustomerData() {
    // Not available client-side with New Customer Accounts; rely on Shopify UI
    return null;
  }

  function logout() {
    clearAuth();
    clearLoginFlag();
    try {
      localStorage.removeItem("ja_logged_in");
    } catch (_) {}
    try {
      window.location.href = SHOPIFY_LOGOUT_URL;
    } catch (e) {
      location.href = SHOPIFY_LOGOUT_URL;
    }
  }

  // Update header profile icon link to login or account dashboard
  function setHeaderProfileLink() {
    var el = document.getElementById("headerProfileLink");
    if (!el) return;
    // Set header link based on signed-in flag
    var signed = false;
    try {
      signed = localStorage.getItem("ja_logged_in") === "true";
    } catch (_) {}
    if (signed) {
      el.setAttribute("href", "/account.html");
      el.setAttribute("title", "Account");
    } else {
      el.setAttribute("href", SHOPIFY_LOGIN_URL);
      el.setAttribute("title", "Sign in or Join");
    }
    el.onclick = null;
    return;

    // Ensure a profile menu exists (created once) for the signed-in state
    var menuId = "ja-profile-menu";
    var menu = document.getElementById(menuId);
    if (!menu) {
      menu = document.createElement("div");
      menu.id = menuId;
      menu.setAttribute("role", "menu");
      menu.style.position = "absolute";
      menu.style.minWidth = "160px";
      menu.style.background = "#fff";
      menu.style.border = "1px solid rgba(0,0,0,0.12)";
      menu.style.boxShadow = "0 12px 30px rgba(0,0,0,0.12)";
      menu.style.borderRadius = "8px";
      menu.style.padding = "6px";
      menu.style.display = "none";
      menu.style.zIndex = "1001";

      var myAcc = document.createElement("a");
      myAcc.href = SHOPIFY_ACCOUNT_URL;
      myAcc.textContent = "My Account";
      myAcc.style.display = "block";
      myAcc.style.padding = "10px 12px";
      myAcc.style.color = "#111";
      myAcc.style.textDecoration = "none";

      var signOut = document.createElement("a");
      signOut.href = SHOPIFY_LOGOUT_URL;
      signOut.textContent = "Sign out";
      signOut.style.display = "block";
      signOut.style.padding = "10px 12px";
      signOut.style.color = "#111";
      signOut.style.textDecoration = "none";
      signOut.addEventListener("click", function () {
        clearLoginFlag();
      });

      menu.appendChild(myAcc);
      menu.appendChild(signOut);
      document.body.appendChild(menu);

      document.addEventListener("click", function (e) {
        if (menu.style.display === "none") return;
        if (e.target === el || el.contains(e.target) || menu.contains(e.target))
          return;
        menu.style.display = "none";
      });
    }

    var signedIn = isLoginFlagActive();

    if (!signedIn) {
      // Signed out → link to Shopify login with return_url
      el.setAttribute("href", SHOPIFY_LOGIN_URL);
      el.setAttribute("title", "Sign in or Join");
      el.onclick = null;
    } else {
      // Signed in → show small menu on click
      el.setAttribute("href", SHOPIFY_ACCOUNT_URL);
      el.setAttribute("title", "My Account");
      el.onclick = function (evt) {
        evt.preventDefault();
        // Position menu under the icon
        var rect = el.getBoundingClientRect();
        menu.style.left = Math.round(rect.left + window.scrollX) + "px";
        menu.style.top = Math.round(rect.bottom + window.scrollY + 8) + "px";
        menu.style.display = menu.style.display === "none" ? "block" : "none";
      };
    }
  }

  // Route guard: redirect unauthenticated users to login
  function guardAuthenticated() {
    // For New Customer Accounts, we can't validate session client-side.
    // Send users to Shopify's login; after logging in, they can access the account there.
    var from = location.pathname + location.search + location.hash;
    try {
      sessionStorage.setItem("ja_redirect_after_login", from);
    } catch (_) {}
    location.replace("/account.html");
  }

  // After successful login/registration, redirect back if a prior page saved
  function redirectAfterAuth(defaultPath) {
    var target = defaultPath || "/account/index.html";
    try {
      var saved = sessionStorage.getItem("ja_redirect_after_login");
      if (saved) {
        sessionStorage.removeItem("ja_redirect_after_login");
        target = saved;
      }
    } catch (_) {}
    location.replace(target);
  }

  // Basic client-side form helper: shows inline accessible message
  function attachFormHandler(formId, onSubmit) {
    var form = document.getElementById(formId);
    if (!form) return;
    var msg = form.querySelector("[data-form-message]");
    if (!msg) {
      msg = document.createElement("div");
      msg.setAttribute("data-form-message", "");
      msg.setAttribute("role", "status");
      msg.setAttribute("aria-live", "polite");
      msg.style.margin = "8px 0 0 0";
      msg.style.fontSize = "14px";
      msg.style.color = "#111";
      form.appendChild(msg);
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      msg.textContent = "";
      if (typeof onSubmit === "function") {
        onSubmit({
          form: form,
          messageEl: msg,
          get: function (name) {
            var el = form.querySelector('[name="' + name + '"]');
            return el ? el.value.trim() : "";
          },
          setMessage: function (text, color) {
            msg.textContent = text || "";
            msg.style.color = color || "#111";
          },
        });
      }
    });
  }

  // Public API
  window.JAAccount = {
    isAuthed: isAuthed,
    setAuthed: setAuthed,
    getUser: getUser,
    setUser: setUser,
    setHeaderProfileLink: setHeaderProfileLink,
    guardAuthenticated: guardAuthenticated,
    redirectAfterAuth: redirectAfterAuth,
    attachFormHandler: attachFormHandler,
    // Expose login flag helpers for pages like /account.html
    markSignedIn: setLoginFlag,
    clearSignedIn: clearLoginFlag,
  };

  // Auto-run on DOM ready
  function onReady(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }
  // Expose functions globally
  window.JourneyAuth = {
    isAuthed: isAuthed,
    login: login,
    register: register,
    recover: recover,
    logout: logout,
    getUser: getUser,
    getAccessToken: getAccessToken,
    refreshCustomerData: refreshCustomerData,
    guardAuthenticated: guardAuthenticated,
    redirectAfterAuth: redirectAfterAuth,
    attachFormHandler: attachFormHandler,
  };

  onReady(function () {
    // Mark signed-in if we just returned from Shopify or URL has logged_in=1
    try {
      var ref = document.referrer || "";
      var fromShopify = ref.indexOf("accounts.shopify.com") !== -1;
      var url = new URL(window.location.href);
      if (fromShopify || url.searchParams.get("logged_in") === "1") {
        localStorage.setItem("ja_logged_in", "true");
        // Clean ?logged_in=1 on home page only
        if (
          url.searchParams.get("logged_in") === "1" &&
          (location.pathname === "/" || location.pathname === "/index.html")
        ) {
          url.searchParams.delete("logged_in");
          history.replaceState(
            {},
            document.title,
            url.pathname + (url.search ? "?" + url.search : "") + url.hash
          );
        }
      }
    } catch (_) {}

    setHeaderProfileLink();
    // Update header link if signed-in flag changes in another tab
    window.addEventListener("storage", function (e) {
      if (!e) return;
      if (e.key === "ja_logged_in" || e.key === AUTH_KEY)
        setHeaderProfileLink();
    });
  });
})();
