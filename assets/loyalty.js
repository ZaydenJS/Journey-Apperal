// assets/loyalty.js
// Yotpo must load AFTER we inject the identification div.
const YOTPO_LOADER_SRC =
  "https://cdn-yotpo.com/ayCQoNgVgsMXREbYl_jUOQ/widget.js";
let yotpoLoaded = false;

async function ensureYotpoIdentity({ email, customerId }) {
  // Remove any stale identity
  document.querySelector("#swell-customer-identification")?.remove();

  // Get signed token from Netlify function
  const res = await fetch("/.netlify/functions/yotpo-token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Yotpo token fetch failed");
  const { token } = await res.json();

  // Inject hidden div BEFORE loading Yotpo
  const div = document.createElement("div");
  div.id = "swell-customer-identification";
  div.style.display = "none";
  div.setAttribute("data-authenticated", "true");
  div.setAttribute("data-email", email);
  div.setAttribute("data-id", String(customerId || ""));
  div.setAttribute("data-token", token);
  // Use append to avoid breaking CSS that relies on :first-child (e.g., header dropdowns)
  document.body.appendChild(div);

  // Load Yotpo widgets now that identity is present
  if (!yotpoLoaded) {
    const s = document.createElement("script");
    s.src = YOTPO_LOADER_SRC;
    s.async = true;
    s.onload = () => {
      yotpoLoaded = true;
    };
    document.body.appendChild(s);
  } else if (window.Yotpo?.refreshWidgets) {
    window.Yotpo.refreshWidgets();
  }
}

export async function mountYotpoWithShopifySession() {
  try {
    const email = localStorage.getItem("ja_email");
    const customerId = localStorage.getItem("ja_customer_id");
    if (email) {
      await ensureYotpoIdentity({ email, customerId });
    } else {
      document.querySelector("#swell-customer-identification")?.remove();
      // Optional: ensure guest state renders if Yotpo not yet loaded
      if (!yotpoLoaded) {
        const s = document.createElement("script");
        s.src = YOTPO_LOADER_SRC;
        s.async = true;
        s.onload = () => {
          yotpoLoaded = true;
        };
        document.body.appendChild(s);
      }
    }
  } catch (e) {
    console.warn("[YOTPO] mount failed", e);
  }
}

// Guard sticky bar clicks: if not logged in, route to Shopify login
document.addEventListener("click", (e) => {
  const el = e.target.closest(
    ".yotpo-sticky-rewards, .yotpo-widget-sticky-rewards"
  );
  if (!el) return;
  const email = localStorage.getItem("ja_email");
  if (!email) {
    e.preventDefault();
    window.location.href = "/account/login.html";
  }
});
