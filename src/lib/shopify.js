// src/lib/shopify.js
// Lightweight helpers for fetching product data via our Netlify function and
// reading common product/option details without exposing Storefront tokens.

/** Return product handle from URL (?slug=... or last path segment) */
export function getHandleFromURL(url = window.location.href) {
  try {
    const u = new URL(url, window.location.origin);
    const slug = u.searchParams.get("slug");
    if (slug) return slug;
    const seg = (u.pathname || "").split("/").filter(Boolean);
    return seg[seg.length - 1] || "";
  } catch (_) {
    // Fallback: parse location directly
    const seg = (window.location.pathname || "").split("/").filter(Boolean);
    return seg[seg.length - 1] || "";
  }
}

/** Fetch product JSON (mapped by the Netlify function) */
export async function fetchProduct(handle) {
  if (!handle) throw new Error("Missing product handle");
  const resp = await fetch(
    `/.netlify/functions/getProduct?handle=${encodeURIComponent(handle)}`,
    { credentials: "include" }
  );
  if (!resp.ok) {
    const msg = await resp.text().catch(() => "");
    throw new Error(`getProduct failed (${resp.status}): ${msg || resp.statusText}`);
  }
  const data = await resp.json();
  return data && (data.product || data);
}

/** Find the option object that represents colour/color (case-insensitive) */
export function getColorOption(product) {
  const opts = (product && product.options) || [];
  return (
    opts.find((o) => String(o.name || "").toLowerCase() === "colour") ||
    opts.find((o) => String(o.name || "").toLowerCase() === "color") ||
    null
  );
}

/** List available colour values (deduped, preserve first-seen casing) */
export function listColors(product) {
  const map = new Map(); // key: lower, val: display
  const variants = (product && product.variants) || [];
  for (const v of variants) {
    for (const so of v.selectedOptions || []) {
      const name = String(so.name || "").trim().toLowerCase();
      if (name === "colour" || name === "color") {
        const disp = String(so.value || "").trim();
        const key = disp.toLowerCase();
        if (disp && !map.has(key)) map.set(key, disp);
      }
    }
  }
  // Fallback to option values if no variants populated
  if (!map.size) {
    const opt = getColorOption(product);
    for (const v of (opt && opt.values) || []) {
      const key = String(v || "").trim().toLowerCase();
      if (key && !map.has(key)) map.set(key, String(v));
    }
  }
  return Array.from(map.values());
}

/** Find first variant (optionally with image) for a given color (case-insensitive) */
export function findVariantForColor(product, color, withImage = false) {
  const target = String(color || "").trim().toLowerCase();
  if (!target) return null;
  for (const v of (product && product.variants) || []) {
    const hasColor = (v.selectedOptions || []).some((so) => {
      const n = String(so.name || "").trim().toLowerCase();
      return (n === "colour" || n === "color") && String(so.value || "").trim().toLowerCase() === target;
    });
    if (hasColor) {
      if (withImage) {
        if (v.image && v.image.url) return v;
      } else {
        return v;
      }
    }
  }
  return null;
}

