/* Journey Apparel — Account utilities with Shopify integration */
(function () {
  var AUTH_KEY = "shopify_access_token";
  var USER_KEY = "shopify_customer";
  var TOKEN_EXPIRY_KEY = "shopify_token_expiry";

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

  // Shopify Authentication Functions
  async function login(email, password) {
    try {
      const response = await window.shopifyAPI.customerLogin(email, password);
      setAuth(response.accessToken, response.expiresAt, response.customer);
      // Yotpo Loyalty: identify on successful login
      try {
        localStorage.setItem(
          "ja_email",
          String(email || response.customer?.email || "")
        );
        if (typeof window.setYotpoCustomerEmail === "function") {
          window.setYotpoCustomerEmail(email || response.customer?.email || "");
        }
      } catch (_) {}
      return response;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  }

  async function register(customerData) {
    try {
      const response = await window.shopifyAPI.customerRegister(customerData);
      if (response.accessToken) {
        setAuth(response.accessToken, response.expiresAt, response.customer);
        // Yotpo Loyalty: identify newly registered user
        try {
          var em =
            (customerData && customerData.email) ||
            response.customer?.email ||
            "";
          if (em) localStorage.setItem("ja_email", String(em));
          if (typeof window.setYotpoCustomerEmail === "function") {
            window.setYotpoCustomerEmail(em);
          }
        } catch (_) {}
      }
      return response;
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  }

  async function refreshCustomerData() {
    try {
      const accessToken = getAccessToken();
      if (!accessToken) return null;

      const response = await window.shopifyAPI.getCustomer(accessToken);
      localStorage.setItem(USER_KEY, JSON.stringify(response.customer));
      return response.customer;
    } catch (error) {
      console.error("Failed to refresh customer data:", error);
      clearAuth();
      return null;
    }
  }

  function logout() {
    clearAuth();
    // Yotpo Loyalty: clear identity on logout
    try {
      if (typeof window.clearYotpoCustomer === "function")
        window.clearYotpoCustomer();
      localStorage.removeItem("ja_email");
    } catch (_) {}
    location.replace("/account/login.html");
  }

  // Update header profile icon link to login or account dashboard
  function setHeaderProfileLink() {
    var el = document.getElementById("headerProfileLink");
    if (!el) return;
    el.setAttribute(
      "href",
      isAuthed() ? "/account/index.html" : "/account/login.html"
    );
    el.addEventListener("click", function (e) {
      // ensure correct navigation on dynamic state
      el.setAttribute(
        "href",
        isAuthed() ? "/account/index.html" : "/account/login.html"
      );
    });
  }

  // Route guard: redirect unauthenticated users to login
  function guardAuthenticated() {
    if (!isAuthed()) {
      var from = location.pathname + location.search + location.hash;
      try {
        sessionStorage.setItem("ja_redirect_after_login", from);
      } catch (_) {}
      location.replace("/account/login.html");
    }
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
    // Update header link if auth changes in another tab
    window.addEventListener("storage", function (e) {
      if (e && e.key === AUTH_KEY) setHeaderProfileLink();
    });
  });
})();
