// main.js — Final Roo7z Version (with Currency Toggle ₨ / £, cart removed)
import { allProducts as hardcodedProducts } from "./products.js?v=20260404a";

// Auto-reload stale tabs (e.g., when a long-open tab is revisited after days)
const STALE_TAB_LAST_SEEN_KEY = "roo7z_last_seen_at";
const STALE_TAB_RELOAD_GUARD_KEY = "roo7z_stale_tab_reload_done";
const STALE_TAB_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours
const TAB_LAST_ACTIVE_AT_KEY = "roo7z_tab_last_active_at";
const TAB_RETURN_FORCE_SYNC_AFTER_MS = 2 * 60 * 60 * 1000; // 2 hours

function markTabSeenNow() {
  try {
    localStorage.setItem(STALE_TAB_LAST_SEEN_KEY, String(Date.now()));
  } catch (_err) {
    // Ignore storage access failures (private mode, restricted storage, etc.)
  }
}

function maybeReloadStaleTab() {
  const now = Date.now();
  let lastSeen = 0;
  let alreadyReloaded = false;

  try {
    lastSeen = Number(localStorage.getItem(STALE_TAB_LAST_SEEN_KEY) || 0);
    alreadyReloaded = sessionStorage.getItem(STALE_TAB_RELOAD_GUARD_KEY) === "1";
  } catch (_err) {
    markTabSeenNow();
    return;
  }

  if (lastSeen > 0 && now - lastSeen > STALE_TAB_MAX_AGE_MS && !alreadyReloaded) {
    try {
      sessionStorage.setItem(STALE_TAB_RELOAD_GUARD_KEY, "1");
      localStorage.setItem(STALE_TAB_LAST_SEEN_KEY, String(now));
    } catch (_err) {
      // Ignore and still attempt reload
    }
    window.location.reload();
    return;
  }

  if (alreadyReloaded) {
    try {
      sessionStorage.removeItem(STALE_TAB_RELOAD_GUARD_KEY);
    } catch (_err) {
      // Ignore storage access failures
    }
  }

  markTabSeenNow();
}

function markTabActiveNow() {
  try {
    sessionStorage.setItem(TAB_LAST_ACTIVE_AT_KEY, String(Date.now()));
  } catch (_err) {
    // Ignore storage access failures
  }
}

function shouldForceRefreshOnTabReturn() {
  const now = Date.now();
  let lastActive = 0;
  try {
    lastActive = Number(sessionStorage.getItem(TAB_LAST_ACTIVE_AT_KEY) || 0);
    sessionStorage.setItem(TAB_LAST_ACTIVE_AT_KEY, String(now));
  } catch (_err) {
    return false;
  }
  return lastActive > 0 && (now - lastActive) > TAB_RETURN_FORCE_SYNC_AFTER_MS;
}

maybeReloadStaleTab();
markTabActiveNow();
window.addEventListener("focus", maybeReloadStaleTab);
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    maybeReloadStaleTab();
  } else {
    markTabSeenNow();
    markTabActiveNow();
  }
});
window.addEventListener("pagehide", markTabSeenNow);

function normalizePagePath(path) {
  const clean = String(path || "").split("?")[0].split("#")[0].trim().toLowerCase();
  if (!clean || clean === "/") return "/index.html";
  return clean.startsWith("/") ? clean : `/${clean}`;
}

