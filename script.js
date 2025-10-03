// Journey Apparel interactions
(function () {
  const $ = (s, ctx = document) => ctx.querySelector(s);
  const $$ = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));

  function ensureStandardHeader() {
    // If a header already exists, do nothing (prevents affecting existing pages)
    if (document.querySelector("header.header")) return;
    const tpl = `
<div class="announcement upper" data-injected="1" style="position: sticky; top: 0; left: 0; right: 0">
  Free Shipping On Orders Over $100
</div>
<header class="header" data-injected="1" style="top: 0; left: 0; right: 0">
  <div class="container header-inner" style="max-width: none; width: 100%; padding-left: 16px; padding-right: 16px;">
    <div class="nav-left row">
      <button class="menu-toggle" aria-label="Open menu" style="background: transparent; border: none; padding: 8px; display: inline-flex; flex-direction: column; gap: 4px; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 0; box-shadow: none;">
        <span style="display:block; width:22px; height:2px; background:#000; border-radius:1px;"></span>
        <span style="display:block; width:22px; height:2px; background:#000; border-radius:1px;"></span>
        <span style="display:block; width:22px; height:2px; background:#000; border-radius:1px;"></span>
      </button>
      <nav class="nav" aria-label="Primary">
        <a href="#" class="header-item">Shop
          <div class="mega" role="dialog" aria-label="Mega menu">
            <div class="mega-grid container">
              <div>
                <h4 class="upper">Shop by Category</h4>
                <div class="links">
                  <a href="collection.html?collection=tops">Tees</a>
                  <a href="collection.html?collection=hoodies">Hoodies</a>
                  <a href="collection.html?collection=bottoms">Bottoms</a>
                  <a href="collection.html?collection=accessories">Accessories</a>
                </div>
              </div>
              <div>
                <h4 class="upper">Shop by Collection</h4>
                <div class="links">
                  <a href="collection.html">AeroLite</a>
                  <a href="collection.html">Journey</a>
                  <a href="collection.html">Core365</a>
                  <a href="collection.html">Black Label</a>
                </div>
              </div>
            </div>
          </div>
        </a>
        <a href="collection.html" class="header-item">Collections</a>
        <a href="collection.html" class="header-item">New In</a>
        <a href="collection.html" class="header-item">Sale<span class="badge">-20%</span></a>
      </nav>
    </div>
    <h1 class="logo"><a href="index.html" aria-label="Journey Apparel Home">JOURNEY</a></h1>
    <div id="site-search" style="position: fixed; inset: 0 0 auto 0; top: 0; background: rgba(0,0,0,.6); backdrop-filter: blur(2px); z-index: 1000; display: none; padding: 12px 16px;">
      <form id="site-search-form" style="max-width: 800px; margin: 0 auto; display: flex; gap: 8px">
        <input id="site-search-input" type="search" placeholder="Search pages or sections (e.g., New Arrivals, Best Sellers, Pair It With, Cart)" style="flex:1; padding:12px; border-radius:8px; border:1px solid #ddd; font-size:16px; background:#fff" />
        <button type="submit" style="padding:12px 16px; border-radius:8px; border:1px solid #ddd; background:#fff; font-weight:600; cursor:pointer;">Go</button>
        <button type="button" id="site-search-close" style="padding:12px 14px; border-radius:8px; border:1px solid #ddd; background:#fff; cursor:pointer;">×</button>
      </form>
    </div>
    <div id="cart-overlay" style="position: fixed; inset: 0; background: rgba(0,0,0,.4); z-index: 1000; display: none;"></div>
    <aside id="cart-drawer" style="position: fixed; top:0; right:0; bottom:0; width:88%; max-width:420px; background:#fff; box-shadow: -2px 0 12px rgba(0,0,0,.15); transform: translateX(100%); transition: transform .25s ease; z-index:1001; display:flex; flex-direction:column;">
      <div style="display:flex; align-items:center; justify-content:space-between; padding:12px 16px; border-bottom:1px solid #eee;">
        <div style="font-weight:800">Your Cart</div>
        <button id="cart-close" style="border:0; background:none; font-size:24px; cursor:pointer;">×</button>
      </div>
      <div id="cart-items" style="flex:1; overflow:auto; padding:12px 16px"></div>
      <div style="border-top:1px solid #eee; padding:12px 16px">
        <div style="display:flex; justify-content:space-between; margin-bottom:8px;"><span>Subtotal</span><span id="cart-subtotal">$0.00</span></div>
        <button id="checkout-btn" style="width:100%; padding:12px; border-radius:8px; background:#000; color:#fff; font-weight:600; cursor:pointer;">Checkout</button>
      </div>
    </aside>
    <div class="nav-right">
      <button class="icon-btn" aria-label="Search">🔍</button>
      <button class="icon-btn" aria-label="Account">👤</button>

      <a class="icon-btn" aria-label="Cart" href="#">🛒</a>
    </div>
  </div>
</header>
<div id="drawer-overlay" class="drawer-overlay" aria-hidden="true"></div>
<aside id="mobile-drawer" class="drawer" aria-hidden="true" aria-label="Mobile navigation drawer">
  <div class="drawer-top">
    <button class="drawer-close" aria-label="Close menu">×</button>
    <a href="#" class="cart-link" aria-label="Cart">Cart <span id="cart-count">0</span> 🛒</a>
  </div>
  <nav class="drawer-nav" aria-label="Mobile navigation">
    <a href="collection.html?section=new-arrivals" class="row-item">New Arrivals</a>
    <a href="collection.html?section=back-in-stock" class="row-item">Back in Stock</a>
    <a href="collection.html?section=shop-all" class="row-item">Shop All</a>
    <button class="row-item accordion" data-accordion aria-expanded="false">Shop by Category <span class="chev">›</span></button>
    <div class="sub">
      <a href="collection.html?collection=tops">Tees</a>
      <a href="collection.html?collection=hoodies">Hoodies</a>
      <a href="collection.html?collection=shorts">Shorts</a>
      <a href="collection.html?collection=pants">Pants</a>
      <a href="collection.html?collection=accessories">Accessories</a>
    </div>
    <button class="row-item accordion" data-accordion aria-expanded="false">Shop by Collection <span class="chev">›</span></button>
    <div class="sub">
      <a href="collection.html?collection=best-sellers">Best Sellers</a>
      <a href="collection.html?collection=ss25">SS/25</a>
      <a href="collection.html?collection=lightweight">Lightweight</a>
      <a href="collection.html?collection=boxing">Boxing</a>
      <a href="collection.html?collection=womens-activewear">Women’s Activewear</a>
    </div>
    <a href="#" class="row-item">Gift Cards</a>
    <a href="/account/register.html" class="row-item">Journey Sign Up</a>
    <button class="row-item accordion" data-accordion aria-expanded="false">Customer Care <span class="chev">›</span></button>
    <div class="sub">
      <a href="#">Exchanges & Returns</a>
      <a href="#">Shipping</a>
      <a href="#">Policies</a>
      <a href="#">Contact</a>
    </div>
  </nav>
  <div class="drawer-bottom"><a href="#" class="row-item">👤 Log in / Create Account</a></div>
</aside>`;
    document.body.insertAdjacentHTML("afterbegin", tpl);
  }
  document.addEventListener("DOMContentLoaded", () => {
    // Ensure standard header exists before wiring behaviors (no-op if already present)
    try {
      ensureStandardHeader();
    } catch (e) {
      console.error("[init] ensureStandardHeader failed:", e);
    }

    // De-duplicate any auto-injected header/announcement if a page header exists
    try {
      const headers = document.querySelectorAll("header.header");
      if (headers.length > 1) {
        headers.forEach((h) => {
          if (h.dataset && h.dataset.injected === "1") h.remove();
        });
      }
      const anns = document.querySelectorAll(".announcement.upper");
      if (anns.length > 1) {
        anns.forEach((a) => {
          if (a.dataset && a.dataset.injected === "1") a.remove();
        });
      }
    } catch (e) {}

    const __safe = (name, fn) => {
      try {
        fn && fn();
      } catch (e) {
        console.error("[init]", name, "failed:", e);
      }
    };

    __safe("setupMobileNav", setupMobileNav);
    __safe("setupMegaMenuHoverIntent", setupMegaMenuHoverIntent);

    __safe("setupCarousel", setupCarousel);
    __safe("setupQuickShopTouch", setupQuickShopTouch);
    __safe("setupCardLinks", setupCardLinks);

    __safe("setupModalFreeShipping", setupModalFreeShipping);
    __safe("setupCountdown", setupCountdown);
    __safe("setupNewsletter", setupNewsletter);
    __safe("setupCurrency", setupCurrency);
    __safe("setupChatWidget", setupChatWidget);
    __safe("setupCollapsibles", setupCollapsibles);
    __safe("setupGallery", setupGallery);
    __safe("setupFilters", setupFilters);
    __safe("setupCollectionFromQuery", setupCollectionFromQuery);
    __safe("setupCollectionUI", setupCollectionUI);
    __safe("setupProductFromSlug", setupProductFromSlug);
    __safe("setupHomepageProducts", setupHomepageProducts);
    __safe(
      "setupRecentlyViewedAndBestSellers",
      setupRecentlyViewedAndBestSellers
    );
    __safe("setupSizeSelection", setupSizeSelection);
    __safe("setupWishlist", setupWishlist);

    // New: sitewide search and cart
    __safe("setupSearch", setupSearch);
    __safe("setupSearchHover", setupSearchHover);
    __safe("setupCart", setupCart);
    __safe("setupAddToCart", setupAddToCart);

    __safe("setupAddToCartGuard", setupAddToCartGuard);
    __safe("normalizeTitleAndAnnouncement", normalizeTitleAndAnnouncement);
    __safe("enableHoverSwapIn", enableHoverSwapIn);
    __safe("setupImageFallbacks", setupImageFallbacks);
    __safe("setupThematicImages", setupThematicImages);
    __safe("normalizeCarouselMedia", normalizeCarouselMedia);
    __safe("setupMobileCTA", setupMobileCTA);
    __safe("enforcePointerCursor", enforcePointerCursor);
    __safe("applyDesktopHeaderZIndexFix", applyDesktopHeaderZIndexFix);
    __safe("ensureShopClickToggle", ensureShopClickToggle);
    __safe("applyDesktopButtonHoverStyles", applyDesktopButtonHoverStyles);
    __safe("applyDesktopPointerCursorCSS", applyDesktopPointerCursorCSS);
  });

  function setupSizeSelection() {
    const grid = document.getElementById("size-grid");
    if (!grid) return;
    grid.querySelectorAll(".size").forEach((btn) => {
      btn.addEventListener("click", () => {
        grid.querySelectorAll(".size").forEach((b) => {
          b.classList.remove("selected");
          b.setAttribute("aria-pressed", "false");
        });
        btn.classList.add("selected");
        btn.setAttribute("aria-pressed", "true");
      });
    });
  }

  function setupAddToCartGuard() {
    const addBtn = Array.from(
      document.querySelectorAll(".p-details .btn")
    ).find((b) => /add\s*to\s*cart/i.test(b.textContent || ""));
    if (!addBtn) return;
    addBtn.addEventListener("click", (e) => {
      const selected = document.querySelector(
        '#size-grid .size[aria-pressed="true"]'
      );
      if (!selected) {
        e.preventDefault();
        alert("Please select a size first.");
      }
    });
  }

  async function setupProductFromSlug() {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get("slug");
    if (!slug) return;

    let __pdpSetupDone = false;
    const renderFrom = (p) => {
      if (!p) return;
      // Update page title
      document.title = `${p.title} – Journey Apparel`;

      const titleEl = document.querySelector(".p-details h1");
      const priceEl = document.querySelector(".p-details .p-price");
      const descriptionEl = document.querySelector(".p-details .p-description");

      // New gallery (preferred)
      const mainGalleryImg = document.querySelector(".gallery-main img");
      const galleryThumbs = Array.from(
        document.querySelectorAll(".thumbs img")
      );

      // Legacy edge-peek gallery (if present)
      const mainImg = document.querySelector(".edge-gallery .main");
      const leftImg = document.querySelector(".edge-gallery .left");
      const rightImg = document.querySelector(".edge-gallery .right");

      if (titleEl) titleEl.textContent = p.title;
      if (priceEl) {
        const price = parseFloat(p.priceRange.minVariantPrice.amount);
        priceEl.textContent = `$${price.toFixed(2)} ${
          p.priceRange.minVariantPrice.currencyCode
        }`;
      }
      if (descriptionEl) {
        descriptionEl.innerHTML = p.description || "";
      }

      // Use Shopify images
      const images = p.images || [];
      const mainImage = images[0]?.url || "";
      const altImage = images[1]?.url || "";

      if (mainGalleryImg && mainImage) {
        mainGalleryImg.src = mainImage;
        mainGalleryImg.alt = p.title;
        if (galleryThumbs[0]) {
          galleryThumbs[0].src = mainImage;
          galleryThumbs[0].alt = p.title;
        }
        if (galleryThumbs[1] && altImage) {
          galleryThumbs[1].src = altImage;
          galleryThumbs[1].alt = p.title + " alt";
        }
      }

      if (mainImg && mainImage) {
        mainImg.src = mainImage;
        mainImg.alt = p.title;
      }
      if (rightImg && altImage) {
        rightImg.src = altImage;
        rightImg.alt = p.title + " alt";
      }

      // Populate hero carousel (#hero-track) with Shopify images
      try {
        const heroTrack = document.getElementById("hero-track");
        if (heroTrack && images && images.length) {
          const trackImgs = Array.from(heroTrack.querySelectorAll("img"));
          // Update existing placeholders
          if (trackImgs[0] && images[0]) {
            trackImgs[0].src = images[0].url;
            trackImgs[0].alt = p.title;
          }
          if (trackImgs[1] && images[1]) {
            trackImgs[1].src = images[1].url;
            trackImgs[1].alt = p.title + " alt 1";
          }
          if (trackImgs[2] && images[2]) {
            trackImgs[2].src = images[2].url;
            trackImgs[2].alt = p.title + " alt 2";
          }
          // Append any remaining images so the next/prev controls can scroll to them
          for (let i = trackImgs.length; i < images.length; i++) {
            const img = document.createElement("img");
            img.src = images[i].url;
            img.alt = `${p.title} alt ${i}`;
            img.style.width = "100%";
            img.style.height = "100%";
            img.style.borderRadius = "0";
            img.style.objectFit = "cover";
            img.style.scrollSnapAlign = "center";
            img.style.pointerEvents = "none";
            img.style.transition = "none";
            heroTrack.appendChild(img);
          }
          // Rebuild dots to match new image count
          const dotsWrap = document.getElementById("hero-dots");
          if (dotsWrap) {
            dotsWrap.innerHTML = "";
            const imgsNow = Array.from(heroTrack.querySelectorAll("img"));
            imgsNow.forEach((_, i) => {
              const dot = document.createElement("span");
              dot.setAttribute("data-idx", String(i));
              dot.style.cssText =
                "width:8px;height:8px;border-radius:50%;background:#c7c7c7;display:inline-block;transition:background .2s;";
              dot.addEventListener("click", function () {
                const el = imgsNow[i];
                if (el)
                  heroTrack.scrollTo({
                    left: el.offsetLeft,
                    behavior: "smooth",
                  });
              });
              dotsWrap.appendChild(dot);
            });
          }
        }
      } catch (e) {
        console.warn("hero-track population failed", e);
      }

      // Wire prev/next controls to navigate images reliably
      try {
        const heroTrack = document.getElementById("hero-track");
        if (!heroTrack) throw new Error("heroTrack missing");

        const prev = document.querySelector(".hero-carousel .ctrl.prev");
        const next = document.querySelector(".hero-carousel .ctrl.next");

        const slides = () => Array.from(heroTrack.querySelectorAll("img"));
        const slideW = () => heroTrack.clientWidth;
        const count = () => slides().length;
        const idx = () =>
          Math.round(heroTrack.scrollLeft / Math.max(1, slideW()));
        const clamp = (i) => Math.max(0, Math.min(count() - 1, i));
        const goTo = (i) => {
          const target = clamp(i);
          heroTrack.scrollTo({ left: target * slideW(), behavior: "smooth" });
        };

        if (prev) {
          prev.addEventListener(
            "click",
            (e) => {
              e.preventDefault();
              goTo(idx() - 1);
            },
            { passive: false }
          );
        }
        if (next) {
          next.addEventListener(
            "click",
            (e) => {
              e.preventDefault();
              goTo(idx() + 1);
            },
            { passive: false }
          );
        }
      } catch (_) {}

      if (!__pdpSetupDone) {
        // Setup product variants and add to cart functionality
        try {
          setupProductVariants(p);
        } catch (_) {}
        try {
          setupLiveSizePicker(p);
        } catch (e) {
          console.warn("size picker failed", e);
        }
        __pdpSetupDone = true;
      }
    };

    // Instant render from cache when available
    try {
      const cached = __cacheGetFresh("pdp:product:" + slug, 10 * 60 * 1000);
      if (cached) renderFrom(cached);
    } catch (_) {}

    try {
      // Load product from Shopify (if available)
      if (window.shopifyAPI) {
        const response = await window.shopifyAPI.getProduct(slug);
        const p = response.product;

        if (!p) {
          console.error("Product not found:", slug);
          return;
        }
        __cacheSet("pdp:product:" + slug, p);
        renderFrom(p);
      } else {
        // Fallback to original product loading logic if Shopify not available
        console.log(
          "Shopify API not available, using fallback product loading"
        );
      }
    } catch (error) {
      console.error("Failed to load product:", error);
    }
  }

  function setupProductVariants(product) {
    // Create variant selector if product has options
    if (product.options && product.options.length > 0) {
      const sizeGrid = document.getElementById("size-grid");
      const variantContainer =
        document.querySelector(".p-variants") ||
        document.querySelector(".p-details");

      // If a dedicated size grid exists, prefer it and do NOT render dropdown selectors
      if (
        !sizeGrid &&
        variantContainer &&
        !variantContainer.querySelector(".variant-selectors")
      ) {
        const variantHTML = createVariantSelectors(product);
        const variantDiv = document.createElement("div");
        variantDiv.className = "variant-selectors";
        variantDiv.innerHTML = variantHTML;

        // Insert before add to cart button
        const addToCartBtn =
          variantContainer.querySelector(".add-to-cart, .btn");
        if (addToCartBtn) {
          variantContainer.insertBefore(variantDiv, addToCartBtn);
        } else {
          variantContainer.appendChild(variantDiv);
        }
      }
    }

    // Setup add to cart functionality
    setupAddToCart(product);
  }

  function createVariantSelectors(product) {
    let html = "";

    product.options.forEach((option) => {
      html += `
        <div class="variant-option" style="margin-bottom: 16px;">
          <label style="display: block; font-weight: 500; margin-bottom: 8px;">${
            option.name
          }</label>
          <select name="option_${option.name.toLowerCase()}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
            ${option.values
              .map((value) => `<option value="${value}">${value}</option>`)
              .join("")}
          </select>
        </div>
      `;
    });

    return html;
  }

  // Live Size picker using Netlify function product-variants (with cache-first render)
  async function setupLiveSizePicker(product) {
    const here = (location.pathname.split("/").pop() || "").toLowerCase();
    if (!here.endsWith("product.html")) return; // only on PDP

    // Derive handle from ?slug, path last segment, or data attribute
    const deriveHandle = () => {
      const p = new URLSearchParams(location.search).get("slug");
      if (p) return p;
      const last = location.pathname.split("/").filter(Boolean).pop();
      if (last && last !== "product.html") return last;
      const el = document.querySelector("[data-product-handle]");
      return (el && el.getAttribute("data-product-handle")) || null;
    };

    const handle = deriveHandle();
    if (!handle) return;

    // Target container: reuse legacy #size-grid if present
    const grid = document.getElementById("size-grid");
    if (!grid) return;

    const renderFrom = (data) => {
      if (!data || !data.variants) return;
      // Build a map from Size value -> variant meta
      const bySize = new Map();
      (data.variants || []).forEach((v) => {
        const so = (v.selectedOptions || []).find(
          (o) => (o.name || "").toLowerCase() === "size"
        );
        if (so)
          bySize.set(so.value, {
            id: v.id,
            available: !!v.availableForSale,
            qty: v.quantityAvailable ?? null,
          });
      });

      const values =
        (data.options || []).find(
          (o) => (o.name || "").toLowerCase() === "size"
        )?.values || Array.from(bySize.keys());
      if (!values || !values.length) return;

      // Ensure hidden input exists for variantId
      let hidden = document.querySelector(
        "input[name='variantId'], input[name='variant_id']"
      );
      if (!hidden) {
        hidden = document.createElement("input");
        hidden.type = "hidden";
        hidden.name = "variantId";
        const ctaRow =
          document.querySelector(".p-details .cta-row") ||
          document.querySelector(".p-details");
        if (ctaRow) ctaRow.insertAdjacentElement("afterbegin", hidden);
      }

      const saved = (() => {
        try {
          return localStorage.getItem("pdp:lastSize:" + handle) || "";
        } catch (_) {
          return "";
        }
      })();

      // Render buttons
      grid.innerHTML = "";
      values.forEach((val) => {
        const meta = bySize.get(val) || {};
        const btn = document.createElement("button");
        btn.className = "size";
        btn.textContent = val;
        const disabled =
          meta.available === false ||
          (typeof meta.qty === "number" && meta.qty <= 0);
        if (disabled) {
          btn.setAttribute("disabled", "true");
          btn.style.opacity = "0.5";
          btn.style.cursor = "not-allowed";
        }
        if (!disabled && typeof meta.qty === "number" && meta.qty <= 3) {
          const low = document.createElement("span");
          low.textContent = "  Low stock";
          low.style.fontSize = "11px";
          low.style.color = "#c20";
          btn.appendChild(low);
        }
        btn.addEventListener("click", function (e) {
          e.preventDefault();
          if (btn.disabled) return;
          // toggle selected state
          Array.from(
            grid.querySelectorAll('.size[aria-pressed="true"]')
          ).forEach(function (b) {
            b.setAttribute("aria-pressed", "false");
          });
          btn.setAttribute("aria-pressed", "true");
          // persist + store variant id
          const meta2 = bySize.get(val) || {};
          if (meta2.id && hidden) {
            hidden.value = meta2.id;
            try {
              localStorage.setItem("pdp:lastSize:" + handle, val);
            } catch (e) {}
            // enable Add to Cart
            var addBtn = Array.from(
              document.querySelectorAll(".p-details .btn, .add-to-cart")
            ).find(function (b) {
              return /add\s*to\s*cart/i.test(b.textContent || "");
            });
            if (addBtn) addBtn.disabled = false;
          }
        });
        grid.appendChild(btn);
      });

      // Default preselect saved or first available (do not override if already selected)
      if (!grid.querySelector('.size[aria-pressed="true"]')) {
        let toSelect = null;
        if (saved) {
          toSelect = Array.from(grid.querySelectorAll(".size")).find(function (
            b
          ) {
            return (
              (b.textContent || "").trim().startsWith(saved) && !b.disabled
            );
          });
        }
        if (!toSelect) toSelect = grid.querySelector(".size:not([disabled])");
        if (toSelect) toSelect.click();
      }
    };

    try {
      // Cache-first render for instant size grid
      const cached = __cacheGetFresh("pdp:variants:" + handle, 10 * 60 * 1000);
      if (cached && cached.variants) renderFrom(cached);

      // Fetch fresh in background and update if needed
      const resp = await fetch(
        `/.netlify/functions/product-variants?handle=${encodeURIComponent(
          handle
        )}`
      );
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      if (!data || !data.variants) throw new Error("No variant data");
      __cacheSet("pdp:variants:" + handle, data);
      renderFrom(data);
    } catch (e) {
      console.warn("Failed to load product-variants", e);
    }
  }

  function setupAddToCart(product) {
    const addToCartBtns = Array.from(
      document.querySelectorAll(
        '.add-to-cart, .btn[data-action="add-to-cart"], .p-details .btn'
      )
    ).filter((b) => /add\s*to\s*cart/i.test(b.textContent || ""));

    addToCartBtns.forEach((btn) => {
      btn.onclick = async (e) => {
        e.preventDefault();

        // Get selected variant (prefer hidden variantId set by Size picker)
        const hiddenInput = document.querySelector(
          "input[name='variantId'], input[name='variant_id']"
        );
        const chosenId =
          hiddenInput && hiddenInput.value ? hiddenInput.value : "";
        let selectedVariant = null;
        if (chosenId) {
          selectedVariant = (product.variants || []).find(
            (v) => v.id === chosenId
          ) || { id: chosenId };
        } else {
          selectedVariant = getSelectedVariant(product);
        }

        if (!selectedVariant || !selectedVariant.id) {
          alert("Please choose a size.");
          return;
        }

        if (
          Object.prototype.hasOwnProperty.call(
            selectedVariant,
            "availableForSale"
          ) &&
          selectedVariant.availableForSale === false
        ) {
          alert("This item is currently unavailable");
          try {
            btn.disabled = true;
            btn.textContent = "Unavailable";
          } catch (_) {}
          return;
        }

        try {
          btn.disabled = true;
          btn.textContent = "Adding...";

          // Update localStorage cart lines (permalink-based checkout)
          const CP = window.CartPermalink || {};
          const getLines =
            typeof CP.getLines === "function"
              ? CP.getLines
              : function () {
                  try {
                    return JSON.parse(
                      localStorage.getItem("ja_cart_lines") || "[]"
                    );
                  } catch (_) {
                    return [];
                  }
                };
          const setLines =
            typeof CP.setLines === "function"
              ? CP.setLines
              : function (lines) {
                  try {
                    const filtered = (lines || []).filter(
                      (l) => Number(l.quantity) > 0
                    );
                    localStorage.setItem(
                      "ja_cart_lines",
                      JSON.stringify(filtered)
                    );
                  } catch (_) {}
                };

          const lines = getLines() || [];
          const idx = Array.isArray(lines)
            ? lines.findIndex((l) => l && l.variantGid === selectedVariant.id)
            : -1;
          if (idx >= 0) {
            lines[idx].quantity = Math.max(
              1,
              Number(lines[idx].quantity || 0) + 1
            );
          } else {
            lines.push({ variantGid: selectedVariant.id, quantity: 1 });

            // Also update mini-cart UI and open the cart drawer
            try {
              const nameEl = document.querySelector(
                ".p-details .upper, .p-details .title, h1, .product-title"
              );
              const name =
                (nameEl && nameEl.textContent.trim()) ||
                (product && product.title) ||
                "";
              let price = "";
              try {
                if (
                  selectedVariant &&
                  selectedVariant.price &&
                  selectedVariant.price.amount
                ) {
                  price = `$${parseFloat(selectedVariant.price.amount).toFixed(
                    2
                  )}`;
                } else {
                  const priceNode =
                    document.querySelector(".p-details .p-price") ||
                    document.querySelector(
                      ".price .current, .product-price .current, .p-details .price .current"
                    );
                  if (priceNode && priceNode.textContent) {
                    price = priceNode.textContent.trim();
                  } else if (
                    product &&
                    product.priceRange &&
                    product.priceRange.minVariantPrice &&
                    product.priceRange.minVariantPrice.amount
                  ) {
                    price = `$${parseFloat(
                      product.priceRange.minVariantPrice.amount
                    ).toFixed(2)}`;
                  }
                }
              } catch (_) {}
              const size =
                (selectedVariant &&
                Array.isArray(selectedVariant.selectedOptions)
                  ? (
                      selectedVariant.selectedOptions.find(function (o) {
                        return String(o.name || "").toLowerCase() === "size";
                      }) || {}
                    ).value
                  : "") || "";
              const image =
                (document.querySelector(".gallery-main img") &&
                  document
                    .querySelector(".gallery-main img")
                    .getAttribute("src")) ||
                (product &&
                  product.images &&
                  product.images[0] &&
                  product.images[0].src) ||
                "";

              // Initialize mini-cart if needed
              if (
                typeof window.openCart !== "function" &&
                typeof window.setupCart === "function"
              ) {
                try {
                  window.setupCart();
                } catch (_) {}
              }

              const items =
                window.__cart && typeof window.__cart.getCart === "function"
                  ? window.__cart.getCart()
                  : [];
              const existing = items.find(function (it) {
                return it.name === name && it.size === size;
              });
              if (existing) existing.qty = (existing.qty || 1) + 1;
              else
                items.push({
                  name: name,
                  price: price,
                  size: size,
                  image: image,
                  qty: 1,
                  variantGid: (selectedVariant && selectedVariant.id) || "",
                });

              if (
                window.__cart &&
                typeof window.__cart.setCart === "function"
              ) {
                window.__cart.setCart(items);
              }
              if (typeof window.openCart === "function") {
                window.openCart();
              }
            } catch (_) {}
          }
          setLines(lines);

          btn.textContent = "Added!";
          setTimeout(() => {
            btn.disabled = false;
            btn.textContent = "Add to Cart";
          }, 1200);
        } catch (error) {
          btn.disabled = false;
          btn.textContent = "Add to Cart";
          console.error("Add to cart failed:", error);

          // Show user-friendly error message
          if (error.message.includes("not available")) {
            alert(
              "Cart functionality requires the site to be deployed to work properly."
            );
          } else {
            alert("Failed to add item to cart. Please try again.");
          }
        }
      };
    });
  }

  function getSelectedVariant(product) {
    const selectors = document.querySelectorAll(".variant-option select");
    const selectedOptions = {};

    selectors.forEach((select) => {
      const optionName = select.name.replace("option_", "");
      selectedOptions[optionName] = select.value;
    });

    // Find matching variant
    return (
      product.variants.find((variant) => {
        return variant.selectedOptions.every((option) => {
          const optionName = option.name.toLowerCase();
          return selectedOptions[optionName] === option.value;
        });
      }) || product.variants[0]
    ); // Fallback to first variant
  }

  function setupRecentlyViewedAndBestSellers() {
    const here = (location.pathname.split("/").pop() || "").toLowerCase();
    if (!here.endsWith("product.html")) return;

    const cardHTML = (it) => {
      const href = it.href || "product.html";
      const price = it.price || "";
      const name = it.name || "";
      const pair = getImagesForLabel(name, 800, 800);
      const altImg = `<img class=\"hover-img\" src=\"${pair.alt}\" alt=\"\" style=\"position:absolute; inset:0; width:100%; height:100%; object-fit:cover; opacity:0; transition: opacity 180ms ease; pointer-events:none;\" />`;
      return `
      <article class="card" data-href="${href}" style="cursor:pointer">
        <a href="${href}" class="img-wrap" onmouseenter="var h=this.querySelector('.hover-img'); if(h){h.style.opacity='1'}" onmouseleave="var h=this.querySelector('.hover-img'); if(h){h.style.opacity='0'}" style="position:relative; display:block; aspect-ratio:3/4; overflow:hidden; border-radius:0">
          <img src="${pair.main}" alt="${name}" style="position:absolute; inset:0; width:100%; height:100%; object-fit:cover"/>
          ${altImg}
        </a>
        <div class="row mt-8" style="display:flex; flex-direction:column; align-items:center; gap:6px; margin-top:8px; font-size:14px; text-align:center;">
          <span style="font-weight:400; text-transform:uppercase; font-size:12px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:95%">${name}</span>
          <span class="price" style="font-weight:400">${price}</span>
        </div>
      </article>`;
    };

    // Recently Viewed: render from localStorage if present
    try {
      const track = document.querySelector("#you-also-viewed .carousel-track");
      if (track) {
        const items = JSON.parse(
          localStorage.getItem("recentlyViewedV1") || "[]"
        ).filter(Boolean);
        if (items && items.length) {
          track.innerHTML = items.map(cardHTML).join("");
        }
      }
    } catch (_) {}

    // Best Sellers: populate a longer list so arrows can scroll through
    const bestSection = document.querySelector("#featured-collection");
    const bestTrack =
      bestSection && bestSection.querySelector(".carousel-track");
    if (bestTrack) {
      const best = [
        {
          name: "City Hoodie",
          price: "$98.00 AUD",
          main: "https://images.unsplash.com/photo-1547949003-9792a18a2601?q=80&w=800&auto=format&fit=crop",
          alt: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=800&auto=format&fit=crop",
          href: "product.html?slug=city-hoodie",
        },
        {
          name: "Aero Tee",
          price: "$48.00 AUD",
          main: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=800&auto=format&fit=crop",
          alt: "https://images.unsplash.com/photo-1528701800489-20be0b02f47e?q=80&w=800&auto=format&fit=crop",
          href: "product.html?slug=aero-tee",
        },
        {
          name: "Tech Tee",
          price: "$48.00 AUD",
          main: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=800&auto=format&fit=crop",
          alt: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop",
          href: "product.html?slug=tech-tee",
        },
        {
          name: "Aero Jogger",
          price: "$78.00 AUD",
          main: "https://images.unsplash.com/photo-1520975922324-c2e5a62b2398?q=80&w=800&auto=format&fit=crop",
          alt: "https://images.unsplash.com/photo-1535530992830-e25d07cfa780?q=80&w=800&auto=format&fit=crop",
          href: "product.html?slug=aero-jogger",
        },
        {
          name: "City Hoodie",
          price: "$98.00 AUD",
          main: "https://images.unsplash.com/photo-1547949003-9792a18a2601?q=80&w=800&auto=format&fit=crop",
          alt: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=800&auto=format&fit=crop",
          href: "product.html?slug=city-hoodie",
        },
        {
          name: "Ultra Short",
          price: "$58.00 AUD",
          main: "https://images.unsplash.com/photo-1535530992830-e25d07cfa780?q=80&w=800&auto=format&fit=crop",
          alt: "https://images.unsplash.com/photo-1520975922324-c2e5a62b2398?q=80&w=800&auto=format&fit=crop",
          href: "product.html?slug=ultra-short",
        },
        {
          name: "Aero Jogger",
          price: "$78.00 AUD",
          main: "https://images.unsplash.com/photo-1520975922324-c2e5a62b2398?q=80&w=800&auto=format&fit=crop",
          alt: "https://images.unsplash.com/photo-1535530992830-e25d07cfa780?q=80&w=800&auto=format&fit=crop",
          href: "product.html?slug=aero-jogger",
        },
      ];

      let idx = 0;
      const renderPair = () => {
        if (!best.length) return;
        const a = best[idx % best.length];
        const b = best[(idx + 1) % best.length];
        bestTrack.innerHTML = [cardHTML(a), cardHTML(b)].join("");
      };
      renderPair();

      const prevBtn = bestSection && bestSection.querySelector(".ctrl.prev");
      const nextBtn = bestSection && bestSection.querySelector(".ctrl.next");
      if (prevBtn) {
        prevBtn.removeAttribute("onclick");
        prevBtn.addEventListener("click", (e) => {
          e.preventDefault();
          idx = (idx - 2 + best.length) % best.length;
          renderPair();
        });
      }
      if (nextBtn) {
        nextBtn.removeAttribute("onclick");
        nextBtn.addEventListener("click", (e) => {
          e.preventDefault();
          idx = (idx + 2) % best.length;
          renderPair();
        });
      }
    }
  }

  function setupMobileNav() {
    const toggle = $(".menu-toggle");
    if (!toggle) return;
    const drawer = $("#mobile-drawer");
    const overlay = $("#drawer-overlay");
    const closeBtn = $(".drawer-close");
    const nav = $(".nav"); // desktop fallback

    // Ensure mobile drawer text/icons are black (no default link blue)
    const paint = () => {
      if (!drawer) return;
      [
        ...drawer.querySelectorAll(
          "a, button, .row-item, .drawer-close, .chev"
        ),
      ].forEach((el) => {
        el.style.color = "#111";
        if (el.tagName === "A") el.style.textDecoration = "none";
      });
    };

    // Safety: ensure no stale scroll lock
    document.body.style.overflow = "";

    const open = () => {
      if (drawer) {
        drawer.classList.add("open");
        drawer.setAttribute("aria-hidden", "false");
        overlay && overlay.classList.add("active");
        document.body.style.overflow = "hidden";
        paint();
        try {
          if (window.innerWidth >= 1024) {
            var header = document.querySelector("header.header");
            var top = header ? header.getBoundingClientRect().bottom : 0;
            if (overlay) {
              overlay.style.top = top + "px";
              overlay.style.left = "0";
              overlay.style.right = "0";
              overlay.style.bottom = "0";
            }
            if (drawer) {
              drawer.style.top = top + "px";
              drawer.style.height = "calc(100vh - " + top + "px)";
            }
          } else {
            if (overlay) overlay.style.top = "0";
            if (drawer) {
              drawer.style.top = "0";
              drawer.style.height = "";
            }
          }
        } catch (_) {}
      } else if (nav) {
        nav.classList.add("open");
      }
      toggle.setAttribute("aria-expanded", "true");
    };
    const close = () => {
      if (drawer) {
        drawer.classList.remove("open");
        drawer.setAttribute("aria-hidden", "true");

        overlay && overlay.classList.remove("active");
        document.body.style.overflow = "";
        try {
          if (window.innerWidth >= 1024) {
            // Keep the drawer aligned under the header during the close animation
            var header = document.querySelector("header.header");
            var top = header ? header.getBoundingClientRect().bottom : 0;
            if (overlay) overlay.style.top = top + "px";
            if (drawer) {
              drawer.style.top = top + "px";
              drawer.style.height = "calc(100vh - " + top + "px)";
            }
            // After the transition ends, optionally reset for mobile use
            setTimeout(function () {
              if (window.innerWidth < 1024) {
                if (overlay) overlay.style.top = "0";
                if (drawer) {
                  drawer.style.top = "0";
                  drawer.style.height = "";
                }
              }
            }, 360);
          } else {
            if (overlay) overlay.style.top = "0";
            if (drawer) {
              drawer.style.top = "0";
              drawer.style.height = "";
            }
          }
        } catch (_) {}
      } else if (nav) {
        nav.classList.remove("open");
      }
      toggle.setAttribute("aria-expanded", "false");
    };

    toggle.setAttribute("aria-expanded", "false");
    toggle.addEventListener("click", () => {
      const isOpen = drawer
        ? drawer.classList.contains("open")
        : nav?.classList.contains("open");
      isOpen ? close() : open();
    });

    overlay && overlay.addEventListener("click", close);
    closeBtn && closeBtn.addEventListener("click", close);
    document.addEventListener("keyup", (e) => {
      if (e.key === "Escape") close();
    });

    if (drawer) {
      drawer.addEventListener("click", (e) => {
        if (e.target.matches("a")) close();
      });
    } else if (nav) {
      nav.addEventListener("click", (e) => {
        if (e.target.matches("a")) close();
      });
    }

    // Close if resizing to desktop
    window.addEventListener("resize", () => {
      if (window.innerWidth >= 992) close();
    });

    setupDrawerAccordions();
  }

  function setupMegaMenuHoverIntent() {
    // Desktop: show mega on hover via CSS; plus click-to-toggle for "Shop"
    const header = $(".header");
    if (!header) return;

    // Escape closes any open mega
    header.addEventListener("keyup", (e) => {
      if (e.key === "Escape")
        $$(".mega", header).forEach((m) => (m.style.display = "none"));
    });

    // Click-to-toggle on desktop (>=1024px) for the Shop item
    const mega = header.querySelector(".nav .header-item .mega");
    if (!mega) return;
    const trigger = mega.parentElement;
    trigger.setAttribute("aria-haspopup", "true");
    trigger.setAttribute("aria-expanded", "false");

    const isDesktop = () => window.innerWidth >= 1024;
    const open = () => {
      mega.style.display = "block";
      trigger.setAttribute("aria-expanded", "true");
    };
    const close = () => {
      mega.style.display = "";
      trigger.setAttribute("aria-expanded", "false");
    };

    trigger.addEventListener("click", (e) => {
      if (!isDesktop()) return; // mobile uses drawer
      e.preventDefault();
      e.stopPropagation();
      const isOpen = mega.style.display === "block";
      if (isOpen) close();
      else open();
    });

    document.addEventListener("click", (e) => {
      if (!isDesktop()) return;
      if (!trigger.contains(e.target)) close();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
    });

    window.addEventListener("resize", () => {
      if (!isDesktop()) close();
    });
  }

  function setupCarousel() {
    $$(".carousel").forEach((carousel) => {
      const rows = $$(".carousel-row", carousel);
      if (rows.length) {
        rows.forEach((row) => {
          const track = $(".carousel-track", row);
          if (!track) return;
          const prevs = $$(".prev", row);
          const nexts = $$(".next", row);
          const step = () => track.clientWidth * 0.8;
          prevs.forEach((btn) =>
            btn.addEventListener("click", () =>
              track.scrollBy({ left: -step(), behavior: "smooth" })
            )
          );
          nexts.forEach((btn) =>
            btn.addEventListener("click", () =>
              track.scrollBy({ left: step(), behavior: "smooth" })
            )
          );
          // drag to scroll for this row
          let startX = 0,
            scrollLeft = 0,
            isDown = false,
            dragged = false;
          track.addEventListener("pointerdown", (e) => {
            isDown = true;
            dragged = false;
            startX = e.pageX;
            scrollLeft = track.scrollLeft;
          });
          track.addEventListener("pointermove", (e) => {
            if (!isDown) return;
            const dx = e.pageX - startX;
            if (Math.abs(dx) > 5) dragged = true;
            track.scrollLeft = scrollLeft - dx;
          });
          track.addEventListener("pointerup", () => {
            isDown = false;
          });
        });
        return; // done for multi-row carousels
      }

      // Fallback: single-track carousel
      const track = $(".carousel-track", carousel);
      if (!track) return;

      const prevs = $$(".prev", carousel);
      const nexts = $$(".next", carousel);
      const step = () => {
        const first = track.children[0];
        if (first) {
          const rect = first.getBoundingClientRect();
          const styles = getComputedStyle(track);
          const gap = parseFloat(styles.columnGap || styles.gap || 0) || 0;
          return rect.width + gap;
        }
        return track.clientWidth * 0.8;
      };
      prevs.forEach((btn) =>
        btn.addEventListener("click", () =>
          track.scrollBy({ left: -step(), behavior: "smooth" })
        )
      );
      nexts.forEach((btn) =>
        btn.addEventListener("click", () =>
          track.scrollBy({ left: step(), behavior: "smooth" })
        )
      );
      let startX = 0,
        scrollLeft = 0,
        isDown = false,
        dragged = false;
      track.addEventListener("pointerdown", (e) => {
        isDown = true;
        dragged = false;
        startX = e.pageX;
        scrollLeft = track.scrollLeft;
      });
      track.addEventListener("pointermove", (e) => {
        if (!isDown) return;
        const dx = e.pageX - startX;
        if (Math.abs(dx) > 5) dragged = true;
        track.scrollLeft = scrollLeft - dx;
      });
      track.addEventListener("pointerup", () => {
        isDown = false;
      });
    });
  }

  // Lightweight localStorage cache helpers + PDP prefetch
  function __cacheSet(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify({ t: Date.now(), v: value }));
    } catch (_) {}
  }
  function __cacheGetFresh(key, maxAgeMs) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const obj = JSON.parse(raw);
      if (!obj || typeof obj.t !== "number") return null;
      if (maxAgeMs != null && Date.now() - obj.t > maxAgeMs) return null;
      return obj.v;
    } catch (_) {
      return null;
    }
  }
  function __prewarmImages(urls) {
    try {
      (urls || []).forEach(function (u) {
        if (!u) return;
        const img = new Image();
        img.decoding = "async";
        img.loading = "eager";
        img.src = u;
      });
    } catch (_) {}
  }
  function __extractHandleFromHref(href) {
    try {
      const u = new URL(href, location.href);
      const h = u.searchParams.get("slug");
      return h || null;
    } catch (_) {
      const m = String(href || "").match(/slug=([^&]+)/);
      return m ? decodeURIComponent(m[1]) : null;
    }
  }
  async function __prefetchPDP(handle) {
    if (!handle) return;
    try {
      if (
        window.shopifyAPI &&
        typeof window.shopifyAPI.getProduct === "function"
      ) {
        const resp = await window.shopifyAPI.getProduct(handle);
        const p = resp && resp.product;
        if (p) {
          __cacheSet("pdp:product:" + handle, p);
          const imgs = (p.images || [])
            .map(function (i) {
              return (i && (i.url || i.src)) || null;
            })
            .filter(Boolean)
            .slice(0, 4);
          __prewarmImages(imgs);
        }
      }
    } catch (_) {}
    try {
      const r = await fetch(
        `/.netlify/functions/product-variants?handle=${encodeURIComponent(
          handle
        )}`
      );
      if (r && r.ok) {
        const data = await r.json();
        if (data) __cacheSet("pdp:variants:" + handle, data);
      }
    } catch (_) {}
  }

  function setupCardLinks() {
    // Delegate clicks so it works for all cards (including dynamically added ones)
    document.addEventListener("click", (e) => {
      if (e.target.closest(".ctrl,a,button")) return;
      const card = e.target.closest(".card[data-href]");
      if (!card) return;
      const href = card.getAttribute("data-href");
      if (href) window.location.href = href;
    });

    // Prefetch PDP data/images on hover/touch/mousedown so PDP renders instantly
    const trigger = (e) => {
      const el = e.target.closest(
        '.card[data-href], a[href*="product.html?slug="]'
      );
      if (!el) return;
      const href =
        el.getAttribute("data-href") ||
        (el.tagName === "A"
          ? el.getAttribute("href")
          : (el.querySelector("a[href]") &&
              el.querySelector("a[href]").getAttribute("href")) ||
            "");
      if (!href) return;
      const handle = __extractHandleFromHref(href);
      if (handle) __prefetchPDP(handle);
    };
    document.addEventListener("mouseenter", trigger, {
      passive: true,
      capture: false,
    });
    document.addEventListener("touchstart", trigger, {
      passive: true,
      capture: false,
    });
    document.addEventListener("mousedown", trigger, {
      passive: true,
      capture: false,
    });
  }

  // Sitewide: enable image hover swap for cards with a secondary hover image
  function enableHoverSwapIn(root) {
    try {
      const scope = root || document;
      const wraps = scope.querySelectorAll(".card .img-wrap");
      wraps.forEach((wrap) => {
        // Look for both .alt and .hover-img classes
        const hoverImg = wrap.querySelector("img.alt, img.hover-img");
        if (!hoverImg) return;

        // Ensure overlay styles (inline per site preference)
        if (!wrap.style.position) wrap.style.position = "relative";
        hoverImg.style.position = "absolute";
        hoverImg.style.inset = "0";
        hoverImg.style.width = "100%";
        hoverImg.style.height = "100%";
        hoverImg.style.zIndex = hoverImg.style.zIndex || "1";
        if (!hoverImg.style.objectFit) hoverImg.style.objectFit = "cover";
        if (!hoverImg.style.transition)
          hoverImg.style.transition = "opacity 180ms ease";
        hoverImg.style.pointerEvents = "none";
        if (!hoverImg.style.opacity) hoverImg.style.opacity = "0";

        // Use the full card as the hover/touch target to avoid overlay intercepts
        const target = wrap.closest("article.card") || wrap;
        const show = () => (hoverImg.style.opacity = "1");
        const hide = () => (hoverImg.style.opacity = "0");

        // Remove any existing event listeners to avoid duplicates
        target.removeEventListener("pointerenter", show);
        target.removeEventListener("pointerleave", hide);
        target.removeEventListener("mouseenter", show);
        target.removeEventListener("mouseleave", hide);
        target.removeEventListener("touchstart", show);
        target.removeEventListener("touchend", hide);
        target.removeEventListener("touchcancel", hide);

        // Add event listeners
        // Pointer events (covers mouse, pen)
        target.addEventListener("pointerenter", show);
        target.addEventListener("pointerleave", hide);
        // Fallback mouse events
        target.addEventListener("mouseenter", show);
        target.addEventListener("mouseleave", hide);
        // Touch devices
        target.addEventListener("touchstart", show, { passive: true });
        target.addEventListener("touchend", hide);
        target.addEventListener("touchcancel", hide);
      });
    } catch (_) {}
  }

  // Normalize carousel/media wrappers on homepage so images always fill and swap correctly
  function normalizeCarouselMedia(root) {
    try {
      const scope = root || document;
      const wraps = scope.querySelectorAll(
        "#new-arrivals .img-wrap, #best-sellers .img-wrap"
      );
      wraps.forEach((wrap) => {
        // wrapper sizing
        wrap.style.position = wrap.style.position || "relative";
        wrap.style.display = wrap.style.display || "block";
        if (!wrap.style.aspectRatio) wrap.style.aspectRatio = "3 / 4";
        wrap.style.overflow = wrap.style.overflow || "hidden";

        const imgs = wrap.querySelectorAll("img");
        imgs.forEach((img, i) => {
          img.style.position = "absolute";
          img.style.inset = "0";
          img.style.width = "100%";
          img.style.height = "100%";
          img.style.objectFit = img.style.objectFit || "cover";
          const isAlt =
            i > 0 ||
            img.classList.contains("alt") ||
            img.classList.contains("hover-img");
          if (isAlt) {
            img.classList.add("hover-img");
            if (!img.style.transition)
              img.style.transition = "opacity 180ms ease";
            img.style.pointerEvents = "none";
            if (!img.style.opacity) img.style.opacity = "0";
          }
        });
        // hover handlers
        wrap.onmouseenter = function () {
          const h = this.querySelector("img.hover-img, img.alt");
          if (h) h.style.opacity = "1";
        };
        wrap.onmouseleave = function () {
          const h = this.querySelector("img.hover-img, img.alt");
          if (h) h.style.opacity = "0";
        };
      });
    } catch (_) {}
  }

  // Desktop-only: show pointer cursor on all clickable elements (icons, chips, arrows, links)
  function enforcePointerCursor(root) {
    try {
      if (window.innerWidth < 1024) return; // desktop only
      var scope = root || document;
      var selectors = [
        "a[href]",
        "button",
        '[role="button"]',
        "[onclick]",
        ".icon-btn",
        ".header-item",
        "nav a",
        ".card",
        "[data-href]",
        ".filter-chip",
        ".size",
        ".accordion button",
        ".menu-toggle",
        ".ctrl",
        ".carousel .panel",
        "label[for]",
      ].join(",");
      scope.querySelectorAll(selectors).forEach(function (el) {
        try {
          el.style.cursor = "pointer";
        } catch (_) {}
      });
      if (!window.__cursorObs && document.body) {
        window.__cursorObs = new MutationObserver(function (muts) {
          muts.forEach(function (m) {
            m.addedNodes &&
              m.addedNodes.forEach(function (n) {
                if (n.nodeType === 1) enforcePointerCursor(n);
              });
          });
        });
        window.__cursorObs.observe(document.body, {
          childList: true,
          subtree: true,
        });
        window.addEventListener("resize", function () {
          if (window.innerWidth >= 1024) enforcePointerCursor();
        });
      }
    } catch (_) {}
  }

  // Desktop-only: ensure header/nav z-index allows Shop to be clickable across pages
  function applyDesktopHeaderZIndexFix() {
    try {
      if (document.getElementById("pc-header-fixes")) return;
      var css = [
        "@media (min-width:1024px){",
        "header.header{position:sticky;top:0;z-index:600 !important;}",
        "header.header .nav{position:relative !important;z-index:601 !important;overflow:visible !important;}",
        "header.header .nav .header-item{position:relative !important;}",
        "header.header .nav .header-item .mega{z-index:700 !important;}",
        "header.header .logo{z-index:1 !important;}",
        "}",
      ].join("");
      var el = document.createElement("style");
      el.id = "pc-header-fixes";
      el.textContent = css;
      document.head && document.head.appendChild(el);
    } catch (_) {}
  }

  // Desktop-only: bind click-to-toggle for the Shop mega menu (idempotent)
  function ensureShopClickToggle() {
    try {
      var header = document.querySelector("header.header");
      if (!header) return;
      var mega = header.querySelector(".nav .header-item .mega");
      if (!mega) return;
      var trigger = mega.parentElement;
      if (!trigger || trigger.__shopBound) return;
      trigger.__shopBound = true;

      var isDesktop = function () {
        return window.innerWidth >= 1024;
      };
      var open = function () {
        mega.style.display = "block";
        trigger.setAttribute("aria-expanded", "true");
      };
      var close = function () {
        mega.style.display = "";
        trigger.setAttribute("aria-expanded", "false");
      };

      var burger = trigger.querySelector(".shop-hamburger");
      trigger.addEventListener("click", function (e) {
        if (!isDesktop()) return;
        if (!e.target.closest(".shop-hamburger")) return; // allow Shop text to navigate
        e.preventDefault();
        e.stopPropagation();
        var isOpen = mega.style.display === "block";
        if (isOpen) close();
        else open();
      });

      document.addEventListener("click", function (e) {
        if (!isDesktop()) return;
        if (!trigger.contains(e.target)) close();
      });

      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") close();
      });

      window.addEventListener("resize", function () {
        if (!isDesktop()) close();
      });
    } catch (_) {}
  }

  // Desktop-only: subtle hover effect for all primary buttons site-wide
  function applyDesktopButtonHoverStyles() {
    try {
      if (document.getElementById("pc-button-hover")) return;
      var css = [
        "@media (min-width:1024px){",
        // Cursor: guarantee pointer on all clickable UI (desktop only)
        "a[href],button,[role=button],[onclick],.icon-btn,.header-item,.card,.filter-chip,.size,.accordion button,.menu-toggle{cursor:pointer !important;}",
        // Base transitions for typical buttons and clickable chips
        "button:not(.ctrl),[role=button]:not(.ctrl),a.btn,.btn,input[type=button],input[type=submit],.icon-btn,.size,.filter-chip,.menu-toggle{",
        "transition: background-color .16s ease,border-color .16s ease,box-shadow .16s ease,filter .16s ease;",
        "}",
        // Hover: subtle visual feedback without shifting position
        "button:not(.ctrl):hover,[role=button]:not(.ctrl):hover,a.btn:hover,.btn:hover,input[type=button]:hover,input[type=submit]:hover,.size:hover,.filter-chip:hover,.menu-toggle:hover{",
        "filter: brightness(0.96);",
        "}",
        // Icon buttons: gentle circular hover background
        ".icon-btn:hover{background:rgba(0,0,0,.06);border-radius:9999px;}",

        // Ensure carousel arrows keep their current design without unintended effects
        ".carousel .ctrl:hover{filter:none !important;}",
        "}",
      ].join("");
      var el = document.createElement("style");
      el.id = "pc-button-hover";
      el.textContent = css;
      document.head && document.head.appendChild(el);
    } catch (_) {}
  }

  function setupQuickShopTouch() {
    // On touch devices, tap to toggle quick shop
    $$(".card").forEach((card) => {
      const qs = $(".quick-shop", card);
      if (!qs) return;
      card.addEventListener("click", (e) => {
        if (window.matchMedia("(hover: none)").matches) {
          const within = e.target.closest(".quick-shop");
          if (!within) {
            qs.style.opacity = qs.style.opacity === "1" ? "0" : "1";
          }
        }
      });
    });
  }

  // Desktop-only: CSS baseline to force pointer cursor on common clickable elements
  function applyDesktopPointerCursorCSS() {
    try {
      if (document.getElementById("pc-pointer-cursor")) return;
      var css = [
        "@media (min-width:1024px){",
        "a[href],button,[role=button],[onclick],input[type=submit],input[type=button],",
        ".icon-btn,.header-item,nav a,.card,[data-href],.filter-chip,.size,.accordion button,",
        ".menu-toggle,.ctrl,.carousel .panel,label[for]{cursor:pointer !important;}",
        "}",
      ].join("");
      var el = document.createElement("style");
      el.id = "pc-pointer-cursor";
      el.textContent = css;
      document.head && document.head.appendChild(el);
    } catch (_) {}
  }

  function setupDrawerAccordions() {
    const drawer = document.querySelector("#mobile-drawer");
    if (!drawer) return;
    const buttons = drawer.querySelectorAll(".accordion[data-accordion]");
    buttons.forEach((btn) => {
      const panel = btn.nextElementSibling;
      btn.addEventListener("click", () => {
        const expanded = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", String(!expanded));
        if (panel) panel.style.display = expanded ? "none" : "block";
      });
    });
  }

  function setupModalFreeShipping() {
    const modal = $("#free-ship-modal");
    if (!modal) return;
    const key = "freeShipShownV1";
    if (!localStorage.getItem(key))
      setTimeout(() => {
        modal.classList.add("open");
        const first = modal.querySelector("input,button");
        first && first.focus();
      }, 1200);
    modal.addEventListener("click", (e) => {
      if (e.target.dataset.close != null || e.target === modal) {
        modal.classList.remove("open");
        localStorage.setItem(key, "1");
      }
    });
    const form = $("form", modal);

    function setupMegaMenuClickToggle() {
      const header = document.querySelector("header.header");
      if (!header) return;
      const mega = header.querySelector(".nav .header-item .mega");
      if (!mega) return;
      const trigger = mega.parentElement; // the <a class="header-item">Shop ...

      // Accessibility
      trigger.setAttribute("aria-haspopup", "true");
      trigger.setAttribute("aria-expanded", "false");

      const isDesktop = () => window.innerWidth >= 1024;
      const open = () => {
        mega.style.display = "block"; // override stylesheet hover-only behavior
        trigger.setAttribute("aria-expanded", "true");
      };
      const close = () => {
        mega.style.display = ""; // restore to stylesheet-controlled state
        trigger.setAttribute("aria-expanded", "false");
      };

      trigger.addEventListener("click", (e) => {
        if (!isDesktop()) return; // mobile uses drawer
        e.preventDefault();
        e.stopPropagation();
        const isOpen = mega.style.display === "block";
        if (isOpen) close();
        else open();
      });

      // Click outside to close
      document.addEventListener("click", (e) => {
        if (!isDesktop()) return;
        if (!trigger.contains(e.target)) close();
      });

      // Escape to close
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") close();
      });

      // On resize away from desktop, ensure it's closed
      window.addEventListener("resize", () => {
        if (!isDesktop()) close();
      });
    }

    form &&
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        modal.classList.remove("open");
        localStorage.setItem(key, "1");
        alert("Thanks! Free shipping unlocked.");
      });
  }

  function setupCountdown() {
    const el = $("#countdown");
    if (!el) return;
    const target = nextFridayAt(17); // 5pm next Friday
    const tick = () => {
      const now = new Date();
      let diff = target - now;
      if (diff <= 0) {
        el.textContent = "Live now";
        return;
      }
      const d = Math.floor(diff / 86400000);
      diff %= 86400000;
      const h = Math.floor(diff / 3600000);
      diff %= 3600000;
      const m = Math.floor(diff / 60000);
      diff %= 60000;
      const s = Math.floor(diff / 1000);
      el.textContent = `${d}d ${pad(h)}h ${pad(m)}m ${pad(s)}s`;
      requestAnimationFrame(() => setTimeout(tick, 500));
    };
    tick();
  }
  function nextFridayAt(hour) {
    const n = new Date();
    const day = n.getDay(); // 0 Sun - 6 Sat
    const diff = (5 - day + 7) % 7 || 7; // next Friday
    const t = new Date(
      n.getFullYear(),
      n.getMonth(),
      n.getDate() + diff,
      hour,
      0,
      0
    );
    return t;
  }
  const pad = (x) => String(x).padStart(2, "0");

  function setupNewsletter() {
    $$(".newsletter form").forEach((form) => {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        alert("Thanks for joining!");
      });
    });
  }

  function setupCurrency() {
    const sel = $("#currency");
    if (!sel) return;
    sel.addEventListener("change", () => {
      alert("Currency set to " + sel.value);
    });
  }

  function setupChatWidget() {
    const chat = $(".chat");
    if (!chat) return;
    $(".bubble", chat).addEventListener("click", () =>
      chat.classList.toggle("open")
    );
  }

  function setupCollapsibles() {
    // Helpers to close other collapsibles and global close behavior
    const closeAnyCollapsible = (section) => {
      if (!section) return;
      const b = section.querySelector("button");
      const p = section.querySelector(".content");
      if (!b || !p) return;
      section.classList.remove("open");
      b.setAttribute("aria-expanded", "false");
      const current = p.scrollHeight;
      p.style.height = current + "px";
      requestAnimationFrame(() => {
        p.style.height = "0px";
      });
    };
    const closeAllCollapsiblesExcept = (except) => {
      document.querySelectorAll(".collapsible.open").forEach((sec) => {
        if (sec !== except) closeAnyCollapsible(sec);
      });
    };

    $$(".collapsible").forEach((sec, idx) => {
      const btn = $("button", sec);
      const panel = $(".content", sec);
      if (!btn || !panel) return;

      // A11y wiring
      const panelId = panel.id || `collapsible-panel-${idx}`;
      const btnId = btn.id || `collapsible-btn-${idx}`;
      panel.id = panelId;
      btn.id = btnId;
      btn.setAttribute("aria-controls", panelId);
      panel.setAttribute("role", "region");
      panel.setAttribute("aria-labelledby", btnId);

      // Start collapsed
      btn.setAttribute("aria-expanded", "false");
      panel.style.height = "0px";
      panel.style.overflow = "hidden";

      const openPanel = () => {
        sec.classList.add("open");
        btn.setAttribute("aria-expanded", "true");
        // from 0 to auto via fixed height transition
        panel.style.display = "block"; // ensure measurable
        const h = panel.scrollHeight;
        panel.style.height = h + "px";
        // after transition, set to auto to accommodate dynamic content
        const done = () => {
          if (btn.getAttribute("aria-expanded") === "true") {
            panel.style.height = "auto";
          }
          panel.removeEventListener("transitionend", done);
        };
        panel.addEventListener("transitionend", done);
      };
      const closePanel = () => {
        sec.classList.remove("open");
        btn.setAttribute("aria-expanded", "false");
        const current = panel.scrollHeight;
        panel.style.height = current + "px";
        requestAnimationFrame(() => {
          panel.style.height = "0px";
        });
      };

      const toggle = () => {
        const isOpen = btn.getAttribute("aria-expanded") === "true";
        if (isOpen) {
          closePanel();
        } else {
          // Close any other open collapsibles before opening this one
          closeAllCollapsiblesExcept(sec);
          openPanel();
        }
      };

      btn.addEventListener("click", toggle);
      btn.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle();
        }
      });
    });

    // Global listeners: clicking outside, scrolling, or resizing closes any open collapsibles
    document.addEventListener("click", (e) => {
      if (e.target.closest(".collapsible")) return;
      closeAllCollapsiblesExcept(null);
    });
    window.addEventListener("scroll", () => closeAllCollapsiblesExcept(null), {
      passive: true,
    });
    window.addEventListener("resize", () => closeAllCollapsiblesExcept(null));
  }

  function setupGallery() {
    const main = $(".gallery-main img");
    const thumbs = $$(".thumbs img");
    if (!main || thumbs.length === 0) return;

    let current = 0;
    const apply = (idx) => {
      current = ((idx % thumbs.length) + thumbs.length) % thumbs.length;
      const t = thumbs[current];
      main.src = t.src;
      main.alt = t.alt || main.alt;
    };

    thumbs.forEach((thumb, i) => {
      thumb.addEventListener("click", () => apply(i));
    });

    // Swipe on main image
    let sx = 0,
      swiping = false;
    main.addEventListener(
      "touchstart",
      (e) => {
        sx = e.touches[0].clientX;
        swiping = true;
      },
      { passive: true }
    );
    main.addEventListener(
      "touchmove",
      (e) => {
        // noop; keep passive for performance
      },
      { passive: true }
    );
    main.addEventListener("touchend", (e) => {
      if (!swiping) return;
      swiping = false;
      const dx = (e.changedTouches[0]?.clientX || 0) - sx;
      const threshold = 30;
      if (dx > threshold) apply(current - 1);
      else if (dx < -threshold) apply(current + 1);
    });

    // Ensure main syncs with first thumb on load
    apply(0);
  }

  function setupWishlist() {
    const btn = document.querySelector(".wish");
    if (!btn) return;
    btn.addEventListener("click", () => {
      const active = btn.classList.toggle("active");
      btn.setAttribute("aria-pressed", String(active));
      btn.textContent = active ? "❤" : "♡";
    });
  }

  function setupImageFallbacks() {
    try {
      const FALLBACK = "/LOGO/Header.png";
      const attach = (img) => {
        if (!img || img.__fallbackBound) return;
        // Opt-out: do not apply fallback on Rewards banner or any element marked no-fallback
        if (
          img.dataset.noFallback != null ||
          img.closest("[data-rewards-banner]")
        )
          return;
        img.__fallbackBound = true;
        img.addEventListener(
          "error",
          () => {
            if (img.__failedOnce) return; // prevent loops if fallback also fails
            img.__failedOnce = true;
            img.src = FALLBACK;
            if (!img.alt || !img.alt.trim()) img.alt = "Image unavailable";
          },
          { passive: true }
        );
      };

      // Existing images on the page
      Array.from(document.images || []).forEach(attach);

      // Observe future <img> insertions (e.g., carousels, Recently Viewed)
      const obs = new MutationObserver((mutations) => {
        for (const m of mutations) {
          m.addedNodes &&
            m.addedNodes.forEach((node) => {
              if (node.nodeType !== 1) return;
              if (node.tagName === "IMG") attach(node);
              const imgs =
                node.querySelectorAll && node.querySelectorAll("img");
              if (imgs && imgs.length) imgs.forEach(attach);
            });
        }
      });
      obs.observe(document.body, { childList: true, subtree: true });
    } catch (_) {}

    // Map product/category keywords to curated Unsplash image IDs
    const CATEGORY_IMAGES = {
      tee: {
        main: "1523381210434-271e8be1f52b",
        alt: "1441986300917-64674bd600d8",
      },
      tank: {
        main: "1542296332-2e4473faf563",
        alt: "1571019613454-1cb2f99b2d8b",
      },
      hoodie: {
        main: "1547949003-9792a18a2601",
        alt: "1523381210434-271e8be1f52b",
      },
      shorts: {
        main: "1535530992830-e25d07cfa780",
        alt: "1520975922324-c2e5a62b2398",
      },
      pants: {
        main: "1520975922324-c2e5a62b2398",
        alt: "1535530992830-e25d07cfa780",
      },
      jogger: {
        main: "1520975922324-c2e5a62b2398",
        alt: "1535530992830-e25d07cfa780",
      },
      jacket: {
        main: "1519741497674-611481863552",
        alt: "1544966503-7cc5ac882d5f",
      },
      vest: {
        main: "1560243563-062b4b6eb650",
        alt: "1519741497674-611481863552",
      },
      shell: {
        main: "1519741497674-611481863552",
        alt: "1523381210434-271e8be1f52b",
      },
      cap: { main: "1542291026-7eec264c27ff", alt: "1544966503-7cc5ac882d5f" },
      hat: { main: "1542291026-7eec264c27ff", alt: "1544966503-7cc5ac882d5f" },
      legging: {
        main: "1503341338985-c0477be52513",
        alt: "1528701800489-20be0b02f47e",
      },
      accessories: {
        main: "1544966503-7cc5ac882d5f",
        alt: "1542291026-7eec264c27ff",
      },
      default: {
        main: "1544022613-e87cdf0dfaa7",
        alt: "1519741497674-611481863552",
      },
    };
    function imgUrl(id, w) {
      const width = w || 800;
      return `https://images.unsplash.com/photo-${id}?q=80&w=${width}&auto=format&fit=crop`;
    }
    function getCategoryFromLabel(label) {
      const s = String(label || "").toLowerCase();
      if (/hood/.test(s)) return "hoodie";
      if (/\btee|t-shirt|tshirt\b/.test(s)) return "tee";
      if (/tank/.test(s)) return "tank";
      if (/short/.test(s)) return "shorts";
      if (/jogger|pant|trouser/.test(s)) return "pants";
      if (/jacket/.test(s)) return "hoodie";
      if (/vest/.test(s)) return "hoodie";
      if (/shell/.test(s)) return "hoodie";
      if (/cap|hat/.test(s)) return "cap";
      if (/legging|tight/.test(s)) return "legging";
      if (/accessor/.test(s)) return "accessories";
      return "default";
    }
    function getImagesForLabel(label, wMain, wAlt) {
      const cat = getCategoryFromLabel(label);
      const ids = CATEGORY_IMAGES[cat] || CATEGORY_IMAGES.default;
      return {
        main: imgUrl(ids.main, wMain || 1200),
        alt: imgUrl(ids.alt, wAlt || 800),
      };
    }
    function setupThematicImages() {
      const apply = (root) => {
        const scope = root || document;
        scope.querySelectorAll("article.card").forEach((card) => {
          const nameEl = card.querySelector(
            ".row span, .card-title, h3, h2, .upper, .name"
          );
          const name = (nameEl && nameEl.textContent.trim()) || "";
          if (!name) return;
          const pair = getImagesForLabel(name, 800, 800);
          const mainImg =
            card.querySelector(".img-wrap img:not(.hover-img):not(.alt)") ||
            card.querySelector("img");
          if (mainImg) {
            mainImg.src = pair.main;
            if (!mainImg.alt) mainImg.alt = name;
          }
          const hoverImg = card.querySelector("img.hover-img, img.alt");
          if (hoverImg) hoverImg.src = pair.alt;
        });
      };
      apply(document);
      const obs = new MutationObserver((mutations) => {
        mutations.forEach((m) => {
          m.addedNodes &&
            m.addedNodes.forEach((node) => {
              if (node.nodeType !== 1) return;
              if (node.matches && node.matches("article.card")) apply(node);
              else if (node.querySelectorAll) apply(node);
            });
        });
      });
      try {
        obs.observe(document.body, { childList: true, subtree: true });
      } catch (_) {}
    }
  }

  function setupFilters() {
    const btn = $("#filter-toggle");
    const panel = $("#filters");
    if (!btn || !panel) return;

    // Force black text for Filter control and dropdown contents
    btn.style.color = "#111";

    // Make the panel look like a seamless extension of the Filter/Sort toolbar
    Object.assign(panel.style, {
      position: "fixed",
      background: "#fff",
      color: "#111",
      border: "1px solid #e5e5e5",
      borderRadius: "10px",
      boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
      transition: "opacity 140ms ease, transform 140ms ease",
      overflow: "hidden",
      zIndex: 1100,
      boxSizing: "border-box",
      borderTop: "0",
    });

    const position = () => {
      const r = btn.getBoundingClientRect();
      const toolbar = document.querySelector(".toolbar");
      const tr = toolbar ? toolbar.getBoundingClientRect() : r;
      const sortToggle = document.getElementById("sort-toggle");
      const sr = sortToggle ? sortToggle.getBoundingClientRect() : tr;
      panel.style.position = "fixed"; // align with viewport coords
      panel.style.zIndex = "1100";
      panel.style.left = r.left + "px"; // viewport coordinates
      // Attach to the bottom of the taller of the two buttons to eliminate any gap
      const bottom = Math.max(r.bottom, sr.bottom);
      panel.style.top = bottom - 1 + "px";
      panel.style.width = Math.max(sr.right - r.left, r.width) + "px";
      panel.style.borderTopLeftRadius = "0px";
      panel.style.borderTopRightRadius = "0px";
      panel.style.borderTop = "0";
    };

    const show = (v) => {
      if (v) {
        // Ensure mutual exclusivity: hide Sort by when opening Filters
        const sortPanel = document.querySelector("[data-sort-panel]");
        const sortBtn = document.getElementById("sort-toggle");
        if (sortPanel) sortPanel.style.display = "none";
        if (sortBtn) sortBtn.setAttribute("aria-expanded", "false");
        position();
        panel.style.display = "block";
        requestAnimationFrame(() => {
          panel.style.opacity = "1";
          panel.style.transform = "translateY(0)";
        });
      } else {
        panel.style.opacity = "0";
        panel.style.transform = "translateY(-2px)";
        panel.style.display = "none";
        // Also close any open chip dropdown menus (Size/Color/Availability)
        document
          .querySelectorAll("[data-chip-panel]")
          .forEach((m) => (m.style.display = "none"));
      }
      btn.setAttribute("aria-expanded", String(v));
    };

    show(false);

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      show(panel.style.display !== "block");
    });

    document.addEventListener("click", (e) => {
      // Keep filter panel open when clicking inside panel, chip, or its menus
      if (
        panel.contains(e.target) ||
        btn.contains(e.target) ||
        e.target.closest("[data-chip-panel]") ||
        e.target.closest(".filter-chip")
      )
        return;
      show(false);
    });
    window.addEventListener("scroll", () => show(false), { passive: true });
    window.addEventListener("resize", () => show(false));
  }

  async function setupCollectionFromQuery() {
    const here = (location.pathname.split("/").pop() || "").toLowerCase();
    const isCollectionPage =
      here === "collection" || here.endsWith("collection.html");
    if (!isCollectionPage) return;

    const params = new URLSearchParams(location.search);
    const header = document.querySelector("main .mt-0 .upper");
    const productsGrid = document.querySelector(".grid.products");
    const productCount = document.querySelector(".product-count");

    if (!header || !productsGrid) return;

    const toTitle = (s) =>
      s.replace(/[-_]+/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());

    let label = "";
    let collectionHandle = null;
    let tag = null;

    // Determine collection and tag from URL parameters
    if (params.get("section")) {
      const v = params.get("section");
      const map = {
        "new-arrivals": "New Arrivals",
        "back-in-stock": "Back In Stock",
        "shop-all": "Shop All",
      };
      label = map[v] || toTitle(v);
      collectionHandle = "all"; // Default collection
    } else if (params.get("category")) {
      const categoryRaw = params.get("category");
      const isPrefixed = /^category-/i.test(categoryRaw);
      const base = categoryRaw.replace(/^category-/i, "");
      label = toTitle(base);
      collectionHandle = "all";
      // Normalize tag to lowercase to match Shopify tags
      tag = isPrefixed ? categoryRaw.toLowerCase() : base.toLowerCase();
    } else if (params.get("collection")) {
      const collection = params.get("collection");
      label = toTitle(collection);
      collectionHandle = collection.toLowerCase().replace(/\s+/g, "-");
    } else {
      label = "Shop All";
      collectionHandle = "all";
    }

    header.textContent = `Journey / ${label}`;
    document.title = `${label} – Journey Apparel`;

    // Load and render products
    try {
      await loadAndRenderProducts(
        collectionHandle,
        tag,
        productsGrid,
        productCount
      );
    } catch (error) {
      console.error("Failed to load collection products:", error);
      showEmptyState(
        productsGrid,
        "Failed to load products. Please try again."
      );
    }
  }

  async function loadAndRenderProducts(
    collectionHandle,
    tag,
    container,
    countElement
  ) {
    // Show loading state
    container.innerHTML =
      '<div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #666;">Loading products...</div>';

    try {
      let products = [];

      if (window.shopifyAPI) {
        if (collectionHandle === "all") {
          // Load all products from all collections
          const collections = await window.shopifyAPI.getCollections();
          for (const collection of collections.collections) {
            const collectionData = await window.shopifyAPI.getCollection(
              collection.handle,
              tag
            );
            products.push(...(collectionData.products || []));
          }
        } else {
          // Load specific collection
          const data = await window.shopifyAPI.getCollection(
            collectionHandle,
            tag
          );
          products = data.products || [];
        }
      } else {
        console.log(
          "Shopify API not available, using fallback product loading"
        );
        products = [];
      }

      // Update product count
      if (countElement) {
        countElement.textContent = `${products.length} product${
          products.length !== 1 ? "s" : ""
        }`;
      }

      if (products.length === 0) {
        showEmptyState(container, "No products found in this collection.");
        return;
      }

      // Render products
      container.innerHTML = products
        .map((product) => renderProductCard(product))
        .join("");

      // Setup card interactions
      setupCardLinks();
    } catch (error) {
      console.error("Error loading products:", error);
      showEmptyState(container, "Failed to load products. Please try again.");
    }
  }

  function renderProductCard(product) {
    const price = parseFloat(product.priceRange.minVariantPrice.amount);
    const compareAtPrice = product.compareAtPriceRange?.minVariantPrice?.amount;
    const hasComparePrice =
      compareAtPrice && parseFloat(compareAtPrice) > price;
    const mainImage = product.images[0]?.url || "";
    const hoverImage = product.images[1]?.url || "";
    const hasHoverImage = hoverImage && hoverImage !== mainImage;

    return `
      <article class="card" data-href="product.html?slug=${
        product.handle
      }" style="cursor: pointer">
        <div class="img-wrap"
             onmouseenter="var h=this.querySelector('.hover-img'); if(h){h.style.opacity='1'}"
             onmouseleave="var h=this.querySelector('.hover-img'); if(h){h.style.opacity='0'}"
             style="aspect-ratio: 3/4; overflow: hidden; position: relative; border-radius: 0;">
          <img src="${mainImage}"
               alt="${product.title}"
               style="width: 100%; height: 100%; object-fit: cover" />
          ${
            hasHoverImage
              ? `
            <img class="hover-img"
                 src="${hoverImage}"
                 alt="${product.title} - alternate"
                 style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0; transition: opacity 180ms ease; pointer-events: none; z-index: 1;" />
          `
              : ""
          }
        </div>
        <div class="row mt-8" style="display: flex; flex-direction: column; align-items: center; gap: 6px; margin-top: 8px; font-size: 14px; text-align: center;">
          <span style="font-weight: 400; text-transform: uppercase; font-size: 12px;">${
            product.title
          }</span>
          <div class="price-container">
            ${
              hasComparePrice
                ? `
              <span class="price compare-at" style="font-weight: 400; text-decoration: line-through; color: #999; margin-right: 8px;">$${parseFloat(
                compareAtPrice
              ).toFixed(2)}</span>
            `
                : ""
            }
            <span class="price" style="font-weight: 400;">$${price.toFixed(
              2
            )} ${product.priceRange.minVariantPrice.currencyCode}</span>
          </div>
        </div>
      </article>
    `;
  }

  function showEmptyState(container, message) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 20px; text-align: center; color: #666;">
        <div style="max-width: 400px;">
          <h3 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 600; color: #333;">No Products Found</h3>
          <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.5;">${message}</p>
          <div style="margin-top: 24px;">
            <a href="index.html" style="display: inline-block; padding: 12px 24px; background: #111; color: #fff; text-decoration: none; border-radius: 4px; font-size: 14px; font-weight: 500; transition: background 0.2s ease;">Back to Home</a>
          </div>
        </div>
      </div>
    `;
  }

  async function setupHomepageProducts() {
    // Only run on homepage
    const isHomepage =
      location.pathname === "/" ||
      location.pathname.endsWith("index.html") ||
      location.pathname === "";
    if (!isHomepage) return;

    // Load New Arrivals
    const newArrivalsContainer = document.querySelector(
      "#new-arrivals .carousel-track"
    );
    if (newArrivalsContainer) {
      await loadHomepageSection(newArrivalsContainer, "new-arrivals", 8);
    }

    // Load Best Sellers
    const bestSellersContainer = document.querySelector(
      "#best-sellers .carousel-track"
    );
    if (bestSellersContainer) {
      await loadHomepageSection(bestSellersContainer, "best-sellers", 4);
    }
  }

  async function loadHomepageSection(container, section, limit = 8) {
    try {
      // Show loading state
      container.innerHTML =
        '<div style="grid-column: 1 / -1; text-align: center; padding: 20px; color: #666;">Loading...</div>';

      let products = [];

      // Load products from all collections (if Shopify API available)
      if (window.shopifyAPI) {
        const collections = await window.shopifyAPI.getCollections();

        for (const collection of collections.collections) {
          const collectionData = await window.shopifyAPI.getCollection(
            collection.handle
          );
          products.push(...(collectionData.products || []));
        }
      } else {
        console.log("Shopify API not available for homepage products");
      }

      // Filter and sort products based on section
      if (section === "new-arrivals") {
        // Sort by creation date (newest first)
        products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      } else if (section === "best-sellers") {
        // For now, just take random products. In a real implementation,
        // you'd sort by sales data or use a specific collection
        products = products.filter((p) => p.availableForSale);
      }

      // Limit products
      products = products.slice(0, limit);

      if (products.length === 0) {
        const message =
          section === "new-arrivals"
            ? "No new arrivals available at the moment."
            : "No best sellers available at the moment.";
        container.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: center; padding: 60px 20px; text-align: center; color: #666; font-size: 16px; width: 100%; grid-column: 1 / -1;">
            <div>
              <p style="margin: 0 0 8px 0;">${message}</p>
              <p style="margin: 0; font-size: 14px;">Check back soon for ${
                section === "new-arrivals" ? "new" : "popular"
              } products!</p>
            </div>
          </div>
        `;
        return;
      }

      // Render products
      container.innerHTML = products
        .map((product) => renderHomepageProductCard(product))
        .join("");

      // Setup card interactions
      setupCardLinks();
    } catch (error) {
      console.error(`Error loading ${section}:`, error);
      container.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; padding: 60px 20px; text-align: center; color: #666; font-size: 16px; width: 100%; grid-column: 1 / -1;">
          <div>
            <p style="margin: 0;">Failed to load products.</p>
          </div>
        </div>
      `;
    }
  }

  function renderHomepageProductCard(product) {
    const price = parseFloat(product.priceRange.minVariantPrice.amount);
    const compareAtPrice = product.compareAtPriceRange?.minVariantPrice?.amount;
    const hasComparePrice =
      compareAtPrice && parseFloat(compareAtPrice) > price;
    const mainImage = product.images[0]?.url || "";
    const hoverImage = product.images[1]?.url || "";
    const hasHoverImage = hoverImage && hoverImage !== mainImage;

    return `
      <article class="card" data-href="product.html?slug=${
        product.handle
      }" style="cursor: pointer">
        <div class="img-wrap"
             onmouseenter="var h=this.querySelector('.hover-img'); if(h){h.style.opacity='1'}"
             onmouseleave="var h=this.querySelector('.hover-img'); if(h){h.style.opacity='0'}"
             style="aspect-ratio: 1 / 1.7; overflow: hidden; position: relative; border-radius: 0;">
          <img src="${mainImage}"
               alt="${product.title}"
               style="width: 100%; height: 100%; object-fit: cover" />
          ${
            hasHoverImage
              ? `
            <img class="hover-img"
                 src="${hoverImage}"
                 alt="${product.title} - alternate"
                 style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0; transition: opacity 180ms ease; pointer-events: none; z-index: 1;" />
          `
              : ""
          }
        </div>
        <div class="details" style="padding: 12px 0; text-align: center;">
          <h3 style="margin: 0 0 6px 0; font-size: 14px; font-weight: 400; text-transform: uppercase; letter-spacing: 0.5px;">${
            product.title
          }</h3>
          <div class="price-container">
            ${
              hasComparePrice
                ? `
              <span class="price compare-at" style="font-weight: 400; text-decoration: line-through; color: #999; margin-right: 8px; font-size: 13px;">$${parseFloat(
                compareAtPrice
              ).toFixed(2)}</span>
            `
                : ""
            }
            <span class="price" style="font-weight: 500; font-size: 14px;">$${price.toFixed(
              2
            )} ${product.priceRange.minVariantPrice.currencyCode}</span>
          </div>
        </div>
      </article>
    `;
  }

  function setupCollectionUI() {
    // Robust init: activate if collection toolbar or grid exists (supports SPA/pretty URLs)
    const exists =
      document.getElementById("sort-toggle") ||
      document.getElementById("filter-toggle") ||
      document.querySelector(".grid.products");
    if (!exists) return;

    // Ensure toolbar and chips render in black, not blue
    const paintToolbar = () => {
      ["#filter-toggle", "#sort-toggle"].forEach((sel) => {
        const el = document.querySelector(sel);
        if (el) el.style.color = "#111";
      });
      document
        .querySelectorAll(".filter-chip")
        .forEach((ch) => (ch.style.color = "#111"));
    };
    paintToolbar();

    const sortToggle = document.getElementById("sort-toggle");
    const sortPanel = document.querySelector("[data-sort-panel]");
    if (sortToggle && sortPanel) {
      // Force black text for Sort control and items
      sortToggle.style.color = "#111";
      sortPanel.querySelectorAll("[data-sort]").forEach((b) => {
        b.style.color = "#111";
      });

      const show = (v) => (sortPanel.style.display = v ? "block" : "none");
      const position = () => {
        const r = sortToggle.getBoundingClientRect();
        Object.assign(sortPanel.style, {
          position: "fixed",
          left: r.left + "px",
          top: r.bottom - 1 + "px",
          width: Math.round(r.width) + "px", // exact match to Sort by card
          minWidth: "0",
          background: "#fff",
          border: "1px solid #e5e5e5",
          padding: "6px 0",
          zIndex: 1100,
          borderTopLeftRadius: "0px",
          borderTopRightRadius: "0px",
          borderBottomLeftRadius: "10px",
          borderBottomRightRadius: "10px",
          boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
          boxSizing: "border-box",
        });
      };

      // Keep the view toggle column vertically aligned with the Sort by card
      const syncToggleColumn = () => {
        const wrap = document.getElementById("view-toggle");
        if (!wrap) return;
        const h = Math.round(sortToggle.getBoundingClientRect().height);
        wrap.style.height = h + "px";
      };
      window.addEventListener("resize", syncToggleColumn);
      setTimeout(syncToggleColumn, 0);

      show(false);
      const toggleSort = (e) => {
        e && e.stopPropagation();
        const open = sortPanel.style.display !== "block";
        if (open) {
          position();
          // Ensure mutual exclusivity: hide Filters when opening Sort by
          const filters = document.getElementById("filters");
          const filterBtn = document.getElementById("filter-toggle");
          if (filters) filters.style.display = "none";
          if (filterBtn) filterBtn.setAttribute("aria-expanded", "false");
          // Also close any open filter chip dropdowns (Size/Color/Type/Availability)
          try {
            document
              .querySelectorAll("[data-chip-panel]")
              .forEach(function (m) {
                m.style.display = "none";
              });
          } catch (_) {}
        }
        show(open);
        syncToggleColumn();
      };
      sortToggle.addEventListener("click", toggleSort);
      // iOS Safari: ensure touch taps trigger reliably
      sortToggle.addEventListener(
        "touchend",
        (e) => {
          e.preventDefault();
          toggleSort(e);
        },
        { passive: false }
      );
      // Keep panel open when clicking inside it or the toggle
      sortPanel.addEventListener("click", (e) => e.stopPropagation());
      document.addEventListener("click", (e) => {
        if (sortPanel.contains(e.target) || sortToggle.contains(e.target))
          return;
        show(false);
      });
      window.addEventListener("scroll", () => show(false), { passive: true });
      window.addEventListener("resize", () => show(false));

      // Directly wire the sort actions so they always apply (click + iOS touch)
      sortPanel.querySelectorAll("[data-sort]").forEach((btn) => {
        const applySort = (ev) => {
          ev && (ev.preventDefault?.(), ev.stopPropagation?.());
          const val = btn.getAttribute("data-sort") || "featured";
          const label = btn.textContent.trim();
          const firstSpan = sortToggle.querySelector("span");
          if (firstSpan)
            firstSpan.textContent =
              val === "none" ? "Sort by" : `Sort by: ${label}`;
          show(false);
          document.dispatchEvent(
            new CustomEvent("__set-sort", { detail: val })
          );
        };
        btn.addEventListener("click", applySort);
        btn.addEventListener(
          "touchend",
          (e) => {
            e.preventDefault();
            applySort(e);
          },
          { passive: false }
        );
      });
    }

    // Filter chips open the filter panel
    const filterPanel = document.getElementById("filters");
    const filterBtn = document.getElementById("filter-toggle");
    document.querySelectorAll(".filter-chip").forEach((chip) =>
      chip.addEventListener("click", () => {
        if (!filterPanel) return;
        filterPanel.classList.add("open");
        filterBtn && filterBtn.setAttribute("aria-expanded", "true");
      })
    );

    // Premium chip dropdowns: Size, Color, Product type, Availability
    const chipMenus = {
      size: ["XS", "S", "M", "L", "XL"],
      color: ["Black", "White", "Gray", "Blue", "Green"],
      // Align product type categories with collection page spec
      type: ["Tees", "Bottoms", "Outerwear", "Accessories"],

      availability: ["In stock"],
    };
    const chipState = {
      size: new Set(),
      color: new Set(),
      type: new Set(),

      availability: new Set(),
    };
    let openChipMenu = null;

    const closeOpenChipMenu = () => {
      if (openChipMenu) {
        openChipMenu.style.display = "none";
        openChipMenu = null;
      }
    };

    const createChipMenu = (chip, key, options) => {
      const menu = document.createElement("div");
      menu.setAttribute("data-chip-panel", key);
      Object.assign(menu.style, {
        position: "absolute",
        display: "none",
        background: "#fff",
        color: "#111",
        border: "1px solid #e5e5e5",
        borderRadius: "10px",
        boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
        padding: "8px",
        zIndex: 1200,
        transition: "opacity 140ms ease, transform 140ms ease",
        opacity: "0",
        transform: "translateY(-2px)",
      });

      options.forEach((label) => {
        const row = document.createElement("label");
        Object.assign(row.style, {
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "8px 10px",
          cursor: "pointer",
          borderRadius: "8px",
          fontSize: "14px",
          color: "#111",
        });
        row.addEventListener(
          "mouseenter",
          () => (row.style.background = "#f6f6f6")
        );
        row.addEventListener(
          "mouseleave",
          () => (row.style.background = "transparent")
        );
        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.checked = chipState[key].has(label);
        cb.addEventListener("change", () => {
          if (cb.checked) chipState[key].add(label);
          else chipState[key].delete(label);
          const nameSpan = chip.querySelector("span");
          if (nameSpan) {
            const base =
              chip.getAttribute("data-label-base") ||
              nameSpan.textContent.split("•")[0].trim();
            chip.setAttribute("data-label-base", base);
            const count = chipState[key].size;
            nameSpan.textContent = count ? `${base} • ${count}` : base;
            chip.style.border = count ? "1px solid #000" : "1px solid #ddd";
          }
          // Apply filters immediately
          if (window.__applyCollection) window.__applyCollection();
        });
        const txt = document.createElement("span");
        txt.textContent = label;
        row.appendChild(cb);
        row.appendChild(txt);
        menu.appendChild(row);
      });

      document.body.appendChild(menu);

      const position = () => {
        const r = chip.getBoundingClientRect();
        menu.style.left = r.left + window.scrollX + "px";
        menu.style.top = r.bottom + window.scrollY - 1 + "px";
        menu.style.width = Math.round(r.width) + "px"; // exact match to chip width
        menu.style.borderTopLeftRadius = "0px";
        menu.style.borderTopRightRadius = "0px";
      };

      const open = () => {
        closeOpenChipMenu();
        position();
        menu.style.display = "block";
        requestAnimationFrame(() => {
          menu.style.opacity = "1";
          menu.style.transform = "translateY(0)";
        });
        openChipMenu = menu;
      };

      const close = () => {
        menu.style.opacity = "0";
        menu.style.transform = "translateY(-2px)";
        menu.style.display = "none";
        if (openChipMenu === menu) openChipMenu = null;
      };

      chip.addEventListener("click", (e) => {
        e.stopPropagation();
        if (menu.style.display === "block") close();
        else open();
      });
      // iOS Safari: ensure touch taps toggle reliably
      chip.addEventListener(
        "touchend",
        (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (menu.style.display === "block") close();
          else open();
        },
        { passive: false }
      );
      window.addEventListener("resize", () => close());
      window.addEventListener("scroll", () => close(), { passive: true });

      return { open, close, position, el: menu };
    };

    document.querySelectorAll(".filter-chip").forEach((chip) => {
      const key = chip.getAttribute("data-filter");
      const opts = chipMenus[key];
      if (!opts) return;
      createChipMenu(chip, key, opts);
    });

    document.addEventListener("click", (e) => {
      // Do not close chip menus when interacting within them, the chips, or the filter panel
      if (
        e.target.closest("[data-chip-panel]") ||
        e.target.closest(".filter-chip") ||
        (document.getElementById("filters") &&
          document.getElementById("filters").contains(e.target))
      )
        return;
      closeOpenChipMenu();
    });

    // Ensure chip labels only show a count when selections exist
    const refreshChipLabel = (key) => {
      try {
        const chip = document.querySelector(
          `.filter-chip[data-filter="${key}"]`
        );
        if (!chip) return;
        const nameSpan = chip.querySelector("span");
        if (!nameSpan) return;
        const base =
          chip.getAttribute("data-label-base") ||
          (nameSpan.textContent || "").split("•")[0].trim();
        chip.setAttribute("data-label-base", base);
        // Prefer actual checked options in the chip menu to determine count
        const menu = document.querySelector(`[data-chip-panel="${key}"]`);
        let count = 0;
        if (menu) {
          try {
            count = menu.querySelectorAll(
              'input[type="checkbox"]:checked'
            ).length;
          } catch (_) {
            count = (chipState[key] && chipState[key].size) || 0;
          }
        } else {
          count = (chipState[key] && chipState[key].size) || 0;
        }
        nameSpan.textContent = count ? `${base} • ${count}` : base;
        chip.style.border = count ? "1px solid #000" : "1px solid #ddd";
      } catch (_) {}
    };
    const refreshAllChipLabels = () => {
      Object.keys(chipMenus).forEach((k) => refreshChipLabel(k));
    };
    // Run once on init to clear any stale counts
    refreshAllChipLabels();

    // ---- Collection: Data, render, filter, sort ----
    (function () {
      // Robust init by presence
      const grid = document.querySelector(".grid.products");
      const countEl = document.querySelector("main .muted");
      if (!grid) return;

      // Use products from catalog
      const allProducts =
        window.__CATALOG && window.__CATALOG.products
          ? window.__CATALOG.products.map((product, i) => ({
              id: i + 1,
              name: product.name,
              type: product.category,
              collection:
                product.collections && product.collections.length > 0
                  ? product.collections[0]
                  : "General",
              image:
                product.main || (product.images && product.images[0]) || "",
              hover:
                product.hover || (product.images && product.images[1]) || "",
              price: product.price,
              color: product.color || "Black",
              sizes: product.sizes || ["OS"],
              available: true,
              date: new Date(product.date || Date.now()),
              pop: product.pop || 0,
              index: i,
              slug: product.slug,
            }))
          : [];

      let currentSort = "featured";
      // Allow external controls (sort panel) to set sort mode directly
      document.addEventListener("__set-sort", (ev) => {
        try {
          currentSort = ev.detail || "featured";
        } catch (_) {
          currentSort = "featured";
        }
        apply();
      });
      let viewMode = "4"; // '4' = 2x2 grid, '1' = single large
      function updateView() {
        const gridEl = grid;
        if (!gridEl) return;
        gridEl.style.display = "grid";
        gridEl.style.gridTemplateColumns = viewMode === "1" ? "1fr" : "1fr 1fr";
        // Always restore the center column gap when toggling back to 2x2
        if (!gridEl.dataset.defaultGap) {
          try {
            const cs = getComputedStyle(gridEl);
            gridEl.dataset.defaultGap = cs.columnGap || cs.gap || "14px";
          } catch (_) {
            gridEl.dataset.defaultGap = "14px";
          }
        }
        gridEl.style.columnGap =
          viewMode === "1" ? "0px" : gridEl.dataset.defaultGap;
        const wraps = gridEl.querySelectorAll(".img-wrap");
        const cards = gridEl.querySelectorAll("article.card");
        if (viewMode === "1") {
          const desktop = window.innerWidth >= 1024;
          if (desktop) {
            // Center and constrain the single card width on PC only
            gridEl.style.justifyItems = "center";
            cards.forEach((c) => {
              c.style.justifySelf = "center";
              c.style.maxWidth = "1680px"; // overall larger width (2x)
              c.style.width = "100%";
            });
            wraps.forEach((w) => {
              // Force a shallower image on PC single-view only
              w.style.setProperty("aspect-ratio", "16 / 9", "important");
              w.style.width = "100%";
              w.style.maxWidth = "1680px";
            });
          } else {
            // Mobile single view: keep square, full width
            gridEl.style.justifyItems = "";
            cards.forEach((c) => {
              c.style.justifySelf = "";
              c.style.removeProperty("max-width");
              c.style.removeProperty("width");
            });
            wraps.forEach((w) => {
              w.style.setProperty("aspect-ratio", "1 / 1");
              w.style.removeProperty("max-width");
              w.style.width = "100%";
            });
          }
        } else {
          // 2x2 grid view
          gridEl.style.justifyItems = "";
          cards.forEach((c) => {
            c.style.justifySelf = "";
            c.style.removeProperty("max-width");
            c.style.removeProperty("width");
          });
          wraps.forEach((w) => {
            // Restore defaults: let desktop CSS control, keep mobile portrait
            if (window.innerWidth >= 1024) {
              w.style.removeProperty("aspect-ratio");
              w.style.removeProperty("max-width");
              w.style.width = "100%";
            } else {
              w.style.setProperty("aspect-ratio", "1 / 1.7");
              w.style.removeProperty("max-width");
              w.style.width = "100%";
            }
          });
        }
        // Ensure items layout changes visibly even if external CSS interferes
        const items = gridEl.querySelectorAll(
          "article.card, .grid.products > *"
        );
        items.forEach((it) => {
          it.style.gridColumn = viewMode === "1" ? "1 / -1" : "auto";
          if (viewMode === "1" && window.innerWidth >= 1024) {
            it.style.justifySelf = "center";
            it.style.maxWidth = "1680px";
            it.style.width = "100%";
          } else {
            it.style.justifySelf = "";
            it.style.removeProperty("max-width");
            it.style.removeProperty("width");
          }
        });
      }
      // Expose for UI buttons
      window.__setCollectionView = function (mode) {
        // Keep view sizing in sync with breakpoint changes
        window.addEventListener("resize", updateView);

        viewMode = mode === "1" ? "1" : "4";
        updateView();
      };

      function render(list) {
        let html = "";
        list.forEach((p) => {
          const priceText = `$${p.price}`;
          html += `
          <article class="card" data-type="${p.type}" data-color="${
            p.color
          }" data-sizes="${p.sizes.join(",")}" data-price="${
            p.price
          }" data-date="${+p.date}" data-pop="${p.pop}" data-index="${p.index}">
            <a href="product.html${
              p.slug ? "?slug=" + p.slug : ""
            }" class="img-wrap" style="position:relative; display:block; aspect-ratio:1 / 1.7; overflow:hidden" onmouseenter="var a=this.querySelector('.alt'); if(a){a.style.opacity='1'}" onmouseleave="var a=this.querySelector('.alt'); if(a){a.style.opacity='0'}">
              <img src="${p.image}" alt="${
            p.name
          }" loading="lazy" style="width:100%; height:100%; object-fit:cover; display:block" />
              <img class="alt" src="${p.hover || p.image}" alt="${
            p.name
          } alternate view" loading="lazy" style="position:absolute; inset:0; width:100%; height:100%; object-fit:cover; display:block; opacity:0; transition:opacity 160ms ease; pointer-events:none" />
            </a>
            <div class="row mt-8" style="display:flex; flex-direction:column; align-items:center; gap:6px; margin-top:14px; text-align:center;">
              <span style="max-width:100%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:15px; color:#222;">${
                p.name
              }</span>
              <span class="price" style="font-size:14px; color:#111; font-weight:400">${priceText}</span>
            </div>
          </article>`;
        });
        grid.innerHTML = html;
        if (countEl) countEl.textContent = `${list.length} products`;
        if (typeof enableHoverSwapIn === "function") enableHoverSwapIn(grid);
        updateView();
      }

      function apply() {
        let filtered = allProducts.slice();
        const sizeSel = chipState.size; // Set
        const colorSel = chipState.color;
        const typeSel = chipState.type;

        // availability currently single option "In stock"; all are in stock

        filtered = filtered.filter((p) => {
          if (sizeSel.size) {
            const has = Array.from(sizeSel).some((s) => p.sizes.includes(s));
            if (!has) return false;
          }
          if (colorSel.size && !colorSel.has(p.color)) return false;
          if (typeSel.size && !typeSel.has(p.type)) return false;

          return true;
        });

        const sort = currentSort;
        const byNum =
          (k, dir = 1) =>
          (a, b) =>
            (a[k] - b[k]) * dir;
        const byDate = (a, b) => b.date - a.date;
        const byIndex = (a, b) => a.index - b.index;
        if (sort === "none") {
          // no additional sort; keep current order
        } else if (sort === "price-asc") filtered.sort(byNum("price", +1));
        else if (sort === "price-desc") filtered.sort(byNum("price", -1));
        else if (sort === "newest") filtered.sort(byDate);
        else if (sort === "bestselling")
          filtered.sort(byNum("pop", +1)); // lower pop = better
        else filtered.sort(byIndex); // featured/original

        render(filtered);
      }

      // React to Sort selection clicks (also keeps existing label behavior)
      document.addEventListener("click", (e) => {
        const btn = e.target.closest && e.target.closest("[data-sort]");
        if (!btn) return;
        const val = btn.getAttribute("data-sort") || "featured";
        currentSort = val;
        apply();
      });

      // Prefilter by URL category (e.g., ?category=tees)
      try {
        const p = new URLSearchParams(location.search);
        const cat = (p.get("category") || "").toLowerCase();
        if (cat) {
          const map = {
            tees: "Tees",
            hoodies: "Hoodies",
            shorts: "Shorts",
            pants: "Pants",
            accessories: "Accessories",
            tops: "Tees",
            bottoms: "Pants",
            outerwear: "Hoodies",
          };
          const t = map[cat];
          if (t) {
            chipState.type.add(t);
            const chip = document.querySelector(
              '.filter-chip[data-filter="type"]'
            );
            if (chip) {
              // Sync the corresponding checkbox state in the menu
              try {
                const menu = document.querySelector('[data-chip-panel="type"]');
                if (menu) {
                  menu
                    .querySelectorAll('input[type="checkbox"]')
                    .forEach((cb) => {
                      const labelEl = cb.nextElementSibling;
                      if (labelEl && labelEl.textContent.trim() === t)
                        cb.checked = true;
                    });
                }
              } catch (_) {}
              // Refresh the label to reflect actual selections
              if (typeof refreshChipLabel === "function")
                refreshChipLabel("type");
            }
          }
        }
      } catch (_) {}
      // Initial render
      apply();

      // View toggle (2x2 vs 1x1)
      (function () {
        // Hide the PC view toggles; keep them visible on mobile only
        (function () {
          const wrap = document.getElementById("view-toggle");
          const applyVisibility = () => {
            if (!wrap) return;
            if (window.innerWidth >= 1024) {
              wrap.style.display = "none"; // desktop: hidden
            } else {
              wrap.style.display = "flex"; // mobile: visible, stacked
            }
          };
          applyVisibility();
          window.addEventListener("resize", applyVisibility);
        })();

        const v4 = document.getElementById("view-4");
        const v1 = document.getElementById("view-1");
        if (!v4 || !v1) return;
        const reflect = (m) => {
          v4.setAttribute("aria-pressed", m === "4" ? "true" : "false");
          v1.setAttribute("aria-pressed", m === "1" ? "true" : "false");
          v4.style.color = m === "4" ? "#111" : "#d9d9d9";
          v1.style.color = m === "1" ? "#111" : "#d9d9d9";
        };
        const set4 = (e) => {
          e && (e.preventDefault(), e.stopPropagation());
          if (window.__setCollectionView) window.__setCollectionView("4");
          reflect("4");
        };
        const set1 = (e) => {
          e && (e.preventDefault(), e.stopPropagation());
          if (window.__setCollectionView) window.__setCollectionView("1");
          reflect("1");
        };
        v4.addEventListener("click", set4);
        v1.addEventListener("click", set1);
        // iOS Safari: also bind touchend for reliable taps
        v4.addEventListener("touchend", set4, { passive: false });
        v1.addEventListener("touchend", set1, { passive: false });
        reflect("4");
      })();

      // Expose for checkbox handlers defined above in this function
      window.__applyCollection = apply;
    })();
  }

  function normalizeTitleAndAnnouncement() {
    // Fix any stray control characters introduced by editors
    try {
      if (document.title && /[\x00-\x1F]/.test(document.title)) {
        document.title =
          document.title
            .replace(/[\x00-\x1F]/g, "")
            .replace(" f ", " – ")
            .trim() || "Journey Apparel";
      }
      const ann = document.querySelector(".announcement.upper");
      if (ann && /[\x00-\x1F]/.test(ann.textContent || "")) {
        ann.textContent = "Free Shipping On Orders Over $100";
      }
    } catch (e) {
      /* no-op */
    }
  }

  // --- Sitewide Search ---
  function setupSearch() {
    let overlay = document.getElementById("site-search");
    let form = document.getElementById("site-search-form");
    let input = document.getElementById("site-search-input");
    let closeBtn = document.getElementById("site-search-close");

    // Ensure required DOM exists even if page's header omitted it
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "site-search";
      Object.assign(overlay.style, {
        position: "fixed",
        inset: "0 0 auto 0",
        top: "0",
        background: "rgba(0,0,0,.6)",
        backdropFilter: "blur(2px)",
        zIndex: "1000",
        display: "none",
        padding: "12px 16px",
      });
      overlay.innerHTML =
        '<form id="site-search-form" style="max-width:800px; margin:0 auto; display:flex; gap:8px">' +
        '<input id="site-search-input" type="search" placeholder="Search pages or sections (e.g., New Arrivals, Best Sellers, Pair It With, Cart)" style="flex:1; padding:12px; border-radius:8px; border:1px solid #ddd; font-size:16px; background:#fff" />' +
        '<button type="submit" style="padding:12px 16px; border-radius:8px; border:1px solid #ddd; background:#fff; font-weight:600; cursor:pointer;">Go</button>' +
        '<button type="button" id="site-search-close" style="padding:12px 14px; border-radius:8px; border:1px solid #ddd; background:#fff; cursor:pointer;">×</button>' +
        "</form>";
      document.body.appendChild(overlay);
    }
    // Refresh references
    form = document.getElementById("site-search-form");
    input = document.getElementById("site-search-input");
    closeBtn = document.getElementById("site-search-close");

    if (!overlay || !form || !input) return;

    let prevBodyOverflow = "";

    // Build suggestion list container (inline styles)
    let list = document.getElementById("site-search-suggestions");
    if (!list) {
      list = document.createElement("div");
      list.id = "site-search-suggestions";
      Object.assign(list.style, {
        maxWidth: "800px",
        margin: "8px auto 0 auto",
        background: "#fff",
        border: "1px solid #e5e5e5",
        borderRadius: "10px",
        overflow: "hidden",
        boxShadow: "0 8px 24px rgba(0,0,0,.08)",
        display: "none",
      });
      overlay.appendChild(list);
    }

    // Collect a lightweight index from visible content + site sections
    function buildIndex() {
      const idx = [];
      const add = (label, url, meta = "", thumb = "") =>
        idx.push({ label, url, meta, thumb });

      // Key sections
      add("New Arrivals", "index.html#new-arrivals", "Section");
      add("Best Sellers", "index.html#best-sellers", "Section");
      add("Shop by Category", "index.html#categories", "Section");
      add("Cart", "#cart", "Site");
      add("Collections", "collection.html", "Browse");
      add("All Products", "collection.html?section=shop-all", "Browse");

      // Categories (align to user’s taxonomy)
      [
        ["Tees", "collection.html?collection=tops"],
        ["Hoodies", "collection.html?collection=hoodies"],
        ["Bottoms", "collection.html?collection=bottoms"],
        ["Accessories", "collection.html?collection=accessories"],
      ].forEach(([label, url]) => add(label, url, "Category"));

      // Products visible on the page (cards)
      document.querySelectorAll(".card").forEach((card) => {
        const nameEl = card.querySelector(".row span");
        const name = nameEl && nameEl.textContent && nameEl.textContent.trim();
        if (!name) return;
        const href =
          card.getAttribute("data-href") ||
          (card.querySelector("a[href]") &&
            card.querySelector("a[href]").getAttribute("href")) ||
          "product.html";
        const img = card.querySelector(".img-wrap img");
        const thumb = img && img.getAttribute("src");
        add(name, href, "Product", thumb || "");
      });
      return idx;
    }

    let index = buildIndex();

    function renderSuggestions(items, active = 0) {
      if (!items.length) {
        list.style.display = "none";
        list.innerHTML = "";
        return;
      }
      const itemHtml = items
        .map((it, i) => {
          const isActive = i === active;
          const thumb = it.thumb
            ? `<img src="${it.thumb}" alt="" style="width:40px; height:40px; object-fit:cover; border-radius:6px; flex:0 0 auto"/>`
            : `<span style=\"width:8px; height:8px; border-radius:50%; background:#ddd; flex:0 0 auto\"></span>`;
          return `
            <a href="${it.url}" data-idx="${i}" style="
              display:flex; align-items:center; gap:12px; padding:10px 12px; text-decoration:none;
              color:#111; background:${
                isActive ? "#f6f6f6" : "#fff"
              }; border-bottom:1px solid #eee;
            " onmouseenter="this.style.background='#f6f6f6'" onmouseleave="this.style.background='${
              isActive ? "#f6f6f6" : "#fff"
            }'">
              ${thumb}
              <div style="display:flex; flex-direction:column; min-width:0;">
                <span style="font-size:14px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${
                  it.label
                }</span>
                ${
                  it.meta
                    ? `<span style=\"font-size:12px; color:#666\">${it.meta}</span>`
                    : ""
                }
              </div>
              <span style="margin-left:auto; color:#aaa">›</span>
            </a>`;
        })
        .join("");
      list.innerHTML = itemHtml;
      list.style.display = "block";
    }

    function filterIndex(q) {
      const s = q.trim().toLowerCase();
      if (!s) return [];
      return index
        .map((it) => ({
          it,
          score: it.label.toLowerCase().includes(s)
            ? 2
            : it.meta.toLowerCase().includes(s)
            ? 1
            : 0,
        }))
        .filter((x) => x.score > 0)
        .sort(
          (a, b) => b.score - a.score || a.it.label.localeCompare(b.it.label)
        )
        .slice(0, 8)
        .map((x) => x.it);
    }

    let openState = false;
    let activeIdx = 0;
    let currentItems = [];

    const open = () => {
      if (!overlay) return;
      if (openState) return; // idempotent open to avoid double-trigger close
      overlay.style.display = "block";
      overlay.style.inset = "0"; // full-screen for background click-close
      overlay.style.opacity = "0";
      overlay.style.transition = "opacity 160ms ease";
      requestAnimationFrame(() => {
        overlay.style.opacity = "1";
      });
      prevBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      setTimeout(() => input && input.focus(), 0);
      openState = true;
      // Rebuild index on open in case DOM changed
      index = buildIndex();
    };
    const close = () => {
      if (!overlay) return;
      overlay.style.opacity = "0";
      setTimeout(() => (overlay.style.display = "none"), 160);
      list.style.display = "none";
      document.body.style.overflow = prevBodyOverflow || "";
      openState = false;
      activeIdx = 0;
      currentItems = [];
    };

    $$("[aria-label='Search']").forEach((btn) =>
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation(); // prevent delegated handler from double-triggering
        open();
      })
    );
    // Fallback: event delegation for any Search control added later
    document.addEventListener("click", (e) => {
      const t = e.target.closest("[aria-label='Search']");
      if (!t) return;
      e.preventDefault();
      open();
    });

    // Close handlers
    closeBtn && closeBtn.addEventListener("click", close);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
      if (
        e.key === "/" &&
        !openState &&
        document.activeElement?.tagName !== "INPUT"
      ) {
        e.preventDefault();
        open();
      }
      if (!openState) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (currentItems.length) {
          activeIdx = (activeIdx + 1) % currentItems.length;
          renderSuggestions(currentItems, activeIdx);
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (currentItems.length) {
          activeIdx =
            (activeIdx - 1 + currentItems.length) % currentItems.length;
          renderSuggestions(currentItems, activeIdx);
        }
      } else if (e.key === "Enter" && document.activeElement === input) {
        if (currentItems[activeIdx]) {
          const dest = currentItems[activeIdx].url;
          if (dest === "#cart") {
            openCart();
            close();
          } else {
            location.href = dest;
          }
        }
      }
    });

    // Background click closes (outside the form and suggestions)
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close();
    });

    // Live suggestions
    input.addEventListener("input", () => {
      const q = input.value || "";
      if (!q.trim()) {
        list.style.display = "none";
        list.innerHTML = "";
        return;
      }
      currentItems = filterIndex(q);
      activeIdx = 0;
      renderSuggestions(currentItems, activeIdx);
      // Wire click for items (delegate)
      list.querySelectorAll("a").forEach((a, i) => {
        a.addEventListener("click", (ev) => {
          ev.preventDefault();
          const dest = currentItems[i]?.url;
          if (!dest) return;
          if (dest === "#cart") {
            openCart();
            close();
          } else {
            location.href = dest;
          }
        });
      });
    });

    // Submit fallback (if no suggestions)
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const q = (input?.value || "").trim().toLowerCase();
      if (!q) return close();
      if (currentItems[0]) {
        const dest = currentItems[0].url;
        if (dest === "#cart") {
          openCart();
          close();
          return;
        }
        location.href = dest;
        return;
      }
      // Fallback to coarse routing
      const routes = [
        {
          url: "index.html#new-arrivals",
          keys: ["new arrivals", "arrivals", "new in"],
        },
        {
          url: "index.html#best-sellers",
          keys: ["best sellers", "bestsellers", "best"],
        },
        {
          url: "index.html#categories",
          keys: ["categories", "shop by category", "category"],
        },
        { url: "index.html#hero", keys: ["hero", "home", "index"] },
        { url: "product.html#pair-it-with", keys: ["pair it with", "pair"] },
        {
          url: "product.html#you-also-viewed",
          keys: ["you also viewed", "also viewed"],
        },
        {
          url: "product.html#featured-collection",
          keys: ["featured collection", "featured"],
        },
        { url: "#cart", keys: ["cart", "bag", "checkout"] },
      ];
      let dest = routes.find((r) => r.keys.some((k) => q.includes(k)))?.url;
      if (!dest)
        dest = q.includes("collection")
          ? "collection.html"
          : q.includes("product")
          ? "product.html"
          : "index.html";
      if (dest === "#cart") {
        openCart();
        close();
        return;
      }
      const [path, hash] = dest.split("#");
      const here = location.pathname.split("/").pop() || "index.html";
      if (!path || path === here) {
        if (hash) {
          const el = document.getElementById(hash);
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        close();
      } else {
        location.href = dest;
      }
    });

    // --- PC hover styling for Search icon ---
    function setupSearchHover() {
      try {
        var btns = Array.from(
          document.querySelectorAll("[aria-label='Search']")
        );
        if (!btns.length) return;
        var isDesktop = function () {
          return (
            window.innerWidth >= 1024 &&
            !window.matchMedia("(hover: none)").matches
          );
        };
        var applyBase = function (b) {
          b.style.borderRadius = "999px";
          if (!b.style.padding || parseInt(b.style.padding) < 6)
            b.style.padding = "6px";
          b.style.transition = "background-color 160ms ease";
          b.style.display = "inline-flex";
          b.style.alignItems = "center";
          b.style.justifyContent = "center";
        };
        var hoverOn = function (e) {
          if (!isDesktop()) return;
          e.currentTarget.style.background = "rgba(0,0,0,.08)";
        };
        var hoverOff = function (e) {
          e.currentTarget.style.background = "transparent";
        };
        var down = function (e) {
          if (!isDesktop()) return;
          e.currentTarget.style.background = "rgba(0,0,0,.15)";
        };
        var up = function (e) {
          if (!isDesktop()) return;
          e.currentTarget.style.background = "rgba(0,0,0,.08)";
        };
        var update = function () {
          btns.forEach(function (b) {
            applyBase(b);
            if (!isDesktop()) b.style.background = "transparent";
          });
        };
        btns.forEach(function (b) {
          applyBase(b);
          b.addEventListener("mouseenter", hoverOn);
          b.addEventListener("mouseleave", hoverOff);
          b.addEventListener("mousedown", down);
          b.addEventListener("mouseup", up);
        });
        window.addEventListener("resize", update);
        update();
      } catch (_) {}
    }
  }

  // --- Cart / Mini-cart ---
  function setupCart() {
    let overlay = document.getElementById("cart-overlay");
    let drawer = document.getElementById("cart-drawer");
    let closeBtn = document.getElementById("cart-close");

    // Ensure required cart DOM exists even if the page provides its own header
    if (!overlay || !drawer) {
      if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "cart-overlay";
        Object.assign(overlay.style, {
          position: "fixed",
          inset: "0",
          background: "rgba(0,0,0,.4)",
          zIndex: "1000",
          display: "none",
        });
        document.body.appendChild(overlay);
      }
      if (!drawer) {
        drawer = document.createElement("aside");
        drawer.id = "cart-drawer";
        Object.assign(drawer.style, {
          position: "fixed",
          top: "0",
          right: "0",
          bottom: "0",
          width: "100%",
          maxWidth: "none",
          background: "#fff",
          boxShadow: "-2px 0 12px rgba(0,0,0,.15)",
          transform: "translateX(100%)",
          transition: "transform .25s ease",
          zIndex: "1001",
          display: "flex",
          flexDirection: "column",
        });
        drawer.innerHTML =
          '<div style="display:flex; align-items:center; justify-content:space-between; padding:12px 16px; border-bottom:1px solid #eee;">' +
          '<div style="font-weight:800">Your Cart</div>' +
          '<button id="cart-close" style="border:0; background:none; font-size:24px; cursor:pointer;">×</button>' +
          "</div>" +
          '<div id="cart-items" style="flex:1; overflow:auto; padding:12px 16px"></div>' +
          '<div style="border-top:1px solid #eee; padding:12px 16px">' +
          '<div style="display:flex; justify-content:space-between; margin-bottom:8px;"><span>Subtotal</span><span id="cart-subtotal">$0.00</span></div>' +
          '<button id="checkout-btn" style="width:100%; padding:12px; border-radius:8px; background:#000; color:#fff; font-weight:600; cursor:pointer;">Checkout</button>' +
          "</div>";
        document.body.appendChild(drawer);
      }
      closeBtn = document.getElementById("cart-close");
    }

    // Premium inline styling for cart overlay/drawer/header/footer
    try {
      if (overlay) {
        overlay.style.background = "rgba(15,15,15,.55)";
        overlay.style.backdropFilter = "blur(2px)";
      }
      if (drawer) {
        // Drawer width: Desktop 420px; Mobile full-screen (covers entire viewport)
        const applyCartDrawerWidth = () => {
          if (window.innerWidth >= 1024) {
            drawer.style.width = "420px";
            drawer.style.maxWidth = "420px";
          } else {
            drawer.style.width = "100%";
            drawer.style.maxWidth = "none";
          }
        };
        applyCartDrawerWidth();
        window.addEventListener("resize", applyCartDrawerWidth);

        drawer.style.boxShadow = "-12px 0 40px rgba(0,0,0,.18)";
        drawer.style.borderLeft = "0";
        drawer.style.transition =
          "transform .35s cubic-bezier(.2,.8,.2,1), box-shadow .35s";
        drawer.style.background = "#fff";
        drawer.style.display = "flex";
        drawer.style.flexDirection = "column";

        let header;
        try {
          header = drawer.querySelector(":scope > div");
        } catch (_) {
          header = drawer.firstElementChild || drawer.querySelector("div");
        }
        if (header) {
          header.style.display = "flex";
          header.style.alignItems = "center";
          header.style.justifyContent = "center";
          header.style.padding = "16px 18px";
          header.style.borderBottom = "1px solid #eee";
          header.style.position = "sticky";
          header.style.top = "0";
          header.style.background = "#fff";
          header.style.zIndex = "1";
          const title = header.firstElementChild;
          if (title) {
            title.textContent = "Your Shopping Cart";
            title.style.fontWeight = "700";
            title.style.letterSpacing = ".04em";
            title.style.textTransform = "uppercase";
            title.style.fontSize = "12px";
            title.style.color = "#111";
          }
          if (closeBtn) {
            closeBtn.style.position = "absolute";
            closeBtn.style.right = "12px";
            closeBtn.style.top = "50%";
            closeBtn.style.transform = "translateY(-50%)";
            closeBtn.style.fontSize = "22px";
            closeBtn.style.lineHeight = "1";
            closeBtn.style.cursor = "pointer";
          }
        }

        const itemsEl = document.getElementById("cart-items");
        if (itemsEl) {
          itemsEl.style.padding = "16px";
          itemsEl.style.background = "#fff";
        }

        const footer =
          (header &&
            header.nextElementSibling &&
            header.nextElementSibling.nextElementSibling) ||
          (drawer.children && drawer.children[drawer.children.length - 1]);
        if (footer) {
          footer.style.borderTop = "1px solid #eee";
          footer.style.padding = "16px";
          footer.style.position = "sticky";
          footer.style.bottom = "0";
          footer.style.background = "#fff";
          footer.style.boxShadow = "0 -10px 20px rgba(0,0,0,.04)";
          if (!footer.dataset.enhanced) {
            footer.innerHTML =
              '<div style="border:1px solid #dcdcdc; border-radius:8px; padding:16px; background:#fff;">' +
              '<div style="display:flex; justify-content:space-between; margin:6px 0;"><span>Subtotal</span><span id="cart-subtotal">$0.00</span></div>' +
              '<div style="display:flex; justify-content:space-between; margin:6px 0;"><span>GST</span><span id="cart-gst">$0.00</span></div>' +
              '<div style="height:1px; background:#e5e5e5; margin:12px 0;"></div>' +
              '<div style="display:flex; justify-content:space-between; margin:8px 0; font-weight:700;"><span>Order Total Incl. Tax</span><span id="cart-total-incl">$0.00</span></div>' +
              '<div style="display:flex; justify-content:space-between; margin:6px 0;"><span>Order Total Excl. Tax</span><span id="cart-total-excl">$0.00</span></div>' +
              "</div>" +
              '<button id="checkout-btn" style="width:100%; margin-top:12px; padding:14px 16px; border-radius:9999px; background:#000; color:#fff; font-weight:700; cursor:pointer;">Proceed to Checkout</button>';
            footer.dataset.enhanced = "1";
          }
        }

        const checkout = document.getElementById("checkout-btn");
        if (checkout) {
          checkout.style.width = "100%";
          checkout.style.padding = "14px 16px";
          checkout.style.borderRadius = "9999px";
          checkout.style.background = "#000";
          checkout.style.color = "#fff";
          checkout.style.fontWeight = "700";
          checkout.style.letterSpacing = ".02em";
          checkout.style.cursor = "pointer";
          checkout.setAttribute("type", "button");

          // Proceed to Checkout via Shopify Cart Permalink (client-only)
          if (!checkout.dataset.clickBound) {
            checkout.addEventListener("click", function (e) {
              e.preventDefault();
              try {
                if (typeof window.buildCheckoutUrl === "function") {
                  const direct = window.buildCheckoutUrl();
                  if (direct) {
                    window.location.href = direct;
                    return;
                  }
                }
                const CP = window.CartPermalink || {};
                const getLines =
                  typeof CP.getLines === "function"
                    ? CP.getLines
                    : function () {
                        try {
                          return JSON.parse(
                            localStorage.getItem("ja_cart_lines") || "[]"
                          );
                        } catch (_) {
                          return [];
                        }
                      };
                const build =
                  typeof CP.buildCartPermalink === "function"
                    ? CP.buildCartPermalink
                    : function (lines) {
                        const gidToNumeric = (gid) => {
                          if (!gid) return "";
                          const m = String(gid).match(/ProductVariant\/(\d+)/);
                          return m ? m[1] : "";
                        };
                        const items = (Array.isArray(lines) ? lines : [])
                          .filter((l) => Number(l?.quantity) > 0)
                          .map(
                            (l) =>
                              `${gidToNumeric(l.variantGid)}:${Math.max(
                                1,
                                Number(l.quantity)
                              )}`
                          )
                          .filter((s) => s && !s.startsWith(":"));
                        let url = `https://shop.journeysapparel.com/cart/${items.join(
                          ","
                        )}`;
                        try {
                          const params = new URLSearchParams(
                            window.location.search || ""
                          );
                          const pass = [];
                          params.forEach((v, k) => {
                            const kk = String(k);
                            if (
                              kk === "discount" ||
                              kk.toLowerCase().startsWith("utm_")
                            ) {
                              pass.push(
                                `${encodeURIComponent(kk)}=${encodeURIComponent(
                                  v
                                )}`
                              );
                            }
                          });
                          if (pass.length) url += `?${pass.join("&")}`;
                        } catch (_) {}
                        return url;
                      };
                const lines = getLines() || [];
                const nonEmpty = lines.filter((l) => Number(l?.quantity) > 0);
                if (!nonEmpty.length) {
                  alert("Your cart is empty.");
                  return;
                }
                const url = build(nonEmpty);
                if (!url) {
                  alert("Checkout is unavailable. Please try again.");
                  return;
                }
                window.location.href = url;
              } catch (err) {
                console.error("Checkout failed:", err);
                alert("Checkout is unavailable. Please try again.");
              }
            });
            checkout.dataset.clickBound = "1";
          }
        }
      }
    } catch (_) {}

    const getCart = () => {
      try {
        return JSON.parse(localStorage.getItem("cartItems") || "[]");
      } catch {
        return [];
      }
    };
    const setCart = (items) => {
      localStorage.setItem("cartItems", JSON.stringify(items));
      // Keep permalink cart (ja_cart_lines) in sync with mini-cart UI
      try {
        const byVariant = {};
        (items || []).forEach((it) => {
          if (!it || !it.variantGid) return;
          const key = String(it.variantGid);
          byVariant[key] =
            (byVariant[key] || 0) + Math.max(1, Number(it.qty || 1));
        });
        const lines = Object.keys(byVariant).map((variantGid) => ({
          variantGid,
          quantity: byVariant[variantGid],
        }));
        localStorage.setItem("ja_cart_lines", JSON.stringify(lines));
      } catch (_) {}
      updateCartCount(items);
      renderCart(items);
    };
    // Build Shopify checkout URL from mini-cart items
    // Reads localStorage cartItems, merges duplicates, converts GIDs to numeric, and appends discount/UTM params
    window.buildCheckoutUrl = function buildCheckoutUrl() {
      try {
        const items = JSON.parse(localStorage.getItem("cartItems") || "[]");
        if (!Array.isArray(items) || !items.length) return "";

        const toNumericId = (id, gid) => {
          if (!id && gid) {
            const m = String(gid).match(/ProductVariant\/(\d+)/);
            return m ? m[1] : "";
          }
          if (id && /^\d+$/.test(String(id))) return String(id);
          return "";
        };

        const byId = {};
        items.forEach((it) => {
          if (!it) return;
          const vid = toNumericId(it.variantId, it.variantGid);
          const qty = Math.max(0, Number(it.qty || 0));
          if (!vid || qty <= 0) return;
          byId[vid] = (byId[vid] || 0) + qty;
        });

        const parts = Object.keys(byId).map(
          (vid) => `${vid}:${Math.max(1, byId[vid])}`
        );
        if (!parts.length) return "";

        let url = `https://shop.journeysapparel.com/cart/${parts.join(",")}`;
        try {
          const params = new URLSearchParams(window.location.search || "");
          const pass = [];
          params.forEach((v, k) => {
            const kk = String(k);
            if (kk === "discount" || kk.toLowerCase().startsWith("utm_")) {
              pass.push(`${encodeURIComponent(kk)}=${encodeURIComponent(v)}`);
            }
          });
          if (pass.length) url += `?${pass.join("&")}`;
        } catch (_) {}
        return url;
      } catch (_) {
        return "";
      }
    };

    window.openCart = function openCart() {
      if (!overlay || !drawer) return;
      overlay.style.display = "block";
      drawer.style.transform = "translateX(0)";
      document.body.style.overflow = "hidden";
    };
    function closeCart() {
      if (!overlay || !drawer) return;
      overlay.style.display = "none";
      drawer.style.transform = "translateX(100%)";
      document.body.style.overflow = "";
    }

    function money(n) {
      try {
        const x =
          typeof n === "string" ? parseFloat(n.replace(/[^0-9.]/g, "")) : n;
        return `$${x.toFixed(2)}`;
      } catch {
        return "$0.00";
      }
    }

    function updateCartCount(items = getCart()) {
      const count = items.reduce((a, it) => a + (it.qty || 1), 0);
      // Update any existing count placeholders (e.g., in mobile drawer)
      $$("#cart-count").forEach((el) => (el.textContent = String(count)));

      // Ensure a small badge on header cart icons (a[aria-label='Cart'])
      // Limit to visible header icons: exclude items inside the mobile drawer
      const anchors = Array.from(
        document.querySelectorAll("a[aria-label='Cart']")
      ).filter(
        (a) => !a.closest('aside[aria-label="Mobile navigation drawer"]')
      );
      anchors.forEach((a) => {
        try {
          if (!a) return;
          if (!a.style.position || a.style.position === "") {
            a.style.position = "relative"; // anchor for absolute badge
          }
          // stabilize layout for consistent badge position and clickability
          a.style.display = "inline-block";
          a.style.lineHeight = "1";
          a.style.zIndex = "1005";
          a.style.pointerEvents = "auto";
          const parent = a.closest(".nav-right") || a.parentElement;
          if (parent && parent.style) {
            if (!parent.style.position || parent.style.position === "") {
              parent.style.position = "relative";
            }
            parent.style.zIndex = "1005";
          }
          let badge = a.querySelector("[data-cart-badge]");
          if (!badge) {
            badge = document.createElement("span");
            badge.setAttribute("data-cart-badge", "");
            // Inline premium badge styling
            badge.style.position = "absolute";
            badge.style.top = "-4px";
            badge.style.right = "-4px";
            badge.style.minWidth = "16px";
            badge.style.height = "16px";
            badge.style.padding = "0 4px";
            badge.style.borderRadius = "999px";
            badge.style.background = "#000";
            badge.style.color = "#fff";
            badge.style.fontSize = "10px";
            badge.style.lineHeight = "16px";
            badge.style.textAlign = "center";
            badge.style.fontWeight = "700";
            badge.style.pointerEvents = "none";
            badge.style.boxSizing = "border-box";
            a.appendChild(badge);
          }
          // Show when there are items; hide when empty
          badge.textContent = String(Math.min(count, 99));
          badge.style.display = count > 0 ? "inline-block" : "none";
        } catch (_) {}
      });
    }

    function renderCart(items = getCart()) {
      const wrap = document.getElementById("cart-items");
      const sub = document.getElementById("cart-subtotal");
      if (!wrap || !sub) return;
      if (!items.length) {
        wrap.innerHTML =
          '<div style="text-align:center; color:#666; padding:24px 0;">Your cart is empty.</div>';
        sub.textContent = "$0.00";
        const gstEl = document.getElementById("cart-gst");
        const inclEl = document.getElementById("cart-total-incl");
        const exclEl = document.getElementById("cart-total-excl");
        if (gstEl) gstEl.textContent = "$0.00";
        if (inclEl) inclEl.textContent = "$0.00";
        if (exclEl) exclEl.textContent = "$0.00";
        return;
      }
      let html = "";
      let total = 0;
      items.forEach((it, idx) => {
        const priceNum =
          parseFloat(String(it.price).replace(/[^0-9.]/g, "")) || 0;
        total += priceNum * (it.qty || 1);
        html += `
          <div style="display:grid; grid-template-columns:72px 1fr; gap:12px; margin-bottom:12px; padding:12px; border:1px solid #e5e5e5; border-radius:12px; background:#fafafa;">
            <img src="${it.image || ""}" alt="${
          it.name || ""
        }" style="width:72px; height:72px; object-fit:cover; border-radius:10px; border:1px solid #eee"/>
            <div style="display:flex; flex-direction:column; gap:8px;">
              <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:8px;">
                <div style="font-size:14px; color:#111; font-weight:700; line-height:1.2;">${
                  it.name || "Item"
                }</div>
                <div style="font-size:14px; color:#111; font-weight:700; white-space:nowrap;">${
                  it.price || "$0.00"
                }</div>
              </div>
              <div style="font-size:12px; color:#666;">${
                it.size ? `Size ${it.size}` : ""
              }</div>
              <div style="display:flex; align-items:center; gap:12px;">
                <div style="display:inline-flex; align-items:center; border:1px solid #dcdcdc; border-radius:8px; overflow:hidden; height:32px;">
                  <button data-step=\"dec\" data-idx=\"${idx}\" style=\"width:32px; height:32px; background:#fff; border:0; cursor:pointer; font-size:16px; color:#333;\">−</button>
                  <span style=\"min-width:28px; text-align:center; font-size:13px; color:#111;\">${
                    it.qty || 1
                  }</span>
                  <button data-step=\"inc\" data-idx=\"${idx}\" style=\"width:32px; height:32px; background:#fff; border:0; cursor:pointer; font-size:16px; color:#333;\">+</button>
                </div>
                <button data-remove=\"${idx}\" style=\"border:0; background:none; color:#999; cursor:pointer; font-size:12px; text-decoration:underline;\">Remove</button>
              </div>
            </div>
          </div>`;
      });
      html +=
        '<div style="height:1px; background:#e5e5e5; margin:12px 0;"></div><div style="text-align:center; margin-bottom:12px;"><a href="#" id="continue-shopping" style="color:#2f6fec; text-decoration:underline;">Continue shopping</a></div>';
      wrap.innerHTML = html;
      sub.textContent = money(total);
      // GST added on top (10% of subtotal)
      const gst = total * 0.1;
      const gstEl = document.getElementById("cart-gst");
      const inclEl = document.getElementById("cart-total-incl");
      const exclEl = document.getElementById("cart-total-excl");
      if (gstEl) gstEl.textContent = money(gst);
      if (inclEl) inclEl.textContent = money(total + gst);
      if (exclEl) exclEl.textContent = money(total);
      // remove handlers
      wrap.querySelectorAll("[data-remove]").forEach((btn) =>
        btn.addEventListener("click", () => {
          const idx = parseInt(btn.getAttribute("data-remove"), 10);
          const items = getCart();
          items.splice(idx, 1);
          setCart(items);
        })
      );
      // stepper handlers
      wrap.querySelectorAll('[data-step="dec"]').forEach((btn) =>
        btn.addEventListener("click", () => {
          const idx = parseInt(btn.getAttribute("data-idx"), 10);
          const items = getCart();
          if (!items[idx]) return;
          items[idx].qty = Math.max(1, (items[idx].qty || 1) - 1);
          setCart(items);
        })
      );
      wrap.querySelectorAll('[data-step="inc"]').forEach((btn) =>
        btn.addEventListener("click", () => {
          const idx = parseInt(btn.getAttribute("data-idx"), 10);
          const items = getCart();
          if (!items[idx]) return;
          items[idx].qty = (items[idx].qty || 1) + 1;
          setCart(items);
        })
      );
      // continue shopping closes cart
      const cont = document.getElementById("continue-shopping");
      cont &&
        cont.addEventListener("click", (e) => {
          e.preventDefault();
          closeCart();
        });
    }

    // initial
    updateCartCount();
    renderCart();

    // triggers
    overlay &&
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) closeCart();
      });
    closeBtn && closeBtn.addEventListener("click", closeCart);
    const cartLinks = [...$$("a[aria-label='Cart']"), ...$$(".cart-link")];
    cartLinks.forEach((lnk) =>
      lnk.addEventListener("click", (e) => {
        e.preventDefault();
        window.openCart();
      })
    );
    // Fallback: delegate for any future cart triggers
    document.addEventListener("click", (e) => {
      const trg = e.target.closest(
        "a[aria-label='Cart'], .cart-link, [data-open-cart]"
      );
      if (!trg) return;
      e.preventDefault();
      window.openCart();
    });

    // expose helpers for other modules
    window.__cart = { getCart, setCart, updateCartCount, renderCart };
  }
  // Make setupCart globally available immediately after declaration
  window.setupCart = setupCart;

  function setupAddToCartUI() {
    const btn = Array.from(document.querySelectorAll(".p-details .btn")).find(
      (b) => /add\s*to\s*cart/i.test(b.textContent || "")
    );
    if (!btn) return;

    // Avoid attaching duplicate handlers (which can cause +2 quantity)
    if (btn.dataset.addHandlerAttached === "1") return;
    btn.dataset.addHandlerAttached = "1";

    btn.addEventListener("click", (e) => {
      // allow guard to run; if size not selected it will alert
      const selected = document.querySelector(
        '#size-grid .size[aria-pressed="true"]'
      );
      if (!selected) return; // guard will have alerted

      // Debounce: prevent accidental double-firing in the same tick
      if (btn.dataset.isAdding === "1") return;
      btn.dataset.isAdding = "1";

      // Ensure cart is initialized before adding
      if (!window.__cart || typeof window.__cart.setCart !== "function") {
        try {
          if (typeof window.setupCart === "function") window.setupCart();
        } catch (_) {}
      }

      const name =
        document.querySelector(".p-details h1")?.textContent?.trim() ||
        "Product";
      const price =
        document.querySelector(".p-details .p-price")?.textContent?.trim() ||
        "$0.00";
      const size = selected?.textContent?.trim() || "";
      const image =
        document.querySelector(".gallery-main img")?.getAttribute("src") || "";

      const items = (window.__cart?.getCart && window.__cart.getCart()) || [];
      const existing = items.find((it) => it.name === name && it.size === size);
      if (existing) existing.qty = (existing.qty || 1) + 1;
      else items.push({ name, price, size, image, qty: 1 });
      window.__cart?.setCart && window.__cart.setCart(items);
      // Open cart (initialize on-demand if still missing)
      try {
        if (
          typeof window.openCart !== "function" &&
          typeof window.setupCart === "function"
        ) {
          window.setupCart();
        }
      } catch (_) {}
      window.openCart && window.openCart();

      // Clear debounce after a short moment to allow next add
      setTimeout(() => {
        btn.dataset.isAdding = "0";
      }, 300);
    });
  }
})();

