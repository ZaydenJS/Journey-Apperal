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
    tagged.sort((a, b) => (a.__order || 999) - (b.__order || 999));
    return tagged.map(({ __order, ...rest }) => rest);
  }

  // Fallbacks: variant.image first if available, then untagged product media (as-is)
  const first = [];
  const vWithImg = findVariantForColor(product, color, true);
  if (vWithImg && vWithImg.image && vWithImg.image.url) {
    first.push({ ...vWithImg.image });
  }
  // Add remaining product images (skip duplicates)
  const seen = new Set(first.map((i) => i.url));
  for (const img of imgs) {
    if (!seen.has(img.url)) first.push(img);
  }
  return first;
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