function setActiveNavLink() {
  const currentPath = normalizePagePath(window.location.pathname);
  const navLinks = document.querySelectorAll(".navbar-nav .nav-link[href]");
  if (!navLinks.length) return;

  navLinks.forEach((link) => {
    const href = link.getAttribute("href") || "";
    if (!href || href.startsWith("javascript:") || href.startsWith("#")) return;
    const linkPath = normalizePagePath(href);
    const isActive = linkPath === currentPath;

    link.classList.toggle("active", isActive);
    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

setActiveNavLink();

function disableInvalidScrollSpy() {
  const body = document.body;
  if (!body) return;
  if ((body.getAttribute("data-bs-spy") || "").toLowerCase() !== "scroll") return;

  const spyLinks = Array.from(document.querySelectorAll(".navbar .nav-link[href^='#']"));
  const hasValidTarget = spyLinks.some((link) => {
    const href = (link.getAttribute("href") || "").trim();
    if (!href || href === "#") return false;
    try {
      return Boolean(document.querySelector(href));
    } catch (_err) {
      return false;
    }
  });

  if (hasValidTarget) return;

  body.removeAttribute("data-bs-spy");
  body.removeAttribute("data-bs-target");
  body.removeAttribute("data-bs-offset");

  const ScrollSpyCtor = window.bootstrap?.ScrollSpy;
  const instance = ScrollSpyCtor?.getInstance?.(body);
  instance?.dispose?.();
}

disableInvalidScrollSpy();

// ✅ Navbar Scroll Background Fix
const nav = document.querySelector(".navigation-wrap");
window.addEventListener("scroll", function () {
  if (!nav) return;
  if (window.innerWidth <= 992) {
    nav.classList.remove("scroll-on");
    if (document.documentElement.scrollTop > 20) {
      nav.style.top = "0px";
    } else {
      nav.style.top = "var(--top-header-height)";
    }
    return;
  }
  if (document.documentElement.scrollTop > 20) {
    nav.classList.add("scroll-on");
  } else {
    nav.classList.remove("scroll-on");
  }
});

function initBackToTop() {
  const backToTopBtn = document.getElementById("backToTop");
  if (!backToTopBtn) return;

  const updateVisibility = () => {
    const shouldShow = (window.scrollY || document.documentElement.scrollTop || 0) > 520;
    backToTopBtn.classList.toggle("show", shouldShow);
  };

  backToTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  window.addEventListener("scroll", updateVisibility, { passive: true });
  updateVisibility();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initBackToTop, { once: true });
} else {
  initBackToTop();
}

// ✅ Slider
let currentSliderOffset = 0;

function getGallerySlideStep(slider) {
  const firstSlide = slider.querySelector(".slide");
  if (!firstSlide) return 0;

  const styles = window.getComputedStyle(slider);
  const gap = parseFloat(styles.columnGap || styles.gap || "0") || 0;
  return firstSlide.getBoundingClientRect().width + gap;
}

function syncGallerySliderOffset() {
  const slider = document.getElementById("slider");
  if (!slider) return;

  const viewportWidth = slider.parentElement?.clientWidth || 0;
  const maxOffset = Math.max(0, slider.scrollWidth - viewportWidth);
  const step = getGallerySlideStep(slider);
  if (step) {
    currentSliderOffset = Math.round(currentSliderOffset / step) * step;
  }
  currentSliderOffset = Math.min(currentSliderOffset, maxOffset);
  slider.style.transform = `translateX(-${currentSliderOffset}px)`;
}

function slide(direction) {
  const slider = document.getElementById("slider");
  if (!slider) return;
  const step = getGallerySlideStep(slider);
  if (!step) return;

  const viewportWidth = slider.parentElement?.clientWidth || 0;
  const maxOffset = Math.max(0, slider.scrollWidth - viewportWidth);

  if (direction === "left") {
    currentSliderOffset = Math.max(0, currentSliderOffset - step);
  } else {
    currentSliderOffset = Math.min(maxOffset, currentSliderOffset + step);
  }

  slider.style.transform = `translateX(-${currentSliderOffset}px)`;
}

// Expose for inline onclick handlers
window.slide = slide;
window.addEventListener("resize", syncGallerySliderOffset, { passive: true });

window.jewelrifyShowcaseScroll = function jewelrifyShowcaseScroll(direction) {
  const track = document.getElementById("jewelrify-showcase-track");
  if (!track) return;

  const firstCard = track.querySelector(".showcase-card");
  const styles = window.getComputedStyle(track);
  const gap = parseFloat(styles.columnGap || styles.gap || "0") || 0;
  const step = firstCard ? firstCard.getBoundingClientRect().width + gap : 320;

  track.scrollBy({
    left: direction * step,
    behavior: "smooth"
  });
};

// Scroll restore for product list pages
const restoreScrollPath = sessionStorage.getItem("roo7z_scroll_restore_path");
const restoreScrollY = Number(sessionStorage.getItem("roo7z_scroll_restore") || 0);
let pendingScrollRestore = restoreScrollPath && restoreScrollPath === window.location.pathname ? restoreScrollY : 0;

function restoreScrollIfNeeded() {
  if (!pendingScrollRestore) return;
  const y = pendingScrollRestore;
  pendingScrollRestore = 0;
  sessionStorage.removeItem("roo7z_scroll_restore");
  sessionStorage.removeItem("roo7z_scroll_restore_path");
  requestAnimationFrame(() => window.scrollTo(0, y));
}

window.goToProduct = function goToProduct(id, category) {
  sessionStorage.setItem("roo7z_scroll_restore", String(window.scrollY || 0));
  sessionStorage.setItem("roo7z_scroll_restore_path", window.location.pathname);
  window.location.assign(`product-preview.html?id=${id}&category=${category}`);
};

// ===== PRODUCT SECTION =====
const productSection = document.querySelector(".product-section");
const pageName = productSection?.dataset.page?.toLowerCase() || "";
const productList = document.getElementById("product-list");
const filterBtns = document.querySelectorAll(".filter-btn");
const isFeaturesPage = pageName === "features";
const isJewelrifyPage = pageName === "jewelery";

const PRODUCTS_PER_PAGE = 24;
const FEATURES_INITIAL_PRODUCTS = 15;
const AUTO_NEW_PRODUCTS_LIMIT = 10;
let allProducts = {}; // Will be loaded from Firestore
let currentProducts = [];
let currentPage = 1;
let currentFilter = "all";
let productsLoadPromise = null;
let lastProductsNetworkFetchAt = 0;
let lastProductsVisibilityRefreshAt = 0;
const PRODUCTS_CACHE_KEY = "roo7z_products_cache_v12";
const PRODUCTS_CACHE_TTL_MS = 30 * 60 * 1000;
const PRODUCTS_VISIBLE_REFRESH_MIN_INTERVAL_MS = 45 * 1000;

function resolveCacheStorage() {
  try {
    const testKey = "__roo7z_cache_test__";
    localStorage.setItem(testKey, "1");
    localStorage.removeItem(testKey);
    return localStorage;
  } catch (_e) {
    return sessionStorage;
  }
}

const productsCacheStorage = resolveCacheStorage();

function normalizeCategory(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/-/g, "");
}

function getProductCategoryKeys(product) {
  const raw = [];

  if (Array.isArray(product?.categories)) {
    raw.push(...product.categories);
  }
  if (product?.categoryName) raw.push(product.categoryName);
  if (product?.category) raw.push(product.category);

  const normalized = raw
    .map((value) => normalizeCategory(value))
    .filter(Boolean);

  return [...new Set(normalized)];
}

function getProductCategoryKey(product) {
  return getProductCategoryKeys(product)[0] || "";
}

function isJewelryCategory(cat) {
  const key = normalizeCategory(cat);
  return [
    "pendants",
    "rings",
    "bracelets",
    "earrings",
    "oxidize",
    "oxidizingjewels",
    "sets",
    "deals"
  ].includes(key);
}

function dedupeById(arr) {
  const seen = new Set();
  const dedupedFromEnd = [];

  // Keep the most recent occurrence when duplicate ids/titles exist.
  for (let i = arr.length - 1; i >= 0; i -= 1) {
    const p = arr[i];
    const idKey = String(p?.id ?? "").trim().toLowerCase();
    const titleKey = normalizeTitle(p?.title);
    const imageKey = String(p?.img || p?.imageUrl || p?.image || "").trim().toLowerCase();
    const key = idKey || `${titleKey}__${imageKey}`;
    if (!key || seen.has(key)) continue;
    seen.add(key);
    dedupedFromEnd.push(p);
  }

  return dedupedFromEnd.reverse();
}

function normalizeProductsShape(source) {
  const data = (source && typeof source === "object") ? source : {};
  const jewelery = Array.isArray(data.jewelery) ? data.jewelery : [];
  const features = Array.isArray(data.features) ? data.features : [];

  const normalizedJewelery = dedupeById(jewelery);
  const normalizedFeatures = dedupeById(features.length ? features : normalizedJewelery);

  return {
    jewelery: normalizedJewelery,
    features: normalizedFeatures
  };
}

function getProductIdentityKey(product) {
  const idKey = String(product?.id ?? "").trim();
  if (idKey) return `id:${idKey}`;
  const titleKey = normalizeTitle(product?.title);
  const imageKey = String(getFirstImageCandidate(product) || "").trim().toLowerCase();
  if (!titleKey && !imageKey) return "";
  return `fallback:${titleKey}__${imageKey}`;
}

function applyAutomaticNewFlags(productsShape) {
  const normalized = normalizeProductsShape(productsShape);
  const sourceList = Array.isArray(normalized.jewelery) ? normalized.jewelery : [];

  // NEW badge rule (exact): only the last 10 entries from products.js seed order.
  const latestKeys = new Set(
    sourceList
      .map((item, index) => ({ item, index, seedOrder: Number(item?.__seedOrder) }))
      .filter(({ seedOrder }) => Number.isFinite(seedOrder))
      .sort((a, b) => {
        if (a.seedOrder !== b.seedOrder) return b.seedOrder - a.seedOrder;
        return b.index - a.index;
      })
      .slice(0, AUTO_NEW_PRODUCTS_LIMIT)
      .map(({ item }) => getProductIdentityKey(item))
      .filter(Boolean)
  );

  const markList = (list) =>
    list.map((item) => ({
      ...item,
      isNew: latestKeys.has(getProductIdentityKey(item))
    }));

  return {
    jewelery: markList(normalized.jewelery),
    features: markList(normalized.features)
  };
}

function normalizeTitle(value) {
  return String(value || "").trim().toLowerCase();
}

function isFallbackLikeImage(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized) return true;
  return normalized.includes("roo7z-logo") || normalized.includes("placeholder");
}

