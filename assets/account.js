/* Journey Apparel — Account utilities with Shopify integration */
(function () {
  var AUTH_KEY = "shopify_access_token";
  var USER_KEY = "shopify_customer";
  var TOKEN_EXPIRY_KEY = "shopify_token_expiry";

  // Legacy Accounts API endpoints and routes
  var API_BASE = "/.netlify/functions";
  var LOGIN_PAGE = "/account/login.html";
  var REGISTER_PAGE = "/account/register.html";
  var ACCOUNT_PAGE = "/account/index.html";
  var LOGOUT_REDIRECT = "/";

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

  // Legacy Accounts Authentication via Netlify functions
  async function login(email, password) {
    if (!email || !password) throw new Error("Email and password are required");
    var resp = await fetch(API_BASE + "/customerLogin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), password: password }),
    });
    var data = await resp.json().catch(function () {
      return {};
    });
    if (!resp.ok) throw new Error(data.error || data.message || "Login failed");
    try {
      localStorage.setItem("ja_logged_in", "true");
      if (data.customer) setUser(data.customer);
    } catch (_) {}
    return data;
  }

  async function register(
    email,
    password,
    firstName,
    lastName,
    acceptsMarketing
  ) {
    if (!email || !password) throw new Error("Email and password are required");
    var resp = await fetch(API_BASE + "/customerRegister", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.trim(),
        password,
        firstName,
        lastName,
        acceptsMarketing: !!acceptsMarketing,
      }),
    });
    var data = await resp.json().catch(function () {
      return {};
    });
    if (!resp.ok)
      throw new Error(data.error || data.message || "Registration failed");
    try {
      localStorage.setItem("ja_logged_in", "true");
      if (data.customer) setUser(data.customer);
    } catch (_) {}
    return data;
  }

  async function recover(email) {
    if (!email) throw new Error("Email is required");
    var resp = await fetch(API_BASE + "/customerRecover", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim() }),
    });
    var data = await resp.json().catch(function () {
      return {};
    });
    if (!resp.ok)
      throw new Error(data.error || data.message || "Recovery failed");
    return data;
  }

  async function refreshCustomerData() {
    try {
      var resp = await fetch(API_BASE + "/getCustomer", {
        credentials: "same-origin",
      });
      if (!resp.ok) return null;
      var data = await resp.json().catch(function () {
        return {};
      });
      if (data && data.customer) setUser(data.customer);
      return data && data.customer ? data.customer : null;
    } catch (_) {
      return null;
    }
  }

  async function logout() {
    clearAuth();
    clearLoginFlag();
    try {
      localStorage.removeItem("ja_logged_in");
    } catch (_) {}
    try {
      await fetch(API_BASE + "/customerLogout", { method: "POST" });
    } catch (_) {}
    try {
      window.location.replace(LOGOUT_REDIRECT);
    } catch (_) {
      location.replace(LOGOUT_REDIRECT);
    }
  }

  // Update header profile icon link to login or account dashboard
  function setHeaderProfileLink() {
    var el = document.getElementById("headerProfileLink");
    if (!el) return;
    var signed = false;
    try {
      signed = localStorage.getItem("ja_logged_in") === "true";
    } catch (_) {}
    el.setAttribute("href", signed ? ACCOUNT_PAGE : LOGIN_PAGE);
    el.setAttribute("title", signed ? "Account" : "Sign in or Join");
    el.onclick = null;
  }

  // Route guard: redirect unauthenticated users to login
  async function guardAuthenticated() {
    try {
      var resp = await fetch(API_BASE + "/getCustomer", {
        credentials: "same-origin",
      });
      if (resp.ok) {
        var data = await resp.json().catch(function () {
          return {};
        });
        if (data && data.customer) {
          setUser(data.customer);
          try {
            localStorage.setItem("ja_logged_in", "true");
          } catch (_) {}
          return; // allow page to render
        }
      }
    } catch (_) {}
    try {
      sessionStorage.setItem(
        "ja_redirect_after_login",
        location.pathname + location.search + location.hash
      );
    } catch (_) {}
    location.replace(LOGIN_PAGE);
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
    setHeaderProfileLink();
    window.addEventListener("storage", function (e) {
      if (!e) return;
      if (e.key === "ja_logged_in" || e.key === AUTH_KEY)
        setHeaderProfileLink();
    });
  });
})();
