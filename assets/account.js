/* Journey Apparel — Account utilities (UI-only)
   Notes:
   - No external API calls; all auth simulated with localStorage
   - Keys used:
     * ja_auth: 'true' | 'false'
     * ja_user: JSON string of {firstName,lastName,email}
*/
(function () {
  var AUTH_KEY = 'ja_auth';
  var USER_KEY = 'ja_user';

  function isAuthed() {
    try { return localStorage.getItem(AUTH_KEY) === 'true'; } catch (_) { return false; }
  }
  function setAuthed(val) {
    try { localStorage.setItem(AUTH_KEY, val ? 'true' : 'false'); } catch (_) {}
  }
  function getUser() {
    try { var raw = localStorage.getItem(USER_KEY); return raw ? JSON.parse(raw) : null; } catch (_) { return null; }
  }
  function setUser(obj) {
    try { localStorage.setItem(USER_KEY, JSON.stringify(obj || {})); } catch (_) {}
  }

  // Update header profile icon link to login or account dashboard
  function setHeaderProfileLink() {
    var el = document.getElementById('headerProfileLink');
    if (!el) return;
    el.setAttribute('href', isAuthed() ? '/account/index.html' : '/account/login.html');
    el.addEventListener('click', function (e) {
      // ensure correct navigation on dynamic state
      el.setAttribute('href', isAuthed() ? '/account/index.html' : '/account/login.html');
    });
  }

  // Route guard: redirect unauthenticated users to login
  function guardAuthenticated() {
    if (!isAuthed()) {
      var from = location.pathname + location.search + location.hash;
      try { sessionStorage.setItem('ja_redirect_after_login', from); } catch (_) {}
      location.replace('/account/login.html');
    }
  }

  // After successful login/registration, redirect back if a prior page saved
  function redirectAfterAuth(defaultPath) {
    var target = defaultPath || '/account/index.html';
    try {
      var saved = sessionStorage.getItem('ja_redirect_after_login');
      if (saved) { sessionStorage.removeItem('ja_redirect_after_login'); target = saved; }
    } catch (_) {}
    location.replace(target);
  }

  // Basic client-side form helper: shows inline accessible message
  function attachFormHandler(formId, onSubmit) {
    var form = document.getElementById(formId);
    if (!form) return;
    var msg = form.querySelector('[data-form-message]');
    if (!msg) {
      msg = document.createElement('div');
      msg.setAttribute('data-form-message', '');
      msg.setAttribute('role', 'status');
      msg.setAttribute('aria-live', 'polite');
      msg.style.margin = '8px 0 0 0';
      msg.style.fontSize = '14px';
      msg.style.color = '#111';
      form.appendChild(msg);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      msg.textContent = '';
      if (typeof onSubmit === 'function') {
        onSubmit({
          form: form,
          messageEl: msg,
          get: function (name) {
            var el = form.querySelector('[name="' + name + '"]');
            return el ? el.value.trim() : '';
          },
          setMessage: function (text, color) {
            msg.textContent = text || '';
            msg.style.color = color || '#111';
          }
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
    attachFormHandler: attachFormHandler
  };

  // Auto-run on DOM ready
  function onReady(fn){ if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',fn);} else { fn(); } }
  onReady(function(){
    setHeaderProfileLink();
    // Update header link if auth changes in another tab
    window.addEventListener('storage', function (e) {
      if (e && e.key === AUTH_KEY) setHeaderProfileLink();
    });
  });
})();