function getFirstImageCandidate(product) {
  if (!product || typeof product !== "object") return "";
  const direct = [product.img, product.imageUrl, product.image];
  for (const value of direct) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  if (Array.isArray(product.images)) {
    const firstGallery = product.images.find((value) => typeof value === "string" && value.trim());
    if (firstGallery) return firstGallery.trim();
  }
  return "";
}

function getProductImage(product) {
  const selected = getFirstImageCandidate(product);
  return selected || "images/roo7z-logo.png";
}

function compareProductsForDisplay(a, b) {
  const aTime = getProductSortTime(a);
  const bTime = getProductSortTime(b);
  if (aTime !== bTime) return aTime - bTime;

  const aTitle = String(a?.title || "");
  const bTitle = String(b?.title || "");
  return aTitle.localeCompare(bTitle);
}

function sortNewProductsFirst(products) {
  const list = Array.isArray(products) ? [...products] : [];
  if (list.length <= 1) return list;

  // Listing rule (exact):
  // 1) products.js seeded entries first by seed order (last in file appears first)
  // 2) non-seeded entries after that (createdAt, then fallback index)
  return list
    .map((item, index) => ({ item, index, recency: getProductRecency(item, index) }))
    .sort((a, b) => {
      if (a.recency.bucket !== b.recency.bucket) return b.recency.bucket - a.recency.bucket;
      if (a.recency.value !== b.recency.value) return b.recency.value - a.recency.value;
      return b.index - a.index;
    })
    .map(({ item }) => item);
}

