// src/lib/colorGallery.js
// Universal product gallery that filters images by selected color, using
// image.altText tags following the convention: "color=<Color>; order=<Number>".
// - Case-insensitive parsing for keys and values
// - Supports colour/color synonyms
// - Missing order => 999
// - Prefer variant media when available; fallback to altText tagging
// - Graceful fallback to variant.image then product media
// - Updates ?color= in URL with history.replaceState

import {
  listColors,
  findVariantForColor,
  getHandleFromURL,
} from "./shopify.js";

function norm(s) {
  return String(s || "")
    .trim()
    .toLowerCase();
}

/** Parse altText metadata: returns { color, order } when present */
export function parseAltMeta(altText) {
  const out = { color: null, order: 999 };
  const raw = String(altText || "");
  if (!raw) return out;
  // Example: "color=Black; order=2" (allow arbitrary spacing)
  const parts = raw.split(/\s*;\s*/);
  for (const p of parts) {
    const m = p.match(/^([a-zA-Z]+)\s*=\s*(.+)$/);
    if (!m) continue;
    const key = norm(m[1]);
    const val = String(m[2] || "").trim();
    if (key === "color" || key === "colour") {
      out.color = val;
    } else if (key === "order") {
      const n = parseInt(val, 10);
      if (!Number.isNaN(n)) out.order = n;
    }
  }
  return out;
}

/**
 * Build the ordered image list for a given color.
 * Returns array of nodes: { url, altText, width, height }
 */
export function imagesForColor(product, color) {
  const imgs = Array.isArray(product?.images) ? product.images : [];
  const wanted = norm(color);
  const tagged = [];
  for (const img of imgs) {
    const meta = parseAltMeta(img.altText);
    if (meta.color && norm(meta.color) === wanted) {
      tagged.push({ ...img, __order: meta.order });
    }
  }
  if (tagged.length) {
    // Strict mode: only return images explicitly tagged for this colour
    tagged.sort((a, b) => (a.__order || 999) - (b.__order || 999));
    return tagged.map(({ __order, ...rest }) => rest);
  }

  // Strict fallback (no tagged images at all): show only the selected variant's primary image
  const vWithImg = findVariantForColor(product, color, true);
  if (vWithImg && vWithImg.image && vWithImg.image.url) {
    return [{ ...vWithImg.image }];
  }
  // If variant has no image, return empty to avoid showing other colours inadvertently
  return [];
}

/** Preload a list of image URLs to avoid flicker */
export function preloadImages(urls = []) {
  urls.forEach((u) => {
    const img = new Image();
    img.decoding = "async";
    img.loading = "eager";
    img.src = u;
  });
}

/** Render images into a horizontal track (#hero-track) */
export function renderGallery(trackEl, images = []) {
  if (!trackEl) return;
  trackEl.innerHTML = "";
  for (const img of images) {
    const el = document.createElement("img");
    el.src = img.url;
    el.alt = img.altText || "Product image";
    el.style.width = "100%";
    el.style.height = "100%";
    el.style.objectFit = "cover";
    el.style.objectPosition = "center center";
    el.style.scrollSnapAlign = "center";
    el.decoding = "async";
    el.loading = "eager";
    trackEl.appendChild(el);
  }
  // Ensure we start at the first image and trigger a layout flush to avoid mis-center
  try {
    trackEl.scrollTo({ left: 0, top: 0, behavior: "auto" });
  } catch (_) {
    try {
      trackEl.scrollLeft = 0;
    } catch (_) {}
  }
  try {
    void trackEl.offsetHeight;
  } catch (_) {}
  // Notify page scripts that hero images were updated (rebuild arrows/dots/state)
  try {
    document.dispatchEvent(
      new CustomEvent("pdp:hero:updated", { detail: { count: images.length } })
    );
  } catch (_) {}
}

function getSelectedColorFromSwatches(swatchContainer) {
  const btn = swatchContainer?.querySelector('.swatch[aria-pressed="true"]');
  return btn ? btn.getAttribute("data-value") || btn.textContent || "" : "";
}

function setURLColorParam(color) {
  try {
    const u = new URL(window.location.href);
    if (color) u.searchParams.set("color", color);
    else u.searchParams.delete("color");
    window.history.replaceState({}, "", u.toString());
  } catch (_) {}
}