// Robust global fallback: ensure cart opens even if setupCart hasn't run yet
(function () {
  document.addEventListener("click", function (e) {
    var trg =
      e.target &&
      e.target.closest &&
      e.target.closest("a[aria-label='Cart'], .cart-link, [data-open-cart]");
    if (!trg) return;
    e.preventDefault();
    try {
      if (
        typeof window.openCart !== "function" &&
        typeof window.setupCart === "function"
      ) {
        window.setupCart();
      }
    } catch (_) {}
    if (typeof window.openCart === "function") {
      try {
        window.openCart();
      } catch (_) {}
    }
  });
})();

// Ultra-robust cart click: capture clicks in the visual cart area even if covered by overlays
try {
  document.addEventListener(
    "click",
    function (e) {
      var hdr = document.querySelector("header.header");
      if (!hdr) return;
      var a = hdr.querySelector("a[aria-label='Cart']");
      if (!a) return;
      var r = a.getBoundingClientRect();
      var x = e.clientX,
        y = e.clientY;
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
        e.preventDefault();
        try {
          if (
            typeof window.openCart !== "function" &&
            typeof window.setupCart === "function"
          ) {
            window.setupCart();
          }
        } catch (_) {}
        if (typeof window.openCart === "function") {
          try {
            window.openCart();
          } catch (_) {}
        }
      }
    },
    true // capture phase to run even if other handlers stop propagation
  );
} catch (_) {}

