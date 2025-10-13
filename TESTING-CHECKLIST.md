# Product Image Display - QA Testing Checklist

## Overview
This checklist ensures all product images display fully (no cropping) across all pages and devices.

---

## 🖥️ Desktop Testing (1440px+)

### Product Detail Page (product.html)
- [ ] **Hero Image**
  - Navigate to: `product.html?slug=cant-catch-us-hoodie`
  - ✓ Full model visible head-to-toe
  - ✓ No cropping on top or bottom
  - ✓ Image centered in left column
  - ✓ Light gray background visible if image doesn't fill container
  - ✓ No layout shift when image loads

- [ ] **Gallery Navigation**
  - Click next/previous arrows
  - ✓ All images show fully without cropping
  - ✓ Smooth transitions between images
  - ✓ Pagination dots update correctly

- [ ] **Recently Viewed Carousel** (bottom of page)
  - Scroll to "You Also Viewed" section
  - ✓ All product thumbnails show full image
  - ✓ No cropping on any card
  - ✓ Hover state works correctly

- [ ] **Best Sellers Carousel** (bottom of page)
  - Scroll to "Featured Collection" section
  - ✓ All product thumbnails show full image
  - ✓ No cropping on any card

### Homepage (index.html)
- [ ] **New Arrivals Section**
  - ✓ All 5 product cards show full images
  - ✓ Hover swap shows full alternate image
  - ✓ No cropping on primary or hover images

- [ ] **Best Sellers Section**
  - ✓ All 4 product cards show full images
  - ✓ Hover swap works correctly
  - ✓ Images centered with letterboxing if needed

### Collection Page (collection.html)
- [ ] **Product Grid**
  - Navigate to: `collection.html?collection=tees`
  - ✓ All product cards in 4-column grid show full images
  - ✓ No cropping on any product
  - ✓ Consistent spacing and alignment

- [ ] **Filter/Sort**
  - Apply filters (Size, Color, etc.)
  - ✓ Filtered products still show full images
  - ✓ No layout issues after filtering

---

## 📱 Mobile Testing (390px - iPhone 12/13/14)

### Product Detail Page
- [ ] **Hero Image**
  - Open product page on mobile
  - ✓ Full product visible without cropping
  - ✓ Image fills width appropriately
  - ✓ Swipe gesture works smoothly

- [ ] **Gallery Swipe**
  - Swipe left/right through images
  - ✓ All images show fully
  - ✓ Smooth scroll snap behavior
  - ✓ Dots update on swipe

- [ ] **Recently Viewed** (mobile)
  - Scroll to bottom
  - ✓ 2-column grid shows full images
  - ✓ No cropping on thumbnails

### Homepage (mobile)
- [ ] **New Arrivals**
  - ✓ Carousel shows full images
  - ✓ Swipe navigation works
  - ✓ Images centered properly

- [ ] **Best Sellers**
  - ✓ All cards show full product images
  - ✓ Tap to navigate to product works

### Collection Page (mobile)
- [ ] **Product Grid**
  - ✓ 2-column grid shows full images
  - ✓ Scroll performance is smooth
  - ✓ No cropping on any product

---

## 📐 Tablet Testing (768px - iPad)

### Portrait Orientation
- [ ] **Product Page**
  - ✓ Hero image shows fully
  - ✓ Layout adapts correctly
  - ✓ No cropping at breakpoint

- [ ] **Homepage**
  - ✓ Carousels display correctly
  - ✓ Product images fully visible

### Landscape Orientation
- [ ] **Product Page**
  - ✓ Side-by-side layout (if applicable)
  - ✓ Hero image fully visible
  - ✓ No layout shift on rotation

- [ ] **Collection Page**
  - ✓ Grid adapts to landscape
  - ✓ All images show fully

---

## 🎯 Edge Case Testing

### Very Tall Images (Portrait 3:4)
- [ ] Test product: "Can't Catch Us Hoodie"
  - ✓ Full image visible
  - ✓ Horizontal letterboxing present
  - ✓ Image centered

### Very Wide Images (Landscape)
- [ ] Test product: (if available)
  - ✓ Full image visible
  - ✓ Vertical letterboxing present
  - ✓ Image centered

### Multiple Image Variants
- [ ] Navigate through all images in gallery
  - ✓ Each image displays fully
  - ✓ Different aspect ratios handled correctly
  - ✓ No jumping or layout shift

---

## ⚡ Performance Testing

### Lighthouse Audit (Desktop)
- [ ] Run Lighthouse on product page
  - ✓ LCP (Largest Contentful Paint) < 2.5s
  - ✓ CLS (Cumulative Layout Shift) < 0.1
  - ✓ First image has `fetchpriority="high"`
  - ✓ Subsequent images are lazy-loaded

### Lighthouse Audit (Mobile)
- [ ] Run Lighthouse on mobile
  - ✓ LCP < 2.5s
  - ✓ CLS < 0.1
  - ✓ Images have explicit width/height

### Network Throttling
- [ ] Test on "Fast 3G" throttling
  - ✓ Images load progressively
  - ✓ No layout shift during load
  - ✓ Placeholder space reserved

---

## 🔍 Visual Regression Testing

### Compare Before/After
- [ ] **Hero Image**
  - Before: Image cropped, zoomed in
  - After: Full image visible, centered
  - ✓ Improvement confirmed

- [ ] **Carousel Cards**
  - Before: Product cropped
  - After: Full product visible
  - ✓ Improvement confirmed

### Letterboxing Appearance
- [ ] Check background color
  - ✓ Light gray (#f5f5f5) is professional
  - ✓ Not distracting from product
  - ✓ Consistent across all images

---

## 🌐 Browser Compatibility

### Chrome (Latest)
- [ ] Desktop: ✓ All tests pass
- [ ] Mobile: ✓ All tests pass

### Safari (Latest)
- [ ] Desktop: ✓ All tests pass
- [ ] iOS: ✓ All tests pass

### Firefox (Latest)
- [ ] Desktop: ✓ All tests pass
- [ ] Mobile: ✓ All tests pass

### Edge (Latest)
- [ ] Desktop: ✓ All tests pass

---

## 🐛 Known Issues / Notes

### Issue Tracking
- [ ] No issues found ✅
- [ ] Issues logged: _________________

### Notes
```
Add any observations or edge cases discovered during testing:

1. 
2. 
3. 
```

---

## ✅ Sign-Off

**Tested By:** _________________  
**Date:** _________________  
**Status:** [ ] Pass [ ] Fail [ ] Needs Review  

**Approved By:** _________________  
**Date:** _________________  

---

## Quick Test URLs

```
Desktop Product Page:
http://localhost:8888/product.html?slug=cant-catch-us-hoodie

Mobile Product Page (Chrome DevTools):
http://localhost:8888/product.html?slug=cant-catch-us-hoodie
(Set to iPhone 12 Pro, 390x844)

Homepage:
http://localhost:8888/index.html

Collection Page:
http://localhost:8888/collection.html?collection=tees
```

---

## Rollback Criteria

If any of these occur, consider rollback:
- [ ] LCP increases by >500ms
- [ ] CLS increases above 0.1
- [ ] Product images appear distorted
- [ ] Layout breaks on any major device
- [ ] User complaints about image visibility

---

**Last Updated:** 2025-10-13  
**Version:** 1.0