function __isValidCssColor(c) {
  try {
    const s = document.createElement("span").style;
    s.color = "";
    s.color = c;
    return !!s.color;
  } catch (_) {
    return false;
  }
}
function __resolveCssColor(val) {
  const t = String(val || "")
    .trim()
    .toLowerCase();
  const map = {
    black: "#000000",
    white: "#ffffff",
    blue: "#0000ff",
    navy: "#001f3f",
    sky: "#87ceeb",
    skyblue: "#87ceeb",
    red: "#ff0000",
    burgundy: "#800020",
    maroon: "#800000",
    green: "#008000",
    forest: "#0b3d0b",
    olive: "#808000",
    sage: "#b2ac88",
    yellow: "#ffff00",
    orange: "#ffa500",
    tan: "#d2b48c",
    khaki: "#c3b091",
    sand: "#c2b280",
    ecru: "#c2b280",
    cream: "#f5f5dc",
    beige: "#f5f5dc",
    brown: "#8b4513",
    grey: "#808080",
    gray: "#808080",
    charcoal: "#333333",
    silver: "#c0c0c0",
    gold: "#d4af37",
    purple: "#800080",
    lilac: "#c8a2c8",
    pink: "#ffc0cb",
  };
  if (map[t]) return map[t];
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(t)) return t;
  if (__isValidCssColor(t)) return t;
  return "";
}

function ensureSwatches(container, colors) {
  if (!container) return;
  // Mark container so legacy inline script doesn't overwrite our swatches
  container.setAttribute("data-external-swatches", "1");
  // Rebuild swatches to centralize ownership
  container.innerHTML = "";
  colors.forEach((label, idx) => {
    const btn = document.createElement("button");
    btn.className = "swatch";
    btn.type = "button";
    btn.setAttribute("data-value", label);
    btn.setAttribute("aria-pressed", idx === 0 ? "true" : "false");
    btn.setAttribute("aria-label", label);
    // Visual fill from colour name/hex when possible
    const css = __resolveCssColor(label);
    if (css) btn.style.background = css;
    btn.title = label;
    container.appendChild(btn);
  });
}

export function initColorGallery({
  product,
  trackSelector = "#hero-track",
  swatchSelector = "#colour-swatches",
}) {
  const track = document.querySelector(trackSelector);
  const swatches = document.querySelector(swatchSelector);
  if (!product || !track) return;

  const colors = listColors(product);
  ensureSwatches(swatches, colors);

  // Initial color: from ?color= or first available
  let initial = (function () {
    try {
      const u = new URL(window.location.href);
      const c = u.searchParams.get("color");
      if (c && colors.map((x) => norm(x)).includes(norm(c))) return c;
    } catch (_) {}
    if (swatches) {
      const sel = getSelectedColorFromSwatches(swatches);
      if (sel) return sel;
    }
    return colors[0] || "";
  })();

  // Select the swatch in UI if present
  if (swatches && initial) {
    const btns = swatches.querySelectorAll(".swatch");
    btns.forEach((b) => {
      const isSel =
        norm(b.getAttribute("data-value") || b.textContent) === norm(initial);
      b.setAttribute("aria-pressed", isSel ? "true" : "false");
    });
  }

  // Render initial gallery
  const firstImages = imagesForColor(product, initial);
  preloadImages(firstImages.map((i) => i.url));
  renderGallery(track, firstImages);
  setURLColorParam(initial);
  try {
    const handle = getHandleFromURL();
    if (handle && initial)
      localStorage.setItem("pdp:lastColour:" + handle, initial);
  } catch (_) {}

  // Wire swatch clicks (delegate). Also sync size grid via CustomEvent and localStorage.
  if (swatches) {
    swatches.addEventListener("click", (e) => {
      const btn = e.target.closest && e.target.closest(".swatch");
      if (!btn) return;
      const color = btn.getAttribute("data-value") || btn.textContent || "";

      // Toggle aria-pressed (single-select)
      swatches
        .querySelectorAll(".swatch")
        .forEach((b) => b.setAttribute("aria-pressed", "false"));
      btn.setAttribute("aria-pressed", "true");

      // Persist selection (for legacy size script compatibility)
      try {
        const handle = getHandleFromURL();
        if (handle) localStorage.setItem("pdp:lastColour:" + handle, color);
      } catch (_) {}

      // Update gallery
      const imgs = imagesForColor(product, color);
      preloadImages(imgs.map((i) => i.url));
      renderGallery(track, imgs);
      setURLColorParam(color);

      // Notify size system (legacy code listens to this in our patch)
      try {
        document.dispatchEvent(
          new CustomEvent("pdp:colour:change", { detail: { color } })
        );
      } catch (_) {}
    });
  }
}
