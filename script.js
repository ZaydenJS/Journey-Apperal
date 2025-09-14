// Journey Apparel interactions
(function () {
  const $ = (s, ctx = document) => ctx.querySelector(s);
  const $$ = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));

  function ensureStandardHeader() {
    // If a header already exists, do nothing (prevents affecting existing pages)
    if (document.querySelector("header.header")) return;
    const tpl = `
<div class="announcement upper" style="position: sticky; top: 0; left: 0; right: 0">
  Free shipping over $75 • Launch in <span id="countdown">00:00:00</span>
</div>
<header class="header" style="top: 0; left: 0; right: 0">
  <div class="container header-inner" style="max-width: none; width: 100%; padding-left: 16px; padding-right: 16px;">
    <div class="nav-left row">
      <button class="menu-toggle" aria-label="Open menu"><span></span><span></span><span></span></button>
      <nav class="nav" aria-label="Primary">
        <a href="#" class="header-item">Shop
          <div class="mega" role="dialog" aria-label="Mega menu">
            <div class="mega-grid container">
              <div>
                <h4 class="upper">Shop by Category</h4>
                <div class="links">
                  <a href="collection.html">Tops</a>
                  <a href="collection.html">Hoodies</a>
                  <a href="collection.html">Bottoms</a>
                  <a href="collection.html">Accessories</a>
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
      <button class="icon-btn" aria-label="Wishlist">♡</button>
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
      <a href="collection.html?category=tees">Tees</a>
      <a href="collection.html?category=hoodies">Hoodies</a>
      <a href="collection.html?category=shorts">Shorts</a>
      <a href="collection.html?category=pants">Pants</a>
      <a href="collection.html?category=accessories">Accessories</a>
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
    <a href="#" class="row-item">Members Sign Up</a>
    <button class="row-item accordion" data-accordion aria-expanded="false">Customer Care <span class="chev">›</span></button>
    <div class="sub">
      <a href="#">Exchanges & Returns</a>
      <a href="#">Shipping</a>
      <a href="#">Policies</a>
      <a href="#">Contact</a>
    </div>
    <a href="#" class="row-item">Rewards</a>
  </nav>
  <div class="drawer-bottom"><a href="#" class="row-item">👤 Log in / Create Account</a></div>
</aside>`;
    document.body.insertAdjacentHTML("afterbegin", tpl);
  }
  document.addEventListener("DOMContentLoaded", () => {
    // Ensure standard header exists before wiring behaviors (no-op if already present)
    ensureStandardHeader();

    setupMobileNav();
    setupMegaMenuHoverIntent();
    setupCarousel();
    setupQuickShopTouch();
    setupCardLinks();

    setupModalFreeShipping();
    setupCountdown();
    setupNewsletter();
    setupCurrency();
    setupChatWidget();
    setupCollapsibles();
    setupGallery();
    setupFilters();
    setupCollectionFromQuery();
    setupCollectionUI();
    setupProductFromSlug();
    setupRecentlyViewedAndBestSellers();
    setupSizeSelection();
    setupWishlist();

    // New: sitewide search and cart
    setupSearch();
    setupCart();
    setupAddToCart();

    setupAddToCartGuard();
    normalizeTitleAndAnnouncement();
    enableHoverSwapIn();
    setupImageFallbacks();
    setupThematicImages();
    normalizeCarouselMedia();
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

  function setupProductFromSlug() {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get("slug");
    if (!slug) return;

    const products = {
      "tech-tee": {
        name: "Tech Tee",
        price: "$48",
        main: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1200&auto=format&fit=crop",
        alt: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop",
      },
      "front-runner-vest": {
        name: "City Hoodie",
        price: "$98",
        main: "https://images.unsplash.com/photo-1547949003-9792a18a2601?q=80&w=1200&auto=format&fit=crop",
        alt: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=800&auto=format&fit=crop",
      },
      "run-jacket": {
        name: "Aero Tee",
        price: "$48",
        main: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1200&auto=format&fit=crop",
        alt: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop",
      },
      "city-hoodie": {
        name: "City Hoodie",
        price: "$98",
        main: "https://images.unsplash.com/photo-1547949003-9792a18a2601?q=80&w=1200&auto=format&fit=crop",
        alt: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=800&auto=format&fit=crop",
      },
      "aero-jogger": {
        name: "Aero Jogger",
        price: "$78",
        main: "https://images.unsplash.com/photo-1520975922324-c2e5a62b2398?q=80&w=1200&auto=format&fit=crop",
        alt: "https://images.unsplash.com/photo-1535530992830-e25d07cfa780?q=80&w=800&auto=format&fit=crop",
      },
      "ultra-short": {
        name: "Ultra Short",
        price: "$58",
        main: "https://images.unsplash.com/photo-1535530992830-e25d07cfa780?q=80&w=1200&auto=format&fit=crop",
        alt: "https://images.unsplash.com/photo-1520975922324-c2e5a62b2398?q=80&w=800&auto=format&fit=crop",
      },
      "studio-tank": {
        name: "Studio Tank",
        price: "$44",
        main: "https://images.unsplash.com/photo-1542296332-2e4473faf563?q=80&w=1200&auto=format&fit=crop",
        alt: "https://images.unsplash.com/photo-1521572163474-611481863552?q=80&w=800&auto=format&fit=crop",
      },
      "everyday-cap": {
        name: "Everyday Cap",
        price: "$28",
        main: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop",
        alt: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop",
      },
      "zip-jacket": {
        name: "Everyday Cap",
        price: "$28",
        main: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop",
        alt: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?q=80&w=800&auto=format&fit=crop",
      },
      "run-shell": {
        name: "Aero Jogger",
        price: "$78",
        main: "https://images.unsplash.com/photo-1520975922324-c2e5a62b2398?q=80&w=1200&auto=format&fit=crop",
        alt: "https://images.unsplash.com/photo-1535530992830-e25d07cfa780?q=80&w=800&auto=format&fit=crop",
      },
      "aero-tee": {
        name: "Aero Tee",
        price: "$48",
        main: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1200&auto=format&fit=crop",
        alt: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop",
      },
      "train-tank": {
        name: "Train Tank",
        price: "$44",
        main: "https://images.unsplash.com/photo-1542296332-2e4473faf563?q=80&w=1200&auto=format&fit=crop",
        alt: "https://images.unsplash.com/photo-1560243563-062b4b6eb650?q=80&w=800&auto=format&fit=crop",
      },
      "core-legging": {
        name: "Core Legging",
        price: "$88",
        main: "https://images.unsplash.com/photo-1560243563-062b4b6eb650?q=80&w=1200&auto=format&fit=crop",
        alt: "https://images.unsplash.com/photo-1535530992830-e25d07cfa780?q=80&w=800&auto=format&fit=crop",
      },
    };

    const p = products[slug];
    if (!p) return;

    const titleEl = document.querySelector(".p-details h1");
    const priceEl = document.querySelector(".p-details .p-price");

    // New gallery (preferred)
    const mainGalleryImg = document.querySelector(".gallery-main img");
    const galleryThumbs = Array.from(document.querySelectorAll(".thumbs img"));

    // Legacy edge-peek gallery (if present)
    const mainImg = document.querySelector(".edge-gallery .main");
    const leftImg = document.querySelector(".edge-gallery .left");
    const rightImg = document.querySelector(".edge-gallery .right");

    if (titleEl) titleEl.textContent = p.name;
    if (priceEl) priceEl.textContent = p.price;

    const pair = getImagesForLabel(p.name, 1200, 800);
    if (mainGalleryImg) {
      mainGalleryImg.src = pair.main;
      mainGalleryImg.alt = p.name;
      if (galleryThumbs[0]) {
        galleryThumbs[0].src = pair.main;
        galleryThumbs[0].alt = p.name;
      }
      if (galleryThumbs[1]) {
        galleryThumbs[1].src = pair.alt;
        galleryThumbs[1].alt = p.name + " alt";
      }
    }

    if (mainImg) {
      mainImg.src = pair.main;
      mainImg.alt = p.name;
    }
    if (rightImg) {
      rightImg.src = pair.alt;
      rightImg.alt = p.name + " alt";
    }
    if (leftImg) {
      leftImg.src = pair.alt;
      leftImg.alt = p.name + " alt 2";
    }

    document.title = p.name + " — Journey Apparel";

    // Record this product into Recently Viewed (localStorage)
    try {
      const key = "recentlyViewedV1";
      const current = JSON.parse(localStorage.getItem(key) || "[]");
      const item = {
        slug,
        name: p.name,
        price: p.price,
        main: p.main,
        alt: p.alt,
        href: "product.html?slug=" + slug,
      };
      const filtered = (current || []).filter((x) => x && x.slug !== slug);
      filtered.unshift(item);
      localStorage.setItem(key, JSON.stringify(filtered.slice(0, 20)));
    } catch (_) {}
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
    // Desktop: show mega on hover via CSS; add focus/escape accessibility
    const header = $(".header");
    if (!header) return;
    header.addEventListener("keyup", (e) => {
      if (e.key === "Escape")
        $$(".mega", header).forEach((m) => (m.style.display = "none"));
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
  function setupCardLinks() {
    // Delegate clicks so it works for all cards (including dynamically added ones)
    document.addEventListener("click", (e) => {
      if (e.target.closest(".ctrl,a,button")) return;
      const card = e.target.closest(".card[data-href]");
      if (!card) return;
      const href = card.getAttribute("data-href");
      if (href) window.location.href = href;
    });
  }

  // Sitewide: enable image hover swap for cards with a secondary <img.alt>
  function enableHoverSwapIn(root) {
    try {
      const scope = root || document;
      const wraps = scope.querySelectorAll(".card .img-wrap");
      wraps.forEach((wrap) => {
        const alt = wrap.querySelector("img.alt");
        if (!alt) return;
        // Ensure overlay styles (inline per site preference)
        if (!wrap.style.position) wrap.style.position = "relative";
        alt.style.position = "absolute";
        alt.style.inset = "0";
        alt.style.width = "100%";
        alt.style.height = "100%";
        if (!alt.style.objectFit) alt.style.objectFit = "cover";
        if (!alt.style.transition) alt.style.transition = "opacity 160ms ease";
        alt.style.pointerEvents = "none";
        if (!alt.style.opacity) alt.style.opacity = "0";

        // Hover/touch behaviors
        const show = () => (alt.style.opacity = "1");
        const hide = () => (alt.style.opacity = "0");
        wrap.addEventListener("mouseenter", show);
        wrap.addEventListener("mouseleave", hide);
        wrap.addEventListener("touchstart", show, { passive: true });
        wrap.addEventListener("touchend", hide);
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
        // if currently auto, set explicit height first
        const current = panel.scrollHeight;
        panel.style.height = current + "px";
        requestAnimationFrame(() => {
          panel.style.height = "0px";
        });
      };

      const toggle = () => {
        const isOpen = btn.getAttribute("aria-expanded") === "true";
        isOpen ? closePanel() : openPanel();
      };

      btn.addEventListener("click", toggle);
      btn.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle();
        }
      });
    });
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
      const FALLBACK = "LOGO/1.png";
      const attach = (img) => {
        if (!img || img.__fallbackBound) return;
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
      panel.style.left = r.left + "px"; // fixed: viewport coordinates
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

  function setupCollectionFromQuery() {
    const here = (location.pathname.split("/").pop() || "").toLowerCase();
    if (!here.endsWith("collection.html")) return;
    const params = new URLSearchParams(location.search);
    const header = document.querySelector("main .mt-0 .upper");
    if (!header) return;

    const toTitle = (s) =>
      s.replace(/[-_]+/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
    let label = "";
    if (params.get("section")) {
      const v = params.get("section");
      const map = {
        "new-arrivals": "New Arrivals",
        "back-in-stock": "Back In Stock",
        "shop-all": "Shop All",
      };
      label = map[v] || toTitle(v);
    } else if (params.get("category")) {
      label = toTitle(params.get("category"));
    } else if (params.get("collection")) {
      label = toTitle(params.get("collection"));
    } else {
      label = "Shop All";
    }
    header.textContent = label.toUpperCase();
    try {
      document.title = `${label} – Journey Apparel`;
    } catch {}
  }

  function setupCollectionUI() {
    const here = (location.pathname.split("/").pop() || "").toLowerCase();
    if (!here.endsWith("collection.html")) return;

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
      sortToggle.addEventListener("click", (e) => {
        e.stopPropagation();
        const open = sortPanel.style.display !== "block";
        if (open) position();
        show(open);
        syncToggleColumn();
      });
      document.addEventListener("click", () => show(false));
      window.addEventListener("scroll", () => show(false), { passive: true });
      window.addEventListener("resize", () => show(false));

      // Directly wire the sort actions so they always apply
      sortPanel.querySelectorAll("[data-sort]").forEach((btn) => {
        btn.addEventListener("click", (ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          const val = btn.getAttribute("data-sort") || "featured";
          const label = btn.textContent.trim();
          const firstSpan = sortToggle.querySelector("span");
          if (firstSpan)
            firstSpan.textContent =
              val === "none" ? "Sort by" : `Sort by: ${label}`;
          show(false);
          // Apply collection sort immediately if available
          if (window.__applyCollection) {
            // Bridge to the local variable via synthetic event
            document.dispatchEvent(
              new CustomEvent("__set-sort", { detail: val })
            );
          }
        });
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
      type: ["Tees", "Hoodies", "Shorts", "Pants", "Accessories"],

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
        zIndex: 1100,
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

    // ---- Collection: Data, render, filter, sort ----
    (function () {
      const here = (location.pathname.split("/").pop() || "").toLowerCase();
      if (!here.endsWith("collection.html")) return;
      const grid = document.querySelector(".grid.products");
      const countEl = document.querySelector("main .muted");
      if (!grid) return;

      // Build 50 demo products (adds 27 more to reach 50 total)
      const base = [
        {
          name: "Tech Tee",
          type: "Tees",
          image:
            "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=800&auto=format&fit=crop",
          hover:
            "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800&auto=format&fit=crop",
          price: 48,
          color: "Black",
          sizes: ["XS", "S", "M", "L", "XL"],
        },
        {
          name: "Aero Jogger",
          type: "Pants",
          image:
            "https://images.unsplash.com/photo-1520975922324-c2e5a62b2398?q=80&w=800&auto=format&fit=crop",
          hover:
            "https://images.unsplash.com/photo-1535530992830-e25d07cfa780?q=80&w=800&auto=format&fit=crop",
          price: 78,
          color: "Gray",
          sizes: ["XS", "S", "M", "L", "XL"],
        },
        {
          name: "City Hoodie",
          type: "Hoodies",
          image:
            "https://images.unsplash.com/photo-1547949003-9792a18a2601?q=80&w=800&auto=format&fit=crop",
          hover:
            "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=800&auto=format&fit=crop",
          price: 98,
          color: "Blue",
          sizes: ["S", "M", "L", "XL"],
        },
        {
          name: "Ultra Short",
          type: "Shorts",
          image:
            "https://images.unsplash.com/photo-1535530992830-e25d07cfa780?q=80&w=800&auto=format&fit=crop",
          hover:
            "https://images.unsplash.com/photo-1520975922324-c2e5a62b2398?q=80&w=800&auto=format&fit=crop",
          price: 58,
          color: "Green",
          sizes: ["XS", "S", "M", "L", "XL"],
        },
        {
          name: "Aero Tee",
          type: "Tees",
          image:
            "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=800&auto=format&fit=crop",
          hover:
            "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop",
          price: 48,
          color: "Black",
          sizes: ["S", "M", "L", "XL"],
        },
        {
          name: "Studio Tank",
          type: "Tees",
          image:
            "https://images.unsplash.com/photo-1542296332-2e4473faf563?q=80&w=800&auto=format&fit=crop",
          hover:
            "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800&auto=format&fit=crop",
          price: 44,
          color: "White",
          sizes: ["XS", "S", "M", "L", "XL"],
        },
        {
          name: "City Hoodie",
          type: "Hoodies",
          image:
            "https://images.unsplash.com/photo-1547949003-9792a18a2601?q=80&w=800&auto=format&fit=crop",
          hover:
            "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=800&auto=format&fit=crop",
          price: 98,
          color: "Gray",
          sizes: ["XS", "S", "M", "L", "XL"],
        },
        {
          name: "Everyday Cap",
          type: "Accessories",
          image:
            "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop",
          hover:
            "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?q=80&w=800&auto=format&fit=crop",
          price: 28,
          color: "Black",
          sizes: [],
        },
      ];

      const typeCounts = {};
      const allProducts = Array.from({ length: 50 }).map((_, i) => {
        const b = base[i % base.length];
        const t = b.type;
        const n = (typeCounts[t] = (typeCounts[t] || 0) + 1);
        const name = `${t} ${n}`;
        const date = new Date(2025, 0, 1 + i); // staggered
        const pop = (i * 7) % 50; // pseudo popularity
        const priceVar = b.price + ((i % 5) - 2) * 2; // slight variance
        return {
          id: i + 1,
          name,
          type: b.type,
          collection: "Best Sellers",
          image: b.image,
          hover: b.hover,
          price: Math.max(10, priceVar),
          color: ["Black", "White", "Gray", "Blue", "Green"][i % 5],
          sizes: b.sizes.length ? b.sizes : ["OS"],
          available: true,
          date,
          pop,
          index: i,
        };
      });

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
        gridEl.style.columnGap =
          viewMode === "1" ? "0px" : gridEl.style.columnGap || "16px";
        const wraps = gridEl.querySelectorAll(".img-wrap");
        wraps.forEach((w) => {
          w.style.aspectRatio = viewMode === "1" ? "1 / 1" : "1 / 1.7";
        });
        // Ensure items layout changes visibly even if external CSS interferes
        const items = gridEl.querySelectorAll(
          "article.card, .grid.products > *"
        );
        items.forEach((it) => {
          it.style.gridColumn = viewMode === "1" ? "1 / -1" : "auto";
        });
      }
      // Expose for UI buttons
      window.__setCollectionView = function (mode) {
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
            <a href="product.html" class="img-wrap" style="position:relative; display:block; aspect-ratio:1 / 1.7; overflow:hidden" onmouseenter="var a=this.querySelector('.alt'); if(a){a.style.opacity='1'}" onmouseleave="var a=this.querySelector('.alt'); if(a){a.style.opacity='0'}">
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

      // Initial render
      apply();

      // View toggle (2x2 vs 1x1)
      (function () {
        const v4 = document.getElementById("view-4");
        const v1 = document.getElementById("view-1");
        if (!v4 || !v1) return;
        const reflect = (m) => {
          v4.setAttribute("aria-pressed", m === "4" ? "true" : "false");
          v1.setAttribute("aria-pressed", m === "1" ? "true" : "false");
          v4.style.color = m === "4" ? "#111" : "#d9d9d9";
          v1.style.color = m === "1" ? "#111" : "#d9d9d9";
        };
        v4.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (window.__setCollectionView) window.__setCollectionView("4");
          reflect("4");
        });
        v1.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (window.__setCollectionView) window.__setCollectionView("1");
          reflect("1");
        });
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
        const span = ann.querySelector("#countdown");
        ann.innerHTML = `Free shipping over $75 • Launch in <span id="countdown">${
          span ? span.textContent : "00:00:00"
        }</span>`;
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
        ["Tops", "collection.html?category=tees"],
        ["Hoodies", "collection.html?category=hoodies"],
        ["Bottoms", "collection.html?category=pants"],
        ["Accessories", "collection.html?category=accessories"],
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
        drawer.style.width = "100%";
        drawer.style.maxWidth = "none";
        drawer.style.boxShadow = "-12px 0 40px rgba(0,0,0,.18)";
        drawer.style.borderLeft = "0";
        drawer.style.transition =
          "transform .35s cubic-bezier(.2,.8,.2,1), box-shadow .35s";
        drawer.style.background = "#fff";
        drawer.style.display = "flex";
        drawer.style.flexDirection = "column";

        const header = drawer.querySelector(":scope > div");
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
          header?.nextElementSibling?.nextElementSibling ||
          drawer.querySelector(":scope > div:last-child");
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
              '<div style="font-weight:700; font-size:13px; margin-bottom:8px;">Discount code</div>' +
              '<div style="display:flex; gap:8px; margin-bottom:12px;">' +
              '<input id="discount-input" type="text" placeholder="Enter discount code" style="flex:1; padding:10px 12px; border:1px solid #dcdcdc; border-radius:6px; font-size:14px;" />' +
              '<button id="discount-apply" style="padding:10px 14px; border-radius:6px; border:1px solid #dcdcdc; background:#eee; font-weight:600; cursor:pointer;">Apply</button>' +
              "</div>" +
              '<div style="height:1px; background:#e5e5e5; margin:12px 0;"></div>' +
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
      updateCartCount(items);
      renderCart(items);
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
      $$("#cart-count").forEach((el) => (el.textContent = String(count)));
    }

    function renderCart(items = getCart()) {
      const wrap = document.getElementById("cart-items");
      const sub = document.getElementById("cart-subtotal");
      if (!wrap || !sub) return;
      if (!items.length) {
        wrap.innerHTML =
          '<div style="text-align:center; color:#666; padding:24px 0;">Your cart is empty.</div>';
        sub.textContent = "$0.00";
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
      const taxRate = 0.1;
      const gst = total * taxRate;
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

  function setupAddToCart() {
    const btn = Array.from(document.querySelectorAll(".p-details .btn")).find(
      (b) => /add\s*to\s*cart/i.test(b.textContent || "")
    );
    if (!btn) return;
    btn.addEventListener("click", (e) => {
      // allow guard to run; if size not selected it will alert
      const selected = document.querySelector(
        '#size-grid .size[aria-pressed="true"]'
      );
      if (!selected) return; // guard will have alerted

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
      window.openCart && window.openCart();
    });
  }
})();