function buildProductsFromList(list, seedProducts = {}) {
  const normalizedSeed = normalizeProductsShape(seedProducts);
  const activeFirestore = list.filter((product) => product && !product.deleted);

  const byId = new Map();
  const byTitle = new Map();
  activeFirestore.forEach((product) => {
    const idKey = String(product?.id ?? "").trim();
    const titleKey = normalizeTitle(product?.title);
    if (idKey) byId.set(idKey, product);
    if (titleKey) byTitle.set(titleKey, product);
  });

  const mergeSeedList = (seedList) => {
    const merged = [];
    const usedIds = new Set();
    const usedTitles = new Set();

    seedList.forEach((seedItem, seedIndex) => {
      const idKey = String(seedItem?.id ?? "").trim();
      const titleKey = normalizeTitle(seedItem?.title);
      const idMatch = byId.get(idKey);
      const titleMatch = idMatch ? null : byTitle.get(titleKey);
      const match = idMatch || titleMatch;
      // Source-of-truth for seeded items: code (products.js) should win over Firestore fields.
      const resolved = match ? { ...match, ...seedItem } : seedItem;
      if (!idMatch && titleMatch && idKey) {
        // Keep canonical seed id when falling back to title-based merge.
        resolved.id = seedItem.id;
      }
      if (match) {
        // Keep inventory from dashboard unless explicitly set in code.
        const hasSeedStock = seedItem?.stock !== undefined && seedItem?.stock !== null && String(seedItem.stock).trim() !== "";
        if (!hasSeedStock) {
          resolved.stock = Number(match?.stock) || 10;
        }
        // Seeded products should stay active even if an old dashboard record was soft-deleted.
        resolved.deleted = false;
        // Keep NEW badge unless Firestore explicitly sets true/false.
        resolved.isNew = typeof seedItem.isNew === "boolean"
          ? seedItem.isNew
          : (typeof match.isNew === "boolean" ? match.isNew : false);
        // For seeded products, keep media strictly from code to avoid title/image mixups.
        const seedPrimaryImage = getFirstImageCandidate(seedItem);
        if (seedPrimaryImage) {
          resolved.img = seedPrimaryImage;
        }
        if (Array.isArray(seedItem.images) && seedItem.images.length > 0) {
          resolved.images = seedItem.images;
        }
      }
      resolved.__seedOrder = seedIndex;
      if (resolved?.deleted) return;
      const resolvedId = String(resolved?.id ?? "").trim();
      const resolvedTitle = normalizeTitle(resolved?.title);
      if (resolvedId) usedIds.add(resolvedId);
      if (resolvedTitle) usedTitles.add(resolvedTitle);
      merged.push(resolved);
    });

    const extras = activeFirestore
      .filter((p) => {
        const idKey = String(p?.id ?? "").trim();
        const titleKey = normalizeTitle(p?.title);
        if (idKey && usedIds.has(idKey)) return false;
        if (titleKey && usedTitles.has(titleKey)) return false;
        return true;
      })
      .sort(compareProductsForDisplay);

    return dedupeById([...merged, ...extras]);
  };

  const jewelery = mergeSeedList(normalizedSeed.jewelery);
  const features = mergeSeedList(normalizedSeed.features.length ? normalizedSeed.features : jewelery);

  return { jewelery, features };
}

