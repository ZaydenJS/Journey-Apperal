// Journey Apparel — minimal theme runtime
(function(){
  function setHeaderProfileLink(){
    try{
      var el = document.getElementById('headerProfileLink');
      if(!el) return;
      var logged = false;
      try { logged = localStorage.getItem('ja_logged_in') === 'true'; } catch(_){ }
      if(logged){
        el.href = 'https://shopify.com/94836293942/account';
        el.title = 'Account';
      } else {
        var ret = (location.origin || '') + '/?logged_in=1';
        el.href = 'https://shopify.com/94836293942/account/login?return_url=' + encodeURIComponent(ret);
        el.title = 'Sign in or Join';
      }
    }catch(_){ }
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', setHeaderProfileLink);
  }else{
    setHeaderProfileLink();
  }
  window.addEventListener('storage', function(e){
    if(!e) return; if(e.key === 'ja_logged_in') setHeaderProfileLink();
  });
})();