// Mobile CTA popup inspired by Frontrunners (first-visit, short delay)
function setupMobileCTA() {
  try {
    const params = new URLSearchParams(location.search);
    const force = params.get("cta") === "show" || params.get("cta") === "1";
    const isMobile = matchMedia("(max-width: 768px)").matches;
    const key = "journey_cta_seen";
    if (!force) {
      if (!isMobile) return;
      if (localStorage.getItem(key) === "1") return;
    }

    setTimeout(
      () => {
        const overlay = document.createElement("div");
        overlay.setAttribute("role", "dialog");
        overlay.setAttribute("aria-modal", "true");
        overlay.style.cssText = [
          "position: fixed",
          "inset: 0",
          "background: rgba(0,0,0,0.5)",
          "display: flex",
          "align-items: center",
          "justify-content: center",
          "z-index: 9999",
          "padding: 16px",
        ].join(";");

        const card = document.createElement("div");
        card.style.cssText = [
          "width: 100%",
          "max-width: 420px",
          "background: #fff",
          "border-radius: 14px",
          "overflow: hidden",
          "box-shadow: 0 10px 30px rgba(0,0,0,0.25)",
          "position: relative",
        ].join(";");

        const closeBtn = document.createElement("button");
        closeBtn.setAttribute("aria-label", "Close");
        closeBtn.textContent = "×";
        closeBtn.style.cssText = [
          "position: absolute",
          "top: 8px",
          "right: 10px",
          "background: transparent",
          "border: 0",
          "font-size: 28px",
          "line-height: 1",
          "color: #000",
          "cursor: pointer",
        ].join(";");

        const img = new Image();
        img.src = "images/cta-mobile.jpg"; // replace with your preferred asset
        img.alt = "New Arrivals";
        img.style.cssText = [
          "display: block",
          "width: 100%",
          "height: 200px",
          "object-fit: cover",
          "background: linear-gradient(135deg,#f2f2f2,#e8e8e8)",
        ].join(";");
        img.onerror = () => {
          img.style.display = "none";
          card.style.borderTopLeftRadius = "14px";
          card.style.borderTopRightRadius = "14px";
        };

        const content = document.createElement("div");
        content.style.cssText = [
          "padding: 18px 16px 16px",
          "text-align: left",
          "color: #000",
        ].join(";");

        const headline = document.createElement("div");
        headline.textContent = "New Arrivals Just Dropped";
        headline.style.cssText = [
          "font-size: 18px",
          "font-weight: 700",
          "margin-bottom: 8px",
        ].join(";");

        const sub = document.createElement("div");
        sub.textContent = "Premium essentials. Limited restocks.";
        sub.style.cssText = [
          "font-size: 14px",
          "opacity: 0.85",
          "margin-bottom: 14px",
        ].join(";");

        const cta = document.createElement("a");
        cta.href = "collection.html?section=new-arrivals";
        cta.textContent = "Shop New Arrivals";
        cta.style.cssText = [
          "display: inline-block",
          "padding: 10px 14px",
          "background: #000",
          "color: #fff",
          "text-decoration: none",
          "border-radius: 8px",
          "font-size: 14px",
          "font-weight: 600",
        ].join(";");

        const later = document.createElement("a");
        later.href = "#";
        later.textContent = "Maybe later";
        later.style.cssText = [
          "display: inline-block",
          "margin-left: 12px",
          "font-size: 13px",
          "color: #000",
          "text-decoration: underline",
        ].join(";");

        const prevOverflow = document.body.style.overflow;
        function dismiss() {
          try {
            localStorage.setItem(key, "1");
          } catch (e) {}
          document.body.style.overflow = prevOverflow || "";
          if (overlay && overlay.parentNode)
            overlay.parentNode.removeChild(overlay);
        }

        overlay.addEventListener("click", (e) => {
          if (e.target === overlay) dismiss();
        });
        closeBtn.addEventListener("click", (e) => {
          e.preventDefault();
          dismiss();
        });
        later.addEventListener("click", (e) => {
          e.preventDefault();
          dismiss();
        });
        cta.addEventListener("click", () => {
          try {
            localStorage.setItem(key, "1");
          } catch (e) {}
          document.body.style.overflow = prevOverflow || "";
        });

        content.appendChild(headline);
        content.appendChild(sub);
        content.appendChild(cta);
        content.appendChild(later);
        card.appendChild(closeBtn);
        card.appendChild(img);
        card.appendChild(content);
        overlay.appendChild(card);

        document.body.appendChild(overlay);
        document.body.style.overflow = "hidden";
      },
      force ? 100 : 1400
    );
  } catch (err) {
    console.warn("setupMobileCTA error", err);
  }
}