function getProductSortTime(product) {
  const createdAt = product?.createdAt;
  if (!createdAt) return parseInt(product?.id, 10) || 0;
  if (typeof createdAt.toMillis === "function") return createdAt.toMillis();
  if (typeof createdAt === "number") return createdAt;
  if (typeof createdAt?.seconds === "number") return createdAt.seconds * 1000;
  const parsed = Date.parse(createdAt);
  return Number.isNaN(parsed) ? (parseInt(product?.id, 10) || 0) : parsed;
}

function hasProductCreatedAt(product) {
  const createdAt = product?.createdAt;
  if (!createdAt) return false;
  if (typeof createdAt.toMillis === "function") return true;
  if (typeof createdAt === "number") return Number.isFinite(createdAt);
  if (typeof createdAt?.seconds === "number") return true;
  if (typeof createdAt === "string") return !Number.isNaN(Date.parse(createdAt));
  return false;
}

function getProductRecency(product, fallbackIndex = 0) {
  const seedOrder = Number(product?.__seedOrder);
  if (Number.isFinite(seedOrder)) {
    return { bucket: 3, value: seedOrder };
  }
  if (hasProductCreatedAt(product)) {
    return { bucket: 2, value: getProductSortTime(product) };
  }
  return { bucket: 1, value: Number(fallbackIndex) || 0 };
}

function saveProductsToCache(products) {
  try {
    const autoNewProducts = applyAutomaticNewFlags(products);
    productsCacheStorage.setItem(
      PRODUCTS_CACHE_KEY,
      JSON.stringify({
        timestamp: Date.now(),
        products: autoNewProducts
      })
    );
  } catch (e) {
    console.warn("Unable to cache products:", e);
  }
}

