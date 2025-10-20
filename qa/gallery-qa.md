# Universal Product Gallery – QA Script & Checklist

This QA protocol verifies that the product gallery shows only the selected color’s images (ordered by `order=`), supports shareable URLs, and gracefully falls back when tags are missing.

## Pre-setup
- In Shopify Admin → Product → Media, ensure alt-text follows the convention:
  - `color=Black; order=1`
  - `color=Black; order=2`
  - `color=White; order=1`
  - Mixed-case ok (e.g., `color=blue; order=3`)
- Add at least 2 colors (variants) to the product with option name `COLOUR` or `Color`.

## Test Matrix

1) Initial load with ?color param
- Open product page with `?color=Black`.
- Expect:
  - Swatch for Black is selected (aria-pressed="true").
  - Only Black-tagged images render.
  - Images ordered by `order=1..n`.

2) Initial load without ?color param
- Open product page without `?color`.
- Expect:
  - First available color is selected.
  - Only that color’s images render, ordered.

3) Swatch click behavior
- Click another color (e.g., White).
- Expect:
  - Gallery updates to only White-tagged images, in order.
  - URL updates to include `?color=White` via `history.replaceState`.
  - No full page reload occurs.

4) Fallback when color has no tagged images
- Temporarily remove alt-text tags for one color OR use a color without tags.
- Expect:
  - First image = that color’s `variant.image` (if present).
  - Additional images fall back to product media list.
  - No console errors.

5) Case-insensitivity and formatting
- Use alt-text with lowercase keys: `colour=blue; order=2`.
- Expect:
  - "Blue" selection shows these images.
  - Sorting still honors `order=2`.

6) Colors with spaces and hyphens
- Create a color value like `Off White` or `Blue-Grey`.
- Add corresponding alt-text: `color=Off White; order=1`.
- Expect:
  - Swatch shows the label as-is.
  - `?color=Off%20White` works; loads correct images.

7) Image preload (flicker)
- With DevTools open (disable cache), click between colors.
- Expect:
  - Minimal flicker due to preloading.

8) Accessibility
- Swatches are `<button>`s with `aria-pressed` and keyboard focus visible.
- Tab to swatches and press Enter/Space → gallery updates.

## Troubleshooting
- If no images appear for a color:
  - Check alt-text spelling: `color=` or `colour=`.
  - Ensure values exactly match the variant’s color value (case-insensitive match).
  - Missing `order=` is allowed; defaults to 999 (sorted last).
- If URL doesn’t update:
  - Check browser console for errors.
  - Confirm script `src/pages/product.js` is loading (Network tab).

## Console Helpers

- Dump parsed color images (after page load):
```js
(async () => {
  const mod = await import('/src/lib/colorGallery.js');
  const shop = await import('/src/lib/shopify.js');
  const p = await (await fetch('/.netlify/functions/getProduct?handle=' + shop.getHandleFromURL())).json();
  const product = p.product || p;
  console.log('Available colors:', shop.listColors(product));
  console.log('Black images:', mod.imagesForColor(product, 'Black'));
})();
```

- Verify swatch selection state:
```js
Array.from(document.querySelectorAll('#colour-swatches .swatch')).map(b => ({
  label: b.getAttribute('data-value') || b.textContent,
  pressed: b.getAttribute('aria-pressed')
}));
```

- Force render a color gallery (without clicking):
```js
(async () => {
  const mod = await import('/src/lib/colorGallery.js');
  const shop = await import('/src/lib/shopify.js');
  const p = await (await fetch('/.netlify/functions/getProduct?handle=' + shop.getHandleFromURL())).json();
  const product = p.product || p;
  const track = document.querySelector('#hero-track');
  const imgs = mod.imagesForColor(product, 'White');
  mod.preloadImages(imgs.map(i => i.url));
  mod.renderGallery(track, imgs);
})();
```

