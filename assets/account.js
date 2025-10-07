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

  // Native legacy accounts API endpoints (Netlify Functions)
  var API = {
    login: "/.netlify/functions/customerLogin",
    logout: "/.netlify/functions/customerLogout",
    me: "/.netlify/functions/getCustomer",
    register: "/.netlify/functions/customerRegister",
    recover: "/.netlify/functions/customerRecover",
    reset: "/.netlify/functions/customerReset",
    orders: "/.netlify/functions/customerOrders",
    order: "/.netlify/functions/customerOrder",
    addresses: "/.netlify/functions/customerAddresses",
    addressCreate: "/.netlify/functions/customerAddressCreate",
    addressUpdate: "/.netlify/functions/customerAddressUpdate",
    addressDelete: "/.netlify/functions/customerAddressDelete",
    addressDefault: "/.netlify/functions/customerDefaultAddressUpdate",
    customerUpdate: "/.netlify/functions/customerUpdate",
  };

  async function apiJson(url, options) {
    var res = await fetch(
      url,
      Object.assign(
        {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        },
        options || {}
      )
    );
    var text = await res.text();
    var data = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch (_) {}
    if (!res.ok) {
      var msg =
        (data && (data.error || data.message)) ||
        "Request failed: " + res.status;
      var err = new Error(msg);
      err.status = res.status;
      throw err;
    }
    return data;
  }

  async function fetchMe() {
    try {
      var data = await apiJson(API.me, { method: "GET" });
      if (data && data.customer) {
        setUser(data.customer);
        try {
          localStorage.setItem("ja_logged_in", "true");
        } catch (_) {}
        return data.customer;
      }
    } catch (e) {
      try {
        localStorage.removeItem("ja_logged_in");
      } catch (_) {}
      setUser(null);
      throw e;
    }
    return null;
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

  // Shopify Authentication Functions (legacy customer accounts via Netlify Functions)
  async function login(email, password) {
    if (!email || !password) throw new Error("Email and password are required");
    var data = await apiJson(API.login, {
      method: "POST",
      body: JSON.stringify({
        email: String(email).trim(),
        password: String(password),
      }),
    });
    if (data && data.customer) {
      setUser(data.customer);
      try {
        localStorage.setItem("ja_logged_in", "true");
      } catch (_) {}
      // Store token soft signals for compatibility
      try {
        localStorage.setItem(
          "shopify_access_token",
          data.token?.accessToken || ""
        );
        localStorage.setItem(
          "shopify_token_expiry",
          data.token?.expiresAt || ""
        );
      } catch (_) {}
    }
    return data;
  }

  async function register(firstName, lastName, email, password) {
    if (!email || !password) throw new Error("Email and password are required");
    var data = await apiJson(API.register, {
      method: "POST",
      body: JSON.stringify({
        firstName,
        lastName,
        email: String(email).trim(),
        password: String(password),
      }),
    });
    if (data && data.customer) {
      setUser(data.customer);
      try {
        localStorage.setItem("ja_logged_in", "true");
      } catch (_) {}
      try {
        localStorage.setItem(
          "shopify_access_token",
          data.token?.accessToken || ""
        );
        localStorage.setItem(
          "shopify_token_expiry",
          data.token?.expiresAt || ""
        );
      } catch (_) {}
    }
    return data;
  }

  async function recover(email) {
    if (!email) throw new Error("Email is required");
    await apiJson(API.recover, {
      method: "POST",
      body: JSON.stringify({ email: String(email).trim() }),
    });
    return { ok: true };
  }

  async function refreshCustomerData() {
    try {
      return await fetchMe();
    } catch (_) {
      return null;
    }
  }

  function logout() {
    try {
      apiJson(API.logout, { method: "POST" }).catch(function () {});
    } catch (_) {}
    clearAuth();
    clearLoginFlag();
    try {
      localStorage.removeItem("ja_logged_in");
    } catch (_) {}
    try {
      window.location.replace("/account/login.html");
    } catch (_) {
      location.replace("/account/login.html");
    }
  }

  async function resetPassword(params) {
    // params: { resetUrl, password } OR { id, resetToken, password }
    if (!params || !params.password) throw new Error("Password is required");
    var data = await apiJson(API.reset, {
      method: "POST",
      body: JSON.stringify(params),
    });
    if (data && data.customer) {
      setUser(data.customer);

      try {
        localStorage.setItem("ja_logged_in", "true");
      } catch (_) {}
    }
    return data;
  }

  // Update header profile icon link to login or account dashboard (native)
  function setHeaderProfileLink() {
    var el = document.getElementById("headerProfileLink");
    if (!el) return;
    var signed = false;
    try {
      signed = localStorage.getItem("ja_logged_in") === "true";
    } catch (_) {}
    if (signed) {
      el.setAttribute("href", "/account/index.html");
      el.setAttribute("title", "Account");
      el.onclick = null;
    } else {
      el.setAttribute("href", "/account/login.html");
      el.setAttribute("title", "Sign in or Join");
      el.onclick = null;
    }
  }

  // Route guard: redirect unauthenticated users to native login
  async function guardAuthenticated() {
    try {
      await fetchMe();
      setHeaderProfileLink();
    } catch (e) {
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

  // Profile & Addresses CRUD
  async function updateProfile(fields) {
    var payload = {};
    if (fields && typeof fields.firstName === "string")
      payload.firstName = fields.firstName;
    if (fields && typeof fields.lastName === "string")
      payload.lastName = fields.lastName;
    if (fields && typeof fields.phone === "string")
      payload.phone = fields.phone;
    var data = await apiJson(API.customerUpdate, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (data && data.customer) setUser(data.customer);
    return data;
  }

  async function getAddresses() {
    return await apiJson(API.addresses, { method: "GET" });
  }

  async function addAddress(address) {
    return await apiJson(API.addressCreate, {
      method: "POST",
      body: JSON.stringify(address || {}),
    });
  }

  async function updateAddress(id, address) {
    return await apiJson(API.addressUpdate, {
      method: "POST",
      body: JSON.stringify({ id: id, address: address || {} }),
    });
  }

  async function deleteAddress(id) {
    return await apiJson(API.addressDelete, {
      method: "POST",
      body: JSON.stringify({ id: id }),
    });
  }

  async function setDefaultAddress(addressId) {
    return await apiJson(API.addressDefault, {
      method: "POST",
      body: JSON.stringify({ addressId: addressId }),
    });
  }

  async function fetchOrder(orderId) {
    var url = API.order + "?id=" + encodeURIComponent(orderId);
    return await apiJson(url, { method: "GET" });
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
    resetPassword: resetPassword,
    logout: logout,
    getUser: getUser,
    getAccessToken: getAccessToken,
    refreshCustomerData: refreshCustomerData,
    guardAuthenticated: guardAuthenticated,
    redirectAfterAuth: redirectAfterAuth,
    attachFormHandler: attachFormHandler,
    // New CRUD and order helpers
    updateProfile: updateProfile,
    getAddresses: getAddresses,
    addAddress: addAddress,
    updateAddress: updateAddress,
    deleteAddress: deleteAddress,
    setDefaultAddress: setDefaultAddress,
    fetchOrder: fetchOrder,
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