function readProductsFromCache() {
  try {
    const raw = productsCacheStorage.getItem(PRODUCTS_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    if (Date.now() - Number(parsed.timestamp || 0) > PRODUCTS_CACHE_TTL_MS) return null;
    const normalized = normalizeProductsShape(parsed.products);
    if (!normalized.jewelery.length && !normalized.features.length) return null;
    return normalized;
  } catch (e) {
    console.warn("Unable to read products cache:", e);
    return null;
  }
}

function commitProducts(products) {
  allProducts = applyAutomaticNewFlags(products);
  window.allProducts = allProducts;
  window.dispatchEvent(new Event("productsLoaded"));
  renderProducts();
}

// Show loading state initially
if (productList) {
  productList.innerHTML = "<p>Loading products...</p>";
}

// ===== CURRENCY SYSTEM (AUTO-DETECTED) =====
const LS_CURRENCY = "roo7z_currency";
let currentCurrency = localStorage.getItem(LS_CURRENCY) || "PKR";

function getCurrencySymbol() {
  return currentCurrency === "PKR" ? "₨" : "£";
}

// Listen for currency detection
window.addEventListener("currencyDetected", (e) => {
  const newCurrency = e.detail.currency;
  if (newCurrency !== currentCurrency) {
    currentCurrency = newCurrency;
    console.log("💱 Currency updated to:", currentCurrency);
    updateShippingText();
    renderProducts(); // Re-render with new currency
  }
});

// Allow manual currency override via localStorage for testing
// Open browser console and run: localStorage.setItem("roo7z_currency", "GBP"); location.reload();
// Or: localStorage.setItem("roo7z_currency", "PKR"); location.reload();

// Update shipping text based on currency
function updateShippingText() {
  const shippingEl = document.getElementById("shippingText");
  if (shippingEl) {
    if (currentCurrency === "PKR") {
      shippingEl.textContent = " Free Shipping for Order over 3000-RS";
    } else {
      shippingEl.textContent = " Free Shipping for Order over £55";
    }
  }

  document.querySelectorAll(".footer-delivery-text").forEach((el) => {
    if (currentCurrency === "PKR") {
      el.textContent = "On all orders above PKR 3000";
    } else {
      el.textContent = "On all orders above £55";
    }
  });
}

// Run on page load
document.addEventListener("DOMContentLoaded", updateShippingText);
// Also run immediately in case page is already loaded
updateShippingText();

// ===== Load Products from Firestore =====
async function loadProductsFromFirestore(options = {}) {
  if (!productList || !pageName) return;
  if (productsLoadPromise) return productsLoadPromise;
  const useCachedFirst = options.useCachedFirst !== false;

  productsLoadPromise = (async () => {
    let renderedFastFallback = false;
    if (useCachedFirst) {
      const cachedProducts = readProductsFromCache();
      if (cachedProducts) {
        commitProducts(cachedProducts);
        renderedFastFallback = true;
      } else {
        commitProducts(normalizeProductsShape(hardcodedProducts));
        renderedFastFallback = true;
      }
    }

    try {
      const { db, collection, getDocs, query, orderBy } = await import("./firebase.js");
      const productsRef = collection(db, "products");
      let querySnapshot;
      try {
        querySnapshot = await getDocs(query(productsRef, orderBy("createdAt", "asc")));
      } catch (orderedQueryError) {
        console.warn("Ordered product query failed, using default query:", orderedQueryError);
        querySnapshot = await getDocs(productsRef);
      }
      const firestoreProducts = [];
      querySnapshot.forEach((entry) => {
        const data = entry.data();
        const img = getProductImage(data);
        const images = Array.isArray(data?.images) && data.images.length
          ? data.images
          : [img];
        firestoreProducts.push({
          ...data,
          id: (data && data.id != null) ? data.id : entry.id,
          img,
          images
        });
      });

      const mergedProducts = buildProductsFromList(firestoreProducts, hardcodedProducts);
      saveProductsToCache(mergedProducts);
      commitProducts(mergedProducts);
      lastProductsNetworkFetchAt = Date.now();
      console.log("Products loaded from Firestore:", mergedProducts);
    } catch (error) {
      console.error("Error loading products from Firestore:", error);
      if (!renderedFastFallback || !allProducts?.[pageName]?.length) {
        commitProducts(normalizeProductsShape(hardcodedProducts));
      }
    }
  })().finally(() => {
    productsLoadPromise = null;
  });

  return productsLoadPromise;
}

function maybeRefreshProductsOnReturn() {
  if (!productList || !pageName) return;
  if (document.visibilityState !== "visible") return;

  const now = Date.now();
  const throttled = now - lastProductsVisibilityRefreshAt < PRODUCTS_VISIBLE_REFRESH_MIN_INTERVAL_MS;

  if (throttled) return;
  lastProductsVisibilityRefreshAt = now;
  // Always fetch fresh products when user returns to the tab.
  loadProductsFromFirestore({ useCachedFirst: false });
}

// ===== Render Products =====
function renderProducts(category = "all") {
  if (!allProducts[pageName] || allProducts[pageName].length === 0) {
    if (productList) {
      productList.innerHTML = "<p>No products found for this page.</p>";
    }
    return;
  }

  currentFilter = category || "all";
  currentPage = 1;
  let productsToShow = allProducts[pageName];

  // FIX: Normalize text before comparing
  if (category !== "all") {
    const targetCategory = normalizeCategory(category);
    productsToShow = productsToShow.filter((p) => {
      const keys = getProductCategoryKeys(p);
      return keys.includes(targetCategory);
    });
  }

  // Jewelery page should only show jewelry categories on "all"
  if (pageName === "jewelery" && currentFilter === "all") {
    productsToShow = productsToShow.filter((p) => {
      const keys = getProductCategoryKeys(p);
      // Keep legacy ID-based records visible instead of hiding newly added admin products.
      const hasLegacyIdLikeCategory = keys.some((key) => /^[a-z0-9]{10,}$/i.test(key));
      if (!keys.length) return true;
      return keys.some((key) => isJewelryCategory(key)) || hasLegacyIdLikeCategory;
    });
  }

  productsToShow = sortNewProductsFirst(productsToShow);
  currentProducts = productsToShow;
  renderProductCards(productsToShow, pageName);
}


function renderProductCards(products, pageName = "") {
  if (!productList) return;
  if (!products || products.length === 0) {
    productList.innerHTML = "<p>No products found.</p>";
    renderLoadMoreButton(false);
    return;
  }

  const symbol = getCurrencySymbol();
  const visibleCount = isFeaturesPage
    ? (currentPage > 1 ? products.length : FEATURES_INITIAL_PRODUCTS)
    : PRODUCTS_PER_PAGE * currentPage;
  const visibleProducts = products.slice(0, visibleCount);

productList.innerHTML = visibleProducts
  .map((p) => {
    const hasDiscount = p.discount && Number(p.discount) > 0;
    const hasNewBadge = Boolean(p.isNew);
    const imgSrc = getProductImage(p);
    const needsTightFit =
      Number(p.id) === 236 || /4\s*qul/i.test(String(p.title || ""));
    const rawStock = p?.stock;
    const hasExplicitStock = rawStock !== undefined && rawStock !== null && String(rawStock).trim() !== "";
    const stockCount = Number(rawStock);
    const isSoldOut = hasExplicitStock && (!Number.isFinite(stockCount) || stockCount <= 0);

    let basePrice = currentCurrency === "PKR" ? p.pricePKR : p.priceGBP;
    if (!basePrice) basePrice = 0;

    const discountedPrice = hasDiscount ? Math.round(basePrice) : basePrice;

    return `
  <div class="product-card"
    onclick="if(event.target.tagName !== 'BUTTON'){
      if (event.target.closest && event.target.closest('.cart-btn')) return;
      const btn = this.querySelector('.cart-btn');
      const id = btn.dataset.id;
      const category = '${pageName}';
      window.goToProduct(id, category);
    }">
      <div class="product-img-wrapper">
        ${hasNewBadge ? `<span class="new-badge">NEW</span>` : ""}
        ${hasDiscount ? `<span class="discount-badge">-${p.discount}%</span>` : ""}
        ${isSoldOut ? `<span class="soldout-badge">Sold Out</span>` : ""}
        <img src="${imgSrc}" alt="${p.title || ''}" class="product-img${needsTightFit ? " tight-fit" : ""}" loading="lazy" onerror="this.onerror=null;this.src='images/roo7z-logo.png';" />
      </div>
      <h3 class="product-title">${p.title || ""}</h3>
      <div class="price-cart">
        <span class="new-price">${symbol} ${discountedPrice}</span>
        <button class="cart-btn add-to-cart"
          data-add-to-cart="true"
          data-id="${p.id}"
          data-title="${p.title || ''}"
          data-pricepkr="${p.pricePKR || 0}"
          data-pricegbp="${p.priceGBP || 0}"
          data-img="${imgSrc}"
          data-stock="${hasExplicitStock ? String(stockCount) : ""}"
          ${isSoldOut ? "disabled" : ""}
          aria-label="${isSoldOut ? "Sold out" : "Add to cart"}">${isSoldOut ? "Sold out" : '<i class="fas fa-shopping-cart" aria-hidden="true"></i>'}</button>
      </div>
    </div>`;
  })
  .join("");

  restoreScrollIfNeeded();
  renderLoadMoreButton(products.length > visibleCount);
}

function renderLoadMoreButton(show) {
  if (!productList) return;
  let loadMore = document.getElementById("product-load-more");
  if (!loadMore) {
    loadMore = document.createElement("div");
    loadMore.id = "product-load-more";
    loadMore.style.textAlign = "center";
    loadMore.style.margin = "20px 0 40px";
    loadMore.innerHTML = `<button id="loadMoreBtn" class="main-btn">${isFeaturesPage ? "Show All" : "Load more"}</button>`;
    productList.insertAdjacentElement("afterend", loadMore);
    const btn = loadMore.querySelector("#loadMoreBtn");
    if (btn) {
      btn.addEventListener("click", () => {
        if (isFeaturesPage) {
          window.location.href = "jewelrify.html";
          return;
        }
        currentPage += 1;
        renderProductCards(currentProducts, pageName);
      });
    }
  }
  const btn = loadMore.querySelector("#loadMoreBtn");
  if (btn) {
    btn.textContent = isFeaturesPage ? "Show All" : "Load more";
  }
  loadMore.style.display = show ? "block" : "none";
}

// ===== Search =====
function getAllProductsForSearch() {
  let all = [];
  Object.keys(allProducts || {}).forEach((page) => {
    if (Array.isArray(allProducts[page])) {
      all = all.concat(allProducts[page]);
    }
  });
  if (!all.length) {
    const seed = normalizeProductsShape(hardcodedProducts);
    all = [...seed.jewelery, ...seed.features];
  }
  return dedupeById(all);
}

function getSearchResults(term) {
  const normalizedTerm = String(term || "").trim().toLowerCase();
  if (!normalizedTerm) return [];

  const all = getAllProductsForSearch();
  const searchSynonyms = {
    pendant: ["pendants", "necklace", "chain", "pendent", "locket", "pendents"],
    bracelet: ["bracelets", "kara", "bangle", "hand cuff", "baraclet"],
    ring: ["rings", "anguthi", "band", "chala"],
    earring: ["earrings", "bali", "jhumka", "tops"],
    anklet: ["anklets", "payal"],
    set: ["sets", "jewelry set", "combo"],
    necklace: ["necklaces", "chain", "pendant", "locket"],
    shirt: ["shirts", "t-shirt", "top", "tee"],
    hoodies: ["hoodie", "sweatshirt", "sweater"],
    tshirt: ["tshirts", "tee", "top"],
    oxidize: ["oxidize", "oxidized", "oxidising", "oxidizing"],
  };

  let searchTerms = [normalizedTerm];
  Object.keys(searchSynonyms).forEach((key) => {
    if (key.includes(normalizedTerm) || searchSynonyms[key].some((s) => s.includes(normalizedTerm))) {
      searchTerms = searchTerms.concat([key, ...searchSynonyms[key]]);
    }
  });

  return all.filter((p) =>
    searchTerms.some(
      (t) =>
        (p.title && p.title.toLowerCase().includes(t)) ||
        getProductCategoryKeys(p).some((key) => key.includes(normalizeCategory(t)))
    )
  );
}

function applySearchTerm(term) {
  const normalizedTerm = String(term || "").trim().toLowerCase();
  if (!normalizedTerm) {
    if (productList && pageName) {
      renderProducts("all");
    }
    return;
  }

  if (!productList || !pageName) {
    const target = `jewelrify.html?search=${encodeURIComponent(normalizedTerm)}`;
    window.location.assign(target);
    return;
  }

  const results = getSearchResults(normalizedTerm);
  renderProductCards(sortNewProductsFirst(results), "search");
}

function applySearchFromQuery() {
  if (!productList || !pageName) return;
  const params = new URLSearchParams(window.location.search);
  const term = (params.get("search") || "").trim();
  if (!term) return;
  applySearchTerm(term);
}

document.addEventListener("DOMContentLoaded", () => {
  const searchForm = document.getElementById("search-form");
  const searchInput = document.getElementById("search-input");

  if (!searchInput || !searchForm) return;

  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const term = String(searchInput.value || "").trim();
    if (!term) {
      if (productList && pageName) renderProducts("all");
      return;
    }

    if (!isJewelrifyPage) {
      window.location.assign(`jewelrify.html?search=${encodeURIComponent(term)}`);
      return;
    }

    applySearchTerm(term);
  });

  searchInput.addEventListener("input", (e) => {
    const term = e.target.value;
    if (!term.trim()) {
      if (productList && pageName) renderProducts("all");
      return;
    }
    if (productList && pageName) {
      applySearchTerm(term);
    }
  });
});

