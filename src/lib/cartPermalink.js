(function () {
  const LINES_KEY = "ja_cart_lines";

  function gidToNumeric(variantGid) {
    if (!variantGid || typeof variantGid !== "string") return "";
    const m = variantGid.match(/ProductVariant\/(\d+)/);
    return m ? m[1] : "";
  }

  function readJSON(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key) || fallback);
    } catch (_) {
      return JSON.parse(fallback);
    }
  }
  function writeJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (_) {}
  }

  function getLines() {
    const raw = readJSON(LINES_KEY, "[]");
    if (!Array.isArray(raw)) return [];
    return raw.filter(
      (l) => l && typeof l.variantGid === "string" && Number(l.quantity) > 0
    );
  }

  function setLines(lines) {
    const filtered = (Array.isArray(lines) ? lines : []).filter(
      (l) => l && typeof l.variantGid === "string" && Number(l.quantity) > 0
    );
    writeJSON(LINES_KEY, filtered);
  }

  function buildCartPermalink(lines) {
    const arr = Array.isArray(lines) ? lines : [];
    const items = arr
      .filter(
        (l) => l && typeof l.variantGid === "string" && Number(l.quantity) > 0
      )
      .map((l) => {
        const id = gidToNumeric(l.variantGid);
        const qty = Math.max(1, Number(l.quantity || 1));
        return id ? `${id}:${qty}` : "";
      })
      .filter(Boolean);

    const store =
      (window.ENV &&
        (window.ENV.SHOPIFY_STOREFRONT_DOMAIN ||
          window.ENV.SHOPIFY_STORE_DOMAIN)) ||
      "7196su-vk.myshopify.com";
    let url = `https://${store}/cart/${items.join(",")}`;
    try {
      const code = localStorage.getItem("ja_discount");
      if (code) {
        const sep = url.includes("?") ? "&" : "?";
        url += `${sep}discount=${encodeURIComponent(code)}`;
      }
    } catch (_) {}
    return url;
  }

  window.CartPermalink = {
    gidToNumeric,
    getLines,
    setLines,
    buildCartPermalink,
  };
})();