// Development mode utilities
function showDevelopmentNotice() {
  // Only show in local development
  if (
    location.hostname === "localhost" ||
    location.hostname === "127.0.0.1" ||
    location.protocol === "file:"
  ) {
    const notice = document.createElement("div");
    notice.id = "dev-notice";
    notice.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 8px 16px;
        text-align: center;
        font-size: 14px;
        z-index: 10000;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      ">
        <strong>🚧 Development Mode</strong> -
        Shopify features require deployment to work.
        <a href="#" onclick="this.parentElement.parentElement.remove()" style="color: #fff; text-decoration: underline; margin-left: 8px;">Dismiss</a>
      </div>
    `;

    // Remove existing notice
    const existing = document.getElementById("dev-notice");
    if (existing) existing.remove();

    document.body.appendChild(notice);

    // Auto-dismiss after 10 seconds
    setTimeout(() => {
      if (document.getElementById("dev-notice")) {
        document.getElementById("dev-notice").remove();
      }
    }, 10000);
  }
}

// Check for development mode on page load
document.addEventListener("DOMContentLoaded", () => {
  // Show development notice if running locally and Shopify API not available
  setTimeout(() => {
    if (
      !window.shopifyAPI ||
      location.hostname === "localhost" ||
      location.hostname === "127.0.0.1" ||
      location.protocol === "file:"
    ) {
      const isLocalhost =
        location.hostname === "localhost" ||
        location.hostname === "127.0.0.1" ||
        location.protocol === "file:";
      if (isLocalhost) {
        console.log(
          "🚧 Running in development mode - Shopify features limited"
        );
      }
    }
  }, 1000);
});
