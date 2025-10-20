// src/pages/product.js
// Page wiring: fetch product JSON and initialize the color-aware gallery.

import { getHandleFromURL, fetchProduct } from "../lib/shopify.js";
import { initColorGallery } from "../lib/colorGallery.js";

async function boot() {
  try {
    const handle = getHandleFromURL();
    if (!handle) return;
    const product = await fetchProduct(handle);
    if (!product) return;
    initColorGallery({ product, trackSelector: "#hero-track", swatchSelector: "#colour-swatches" });
  } catch (err) {
    console.error("product gallery boot error", err);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}