// ===== Filters =====
if (filterBtns && filterBtns.length) {
  filterBtns.forEach((btn) => {
    if (!btn) return;
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      renderProducts(btn.dataset.filter.toLowerCase());
    });
  });
}

function applyFilterFromHash() {
  if (!filterBtns || !filterBtns.length) return;
  const hash = (window.location.hash || "").replace("#", "").trim().toLowerCase();
  if (!hash) return;
  const targetBtn = Array.from(filterBtns).find(
    (b) => (b.dataset.filter || "").toLowerCase() === hash
  );
  if (targetBtn) {
    targetBtn.click();
    const bar = document.querySelector(".filter-bar");
    if (bar) {
      bar.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }
}

document.addEventListener("DOMContentLoaded", applyFilterFromHash);
window.addEventListener("hashchange", applyFilterFromHash);
window.addEventListener("productsLoaded", () => {
  // Ensure filter applies after products are loaded/rendered
  setTimeout(applyFilterFromHash, 0);
  setTimeout(applySearchFromQuery, 0);
});

window.addEventListener("focus", () => {
  maybeRefreshProductsOnReturn();
});

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    maybeRefreshProductsOnReturn();
  }
});

// Load products from Firestore on page load
if (productList && pageName) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      loadProductsFromFirestore();
    });
  } else {
    loadProductsFromFirestore();
  }
}






// === Handle Add to Cart Button Clicks (use universal cart) ===
document.addEventListener("click", (e) => {
  const btn = e.target.closest?.("[data-add-to-cart]");
  if (!btn) return;
  if (btn.hasAttribute("disabled")) return;

  const stockValue = btn.dataset.stock;
  if (stockValue !== undefined && stockValue !== "") {
    const stockCount = Number(stockValue);
    if (!Number.isFinite(stockCount) || stockCount <= 0) return;
  }

  const cartItem = {
    id: btn.dataset.id,
    title: btn.dataset.title,
    img: btn.dataset.img,
    qty: 1,
    pricePKR: Number(btn.dataset.pricepkr) || 0,
    priceGBP: Number(btn.dataset.pricegbp) || 0
  };

  // Dispatch a custom event to universal cart
  const event = new CustomEvent("universal-add-to-cart", { detail: cartItem });
  document.dispatchEvent(event);
});
