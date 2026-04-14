// js/cart-login.js
// Universal cart + login integration (Firebase connected)

import {
  auth,
  db,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  doc,
  setDoc,
  serverTimestamp,
  onAuthStateChanged,
  addDoc,
  collection,
  GoogleAuthProvider,
  signInWithPopup,
  getRedirectResult,
  setPersistence,
  browserSessionPersistence,
  sendPasswordResetEmail

} from "./firebase.js";

// === LocalStorage key (cart only) ===
const LS_CART = "roo7z_cart";
const LS_GUEST = "roo7z_guest";
const LS_GUEST_ID = "roo7z_guest_id";
const LS_LAST_VISIT_AT = "roo7z_last_visit_at";
const AUTO_RELOAD_AFTER_MS = 24 * 60 * 60 * 1000; // 24 hours
const AUTO_RELOAD_PARAM = "roo_refresh";

let cart = [];
let currentUser = null;
let pendingCheckout = false;
let deliveryDetails = null; // Store delivery details for order processing
let lastSyncedCount = -1;
let checkoutSubmitLocked = false;
let orderSubmissionInFlight = false;
let isGuest = localStorage.getItem(LS_GUEST) === "1";
let guestId = localStorage.getItem(LS_GUEST_ID) || null;
const REDIRECT_FLAG = "roo7z_google_redirect";
const PROFILE_REDIRECT_FLAG = "roo7z_profile_redirect";

function maybeAutoReloadOnStaleVisit() {
  try {
    const now = Date.now();
    const lastVisit = Number(localStorage.getItem(LS_LAST_VISIT_AT) || 0);
    const currentUrl = new URL(window.location.href);
    const hasRefreshMarker = currentUrl.searchParams.get(AUTO_RELOAD_PARAM) === "1";

    if (hasRefreshMarker) {
      currentUrl.searchParams.delete(AUTO_RELOAD_PARAM);
      window.history.replaceState({}, "", currentUrl.toString());
      localStorage.setItem(LS_LAST_VISIT_AT, String(now));
      return;
    }

    const shouldRefresh = lastVisit > 0 && (now - lastVisit) >= AUTO_RELOAD_AFTER_MS;
    localStorage.setItem(LS_LAST_VISIT_AT, String(now));

    if (!shouldRefresh) return;

    currentUrl.searchParams.set(AUTO_RELOAD_PARAM, "1");
    window.location.replace(currentUrl.toString());
  } catch {
    localStorage.setItem(LS_LAST_VISIT_AT, String(Date.now()));
  }
}

maybeAutoReloadOnStaleVisit();

// Delivery rules
const DELIVERY_FEE_LAHORE_PKR = 200; // PKR (Lahore)
const DELIVERY_FEE_OTHER_PKR = 250; // PKR (other cities)
const DELIVERY_FEE_GBP = 2.99; // GBP
const FREE_THRESHOLD_PKR = 3000; // PKR - free delivery for subtotal >= this
const FREE_THRESHOLD_GBP = 55; // GBP - free delivery for subtotal >= this

function normalizeCityName(value) {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function isLahoreCity(city) {
  const normalized = normalizeCityName(city);
  return normalized === "lahore" || normalized.startsWith("lahore ");
}

function getActiveCheckoutCity() {
  const cityInput = document.getElementById("checkout-city");
  return cityInput?.value || deliveryDetails?.city || "";
}

function hasDeliveryContext() {
  return Boolean(String(getActiveCheckoutCity() || "").trim());
}

function getDeliveryRules(cityOverride = "") {
  const currency = localStorage.getItem("roo7z_currency") || "PKR";
  const city = cityOverride || getActiveCheckoutCity();
  const pkrFee = isLahoreCity(city) ? DELIVERY_FEE_LAHORE_PKR : DELIVERY_FEE_OTHER_PKR;
  return {
    currency,
    fee: currency === "GBP" ? DELIVERY_FEE_GBP : pkrFee,
    freeThreshold: currency === "GBP" ? FREE_THRESHOLD_GBP : FREE_THRESHOLD_PKR
  };
}

// === DOM elements (will be initialized when DOM is ready) ===
let els = {};
let authReadyPromise = setPersistence(auth, browserSessionPersistence).catch(() => {});

// ===== Helpers =====
const safeParse = (raw, fb) => { try { return JSON.parse(raw) || fb; } catch { return fb; } };
const escapeHtml = (s) =>
  String(s || "").replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const setAuthMessage = (msg, tone = "error") => {
  if (!els?.auth?.msg) return;
  els.auth.msg.textContent = msg;
  els.auth.msg.style.display = "block";
  els.auth.msg.style.color = tone === "success" ? "#16a34a" : "#ff6b6b";
};
const getGuestId = () => {
  if (!guestId) {
    guestId = `guest_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem(LS_GUEST_ID, guestId);
  }
  return guestId;
};

const loadState = () => {
  cart = safeParse(localStorage.getItem(LS_CART), []);
  cart = Array.isArray(cart)
    ? cart.map((item) => ({ ...item, _cartKey: getCartKey(item) }))
    : [];
};
const saveState = () => { localStorage.setItem(LS_CART, JSON.stringify(cart)); };

const getCount = () => cart.reduce((s, i) => s + (i.qty || 0), 0);
const getSubtotal = () => {
  const currency = localStorage.getItem("roo7z_currency") || "PKR";
  return cart.reduce((s, i) => {
    const price = currency === "GBP" ? (i.priceGBP || 0) : (i.pricePKR || 0);
    return s + price * (i.qty || 0);
  }, 0);
};
const normalizeVariantValue = (value) => String(value ?? "").trim().toLowerCase();
const buildCartKey = (item) => {
  const idPart = String(item?.id ?? "").trim();
  const designPart = normalizeVariantValue(item?.design);
  const colorPart = normalizeVariantValue(item?.color);
  const sizePart = normalizeVariantValue(item?.size);
  const imagePart = normalizeVariantValue(item?.img || item?.image);
  return [idPart, designPart, colorPart, sizePart, imagePart].join("||");
};
const getCartKey = (item) => item?._cartKey || buildCartKey(item);
const findIndexByCartKey = (cartKey) => cart.findIndex((it) => getCartKey(it) === cartKey);

// ===== Cart functions =====
function addItem(item) {
  const normalizedItem = { ...item, qty: item.qty || 1 };
  normalizedItem._cartKey = getCartKey(normalizedItem);
  const idx = findIndexByCartKey(normalizedItem._cartKey);
  if (idx >= 0) {
    cart[idx].qty = (cart[idx].qty || 0) + normalizedItem.qty;
  } else {
    cart.push(normalizedItem);
  }
  saveState();
  renderCart();
  syncCount();
}
function clearCart() { cart = []; saveState(); renderCart(); syncCount(); }
function renderCart() {
  if (!els.itemsNode) return;
  const node = els.itemsNode;
  node.innerHTML = "";
  if (!cart.length) {
    node.innerHTML = `<div class="muted center" style="padding:24px">Your cart is empty</div>`;
    // update sidebar summary when cart is empty
    if (els.subtotalContainer) {
      els.subtotalContainer.innerHTML = `Subtotal: <strong id="univ-cart-subtotal">${formatCurrency(0)}</strong>` +
        `<div style="font-weight:700;margin-top:6px">Total: <strong id="univ-cart-total">${formatCurrency(0)}</strong></div>`;
      els.subtotal = document.getElementById('univ-cart-subtotal');
    } else if (els.subtotal) {
      els.subtotal.textContent = formatCurrency(0);
    }
    if (els.itemsCount) els.itemsCount.textContent = "0 items";
    return;
  }
  const currency = localStorage.getItem("roo7z_currency") || "PKR";
  cart.forEach((it) => {
    const price = currency === "GBP" ? (it.priceGBP || 0) : (it.pricePKR || 0);
    const itemTotal = price * (it.qty || 0);
    const cartKey = getCartKey(it);
    const variantBits = [it.design, it.color, it.size].filter(Boolean).map(escapeHtml);
    const variantText = variantBits.length ? variantBits.join(" | ") : "";
    const div = document.createElement("div");
    div.className = "univ-cart-item";
    div.innerHTML = `
      <img src="${it.img || "images/roo7z-logo.png"}" alt="${escapeHtml(it.title)}" class="cart-thumb"/>
      <div style="flex:1;display:flex;flex-direction:column;gap:6px">
        <div style="display:flex;justify-content:space-between">
          <div style="font-weight:700">${escapeHtml(it.title)}</div>
          <div style="font-weight:700">${formatCurrency(itemTotal)}</div>
        </div>
        ${variantText ? `<div class="muted small">${variantText}</div>` : ""}
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div class="muted small">${formatCurrency(price)} each</div>
          <div class="univ-qty-controls">
            <button class="univ-qty-minus" data-id="${cartKey}">−</button>
            <div style="min-width:28px;text-align:center">${it.qty}</div>
            <button class="univ-qty-plus" data-id="${cartKey}">+</button>
            <button class="btn ghost univ-remove" data-id="${cartKey}" style="margin-left:8px">Remove</button>
          </div>
        </div>
      </div>`;
    node.appendChild(div);
  });
  const subtotalValue = getSubtotal();
  const rules = getDeliveryRules(getActiveCheckoutCity());
  const showDelivery = hasDeliveryContext();
  const delivery = subtotalValue >= rules.freeThreshold ? 0 : rules.fee;
  const finalTotal = subtotalValue + (showDelivery ? delivery : 0);

  // Update sidebar subtotal container with breakdown
  if (els.subtotalContainer) {
    els.subtotalContainer.innerHTML = `Subtotal: <strong id="univ-cart-subtotal">${formatCurrency(subtotalValue)}</strong>` +
      `${showDelivery ? `<div class="muted small" id="univ-cart-delivery">${delivery === 0 ? 'Free Delivery' : 'Delivery Charges: ' + formatCurrency(delivery)}</div>` : ''}` +
      `<div style="font-weight:700;margin-top:6px">Total: <strong id="univ-cart-total">${formatCurrency(finalTotal)}</strong></div>`;
    // update element reference
    els.subtotal = document.getElementById('univ-cart-subtotal');
  } else if (els.subtotal) {
    els.subtotal.textContent = formatCurrency(subtotalValue);
  }
  if (els.itemsCount) els.itemsCount.textContent = `${getCount()} item${getCount() === 1 ? "" : "s"}`;

  // Also update checkout summary if present
  const checkoutSummary = document.getElementById('checkout-summary');
  if (checkoutSummary) {
    checkoutSummary.innerHTML = `
      <div style="display:flex;justify-content:space-between"><div>Subtotal</div><div>${formatCurrency(subtotalValue)}</div></div>
      ${showDelivery ? `<div style="display:flex;justify-content:space-between;margin-top:6px"><div>Delivery</div><div>${delivery === 0 ? 'Free Delivery' : formatCurrency(delivery)}</div></div>` : ''}
      <div style="display:flex;justify-content:space-between;margin-top:10px;font-weight:700"><div>Total</div><div>${formatCurrency(finalTotal)}</div></div>
    `;
  }
}

// ===== Currency + Toast =====
function formatCurrency(amount) {
  const currency = localStorage.getItem("roo7z_currency") || "PKR";
  const locale = currency === "GBP" ? "en-GB" : "en-PK";
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount || 0);
}
let toastTimer;
function showToast(msg) {
  let t = document.getElementById("cart-toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "cart-toast";
    t.style.cssText =
      "position:fixed;left:50%;transform:translateX(-50%);bottom:110px;background:#111;color:#fff;padding:10px 16px;border-radius:8px;z-index:1600";
    document.body.appendChild(t);
  }
  t.textContent = "✅ " + msg;
  t.style.opacity = "1";
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (t.style.opacity = "0"), 1800);
}

function ensureCheckoutNotice() {
  if (document.getElementById("roo-checkout-notice")) return;

  const style = document.createElement("style");
  style.id = "roo-checkout-notice-style";
  style.textContent = `
    .roo-checkout-notice {
      position: fixed;
      inset: 0;
      display: none;
      align-items: center;
      justify-content: center;
      background: rgba(3, 10, 9, 0.55);
      backdrop-filter: blur(6px);
      z-index: 3000;
      padding: 18px;
    }
    .roo-checkout-notice.open {
      display: flex;
      animation: rooNoticeFadeIn .24s ease;
    }
    .roo-checkout-card {
      width: min(420px, 94vw);
      background: linear-gradient(145deg, #0f1f1c, #18322d);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 18px;
      color: #eefaf4;
      padding: 20px 18px 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
      transform: translateY(10px) scale(0.98);
      animation: rooNoticePop .24s ease forwards;
    }
    .roo-checkout-badge {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      font-size: 24px;
      margin: 0 auto 12px;
      background: #19a96a;
      box-shadow: 0 10px 24px rgba(25, 169, 106, 0.35);
    }
    .roo-checkout-card h3 {
      margin: 0 0 8px;
      text-align: center;
      font-size: 1.45rem;
      color: #ffffff;
      line-height: 1.2;
    }
    .roo-checkout-card p {
      margin: 0;
      text-align: center;
      color: #dcefe9;
      line-height: 1.45;
      white-space: pre-line;
      letter-spacing: 0;
      opacity: 1;
      font-size: 0.98rem;
    }
    .roo-checkout-ok {
      margin: 16px auto 0;
      display: block;
      min-width: 120px;
      border: none;
      border-radius: 999px;
      padding: 10px 18px;
      font-weight: 700;
      color: #fff;
      background: linear-gradient(135deg, #18a364, #1f7bff);
      cursor: pointer;
      transition: transform .2s ease, box-shadow .2s ease;
      box-shadow: 0 10px 24px rgba(24, 163, 100, 0.28);
    }
    .roo-checkout-ok:hover {
      transform: translateY(-1px);
      box-shadow: 0 12px 26px rgba(24, 163, 100, 0.34);
    }
    .roo-checkout-notice.info .roo-checkout-badge {
      background: #1f7bff;
      box-shadow: 0 10px 24px rgba(31, 123, 255, 0.35);
    }
    .roo-checkout-notice.error .roo-checkout-badge {
      background: #dc2626;
      box-shadow: 0 10px 24px rgba(220, 38, 38, 0.35);
    }
    .roo-checkout-notice.error .roo-checkout-ok {
      background: linear-gradient(135deg, #dc2626, #f97316);
      box-shadow: 0 10px 24px rgba(220, 38, 38, 0.32);
    }
    @keyframes rooNoticeFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes rooNoticePop {
      to { transform: translateY(0) scale(1); }
    }
  `;
  document.head.appendChild(style);

  const wrap = document.createElement("div");
  wrap.id = "roo-checkout-notice";
  wrap.className = "roo-checkout-notice";
  wrap.innerHTML = `
    <div class="roo-checkout-card" role="dialog" aria-modal="true" aria-live="polite">
      <div class="roo-checkout-badge" id="roo-checkout-badge">✓</div>
      <h3 id="roo-checkout-title">Done</h3>
      <p id="roo-checkout-text"></p>
      <button type="button" class="roo-checkout-ok" id="roo-checkout-ok">Awesome</button>
    </div>
  `;
  document.body.appendChild(wrap);
}

function showCheckoutNotice({ title, message, tone = "success" }) {
  ensureCheckoutNotice();
  const wrap = document.getElementById("roo-checkout-notice");
  const titleNode = document.getElementById("roo-checkout-title");
  const textNode = document.getElementById("roo-checkout-text");
  const badgeNode = document.getElementById("roo-checkout-badge");
  const okBtn = document.getElementById("roo-checkout-ok");
  if (!wrap || !titleNode || !textNode || !badgeNode || !okBtn) return;

  wrap.classList.remove("success", "info", "error");
  wrap.classList.add(tone);
  titleNode.textContent = title || "Done";
  textNode.textContent = String(message || "");
  badgeNode.textContent = tone === "error" ? "!" : tone === "info" ? "i" : "✓";

  const close = () => wrap.classList.remove("open");
  okBtn.onclick = close;
  wrap.onclick = (e) => {
    if (e.target === wrap) close();
  };

  wrap.classList.add("open");
}

// ===== Auth UI =====
let isLogin = true;
function showAuth(mode) {
  isLogin = mode === "login";
  if (els.auth.title) els.auth.title.textContent = isLogin ? "LOGIN TO ROO7Z" : "Create account";
  if (els.auth.submit) els.auth.submit.textContent = isLogin ? "Login" : "Create";
  if (els.auth.toggle) els.auth.toggle.textContent = isLogin ? "Create account" : "Have an account? Login";
  if (els.auth.msg) els.auth.msg.style.display = "none";
  if (els.auth.overlay) els.auth.overlay.classList.add("open");
}
function closeAuth() { if (els.auth.overlay) els.auth.overlay.classList.remove("open"); }

function redirectToProfileIfRequested() {
  if (sessionStorage.getItem(PROFILE_REDIRECT_FLAG) !== "1") return false;
  const path = (window.location.pathname || "").toLowerCase();
  if (path.endsWith("/user.html") || path.endsWith("user.html")) {
    sessionStorage.removeItem(PROFILE_REDIRECT_FLAG);
    return false;
  }
  sessionStorage.removeItem(PROFILE_REDIRECT_FLAG);
  window.location.href = "user.html";
  return true;
}

function ensureAuthExtras() {
  console.log("Ensuring auth extras");
  if (!els.auth.form) return;
  const form = els.auth.form;
  const emailLabel = els.auth.email?.closest("label");

  if (!document.getElementById("univ-google-login")) {
    const providers = document.createElement("div");
    providers.className = "univ-auth-providers";
    providers.innerHTML = `
      <button type="button" class="btn ghost univ-auth-provider" id="univ-google-login">
        <span class="provider-icon">G</span> Continue with Google
      </button>
    `;
    const divider = document.createElement("div");
    divider.className = "univ-auth-divider";
    divider.innerHTML = "<span>or</span>";
    if (emailLabel) {
      form.insertBefore(providers, emailLabel);
      form.insertBefore(divider, emailLabel);
    } else {
      form.prepend(divider);
      form.prepend(providers);
    }
  }

  if (!document.getElementById("univ-forgot-password") && els.auth.pw) {
    const pwLabel = els.auth.pw.closest("label");
    if (pwLabel) {
      const forgot = document.createElement("button");
      forgot.type = "button";
      forgot.id = "univ-forgot-password";
      forgot.className = "univ-auth-link";
      forgot.textContent = "Forgot password?";
      pwLabel.appendChild(forgot);
    }
  }

  if (!document.getElementById("univ-auth-secondary")) {
    const secondary = document.createElement("div");
    secondary.className = "univ-auth-secondary";
    secondary.id = "univ-auth-secondary";
    secondary.innerHTML = `
      <button type="button" class="btn ghost" id="univ-guest-login">Continue as guest</button>
    `;
    const msg = els.auth.msg;
    if (msg && msg.parentElement === form) {
      form.insertBefore(secondary, msg);
    } else {
      form.appendChild(secondary);
    }
  }

  const actionRow = els.auth.submit?.closest("div");
  if (actionRow) actionRow.classList.add("univ-auth-actions");
}

function refreshAuthElements() {
  els.auth.googleBtn = document.getElementById("univ-google-login");
  els.auth.forgotBtn = document.getElementById("univ-forgot-password");
  els.auth.guestBtn = document.getElementById("univ-guest-login");
}

async function loginWithGoogle() {
  console.log("Google login clicked");
  try {
    if (authReadyPromise) await authReadyPromise;
    sessionStorage.removeItem(REDIRECT_FLAG);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    await signInWithPopup(auth, provider);
  } catch (err) {
    if (err?.code === "auth/popup-blocked") {
      setAuthMessage("Popup blocked. Please allow popups and try again.");
      return;
    }
    if (err?.code === "auth/popup-closed-by-user" || err?.code === "auth/cancelled-popup-request") {
      setAuthMessage("Google sign-in cancelled.");
      return;
    }
    setAuthMessage(err.message || "Google sign-in failed.");
  }
}

async function sendPasswordReset() {
  const email = els.auth.email?.value?.trim().toLowerCase() || "";
  if (!email) {
    setAuthMessage("Enter your email to reset your password.");
    return;
  }
  try {
    await sendPasswordResetEmail(auth, email);
    setAuthMessage("Password reset email sent.", "success");
  } catch (err) {
    setAuthMessage(err.message || "Unable to send reset email.");
  }
}

function continueAsGuest() {
  isGuest = true;
  localStorage.setItem(LS_GUEST, "1");
  getGuestId();
  updateUserStatus();
  closeAuth();
  if (pendingCheckout) {
    pendingCheckout = false;
    showCheckoutForm();
  }
}

function setupAuthExtrasListeners() {
  console.log("Setting up listeners", !!els.auth.googleBtn);
  if (els.auth.googleBtn) els.auth.googleBtn.addEventListener("click", loginWithGoogle);
  if (els.auth.forgotBtn) els.auth.forgotBtn.addEventListener("click", sendPasswordReset);
  if (els.auth.guestBtn) els.auth.guestBtn.addEventListener("click", continueAsGuest);
}

async function signup(email, pw) {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, pw);
    await setDoc(doc(db, "users", cred.user.uid), { email, createdAt: serverTimestamp() });
    return true;
  } catch (err) {
    setAuthMessage(err.message || "Sign up failed.");
    return false;
  }
}
async function login(email, pw) {
  console.log("Manual login attempted", email);
  try {
    const cred = await signInWithEmailAndPassword(auth, email, pw);
    return true;
  } catch (err) {
    setAuthMessage(err.message || "Login failed.");
    return false;
  }
}

// ===== User UI sync =====
function updateUserStatus() {
  document.querySelectorAll("#user-area,.user-area").forEach((el) => {
    const label = currentUser ? currentUser.email : (isGuest ? "Guest checkout" : "Not signed in");
    el.textContent = label;
  });
}

const quickActionsState = {
  user: null,
  cart: null,
  resizeBound: false
};

function rememberOriginalSpot(key, item) {
  if (!item || quickActionsState[key]) return;
  const placeholder = document.createComment(`quick-${key}-placeholder`);
  item.parentNode?.insertBefore(placeholder, item);
  quickActionsState[key] = { placeholder };
}

function restoreToOriginalSpot(key, item) {
  const state = quickActionsState[key];
  if (!item || !state?.placeholder?.parentNode) return;
  state.placeholder.parentNode.insertBefore(item, state.placeholder.nextSibling);
}

function placeMobileQuickActions() {
  const navContainer = document.querySelector(".navigation-wrap .container");
  const toggler = navContainer?.querySelector(".navbar-toggler");
  if (!navContainer || !toggler) return;

  let quickWrap = navContainer.querySelector(".mobile-quick-actions");
  if (!quickWrap) {
    quickWrap = document.createElement("div");
    quickWrap.className = "mobile-quick-actions";
    toggler.insertAdjacentElement("afterend", quickWrap);
  }

  const isMobile = window.matchMedia("(max-width: 991px)").matches;
  const userItem = document.getElementById("userIcon")?.closest(".nav-item");
  const cartItem = document.getElementById("univ-cart-toggle")?.closest(".nav-item");

  rememberOriginalSpot("user", userItem);
  rememberOriginalSpot("cart", cartItem);

  if (isMobile) {
    if (userItem && userItem.parentElement !== quickWrap) quickWrap.appendChild(userItem);
    if (cartItem && cartItem.parentElement !== quickWrap) quickWrap.appendChild(cartItem);
  } else {
    restoreToOriginalSpot("user", userItem);
    restoreToOriginalSpot("cart", cartItem);
  }
}

// ===== Checkout handler =====
export function showCheckoutForm() {
  console.log("showCheckoutForm called");

  if (!currentUser && !isGuest) {
    console.log("User not logged in, showing auth before checkout");
    pendingCheckout = true;
    showAuth("login");
    const checkoutOverlay = document.getElementById("checkout-overlay");
    if (checkoutOverlay) {
      checkoutOverlay.style.display = "none";
      checkoutOverlay.classList.remove("show");
    }
    return;
  }
  
  // Wait a bit for DOM to be ready
  setTimeout(() => {
    const checkoutOverlay = document.getElementById("checkout-overlay");
    if (checkoutOverlay) {
      console.log("Showing checkout overlay");
      
      // Force display with important styles
      checkoutOverlay.style.cssText = `
        display: flex !important;
        position: fixed !important;
        inset: 0 !important;
        z-index: 2000 !important;
        background: rgba(0, 0, 0, 0.6) !important;
        justify-content: center !important;
        align-items: center !important;
        visibility: visible !important;
        opacity: 1 !important;
      `;
      
      checkoutOverlay.classList.add("show");
      
      // Close cart if it's open
      const sidebar = document.getElementById("univ-cart-sidebar");
      if (sidebar && sidebar.classList.contains("open")) {
        sidebar.classList.remove("open");
      }
      
      // Ensure form is visible
      const checkoutForm = document.getElementById("checkout-form");
      if (checkoutForm) {
        checkoutForm.style.cssText = `
          display: flex !important;
          flex-direction: column !important;
          visibility: visible !important;
        `;
      }
      
      console.log("Checkout overlay displayed successfully");
    } else {
      console.error("Checkout overlay not found");
      // Try to create a simple alert as fallback
      alert("Checkout form not found. Please refresh the page and try again.");
    }
  }, 50);
}

// Debug function to check DOM elements
function debugDOMElements() {
  console.log("=== DOM Elements Debug ===");
  const elements = {
    'checkout-overlay': document.getElementById('checkout-overlay'),
    'checkout-form': document.getElementById('checkout-form'),
    'univ-checkout': document.getElementById('univ-checkout'),
    'univ-cart-sidebar': document.getElementById('univ-cart-sidebar'),
    'univ-cart-items': document.getElementById('univ-cart-items')
  };
  
  for (const [name, element] of Object.entries(elements)) {
    if (element) {
      console.log(`✓ ${name} found:`, element);
    } else {
      console.error(`✗ ${name} NOT found`);
    }
  }
  console.log("=== End Debug ===");
}

// Function to initialize DOM elements and event listeners
function initEventListeners() {
  placeMobileQuickActions();
  if (!quickActionsState.resizeBound) {
    quickActionsState.resizeBound = true;
    window.addEventListener("resize", placeMobileQuickActions);
  }

  // Debug DOM elements first
  debugDOMElements();
  
  // Initialize DOM elements
  els = {
    toggleBtn: document.getElementById("univ-cart-toggle"),
    cartCount: document.getElementById("univ-cart-count"),
    sidebar: document.getElementById("univ-cart-sidebar"),
    closeBtn: document.getElementById("univ-close-cart"),
    itemsNode: document.getElementById("univ-cart-items"),
    subtotal: document.getElementById("univ-cart-subtotal"),
    subtotalContainer: document.querySelector('.univ-subtotal'),
    itemsCount: document.getElementById("univ-cart-items-count"),
    checkoutBtn: document.getElementById("univ-checkout"),
    clearBtn: document.getElementById("univ-clear-cart"),
    auth: {
      overlay: document.getElementById("univ-auth-overlay"),
      form: document.getElementById("univ-auth-form"),
      title: document.getElementById("univ-auth-title"),
      toggle: document.getElementById("univ-toggle-auth"),
      submit: document.getElementById("univ-auth-submit"),
      msg: document.getElementById("univ-auth-msg"),
      closeBtn: document.getElementById("univ-close-auth"),
      email: document.getElementById("univ-email"),
      pw: document.getElementById("univ-password"),
    },
    checkoutOverlay: document.getElementById("checkout-overlay"),
    checkoutForm: document.getElementById("checkout-form")
  };

  ensureAuthExtras();
  refreshAuthElements();
  setupAuthExtrasListeners();
  // persistence already initialized at module load

  console.log("Initializing cart elements:", {
    checkoutBtn: els.checkoutBtn,
    checkoutOverlay: els.checkoutOverlay,
    checkoutForm: els.checkoutForm
  });

  // ensureCheckoutAuthOptions removed (no login buttons in checkout)

  const userIcon = document.getElementById("userIcon");
  if (userIcon) {
    userIcon.addEventListener("click", (e) => {
      e.preventDefault();
      if (!currentUser) {
        sessionStorage.setItem(PROFILE_REDIRECT_FLAG, "1");
        showAuth("login");
      } else {
        window.location.href = "user.html";
      }
    });
  }

  if (els.toggleBtn) els.toggleBtn.addEventListener("click", (e) => { e.preventDefault(); openCart(); });
  if (els.closeBtn) els.closeBtn.addEventListener("click", (e) => { e.preventDefault(); closeCart(); });
  if (els.checkoutBtn) {
    console.log("Checkout button found:", els.checkoutBtn);
    els.checkoutBtn.addEventListener("click", (e) => {
      console.log("Checkout button clicked");
      e.preventDefault();
      e.stopPropagation();
      
      // Check if cart is empty
      if (cart.length === 0) {
        alert("Your cart is empty. Please add items before checkout.");
        return;
      }
      
      console.log("Current user:", currentUser);
      console.log("Cart items:", cart.length);
      
      if (!currentUser && !isGuest) {
        console.log("User not logged in, showing auth");
        pendingCheckout = true;
        showAuth("login");
      } else {
        console.log("User logged in, showing checkout form");
        showCheckoutForm();
      }
    });
  } else {
    console.error("Checkout button not found");
    // Try to find it with a different selector
    const altCheckoutBtn = document.querySelector('#univ-checkout, .univ-checkout, [data-checkout]');
    if (altCheckoutBtn) {
      console.log("Found alternative checkout button:", altCheckoutBtn);
      altCheckoutBtn.addEventListener("click", (e) => {
        console.log("Alternative checkout button clicked");
        e.preventDefault();
        if (cart.length === 0) {
          alert("Your cart is empty. Please add items before checkout.");
          return;
        }
        if (!currentUser && !isGuest) {
          pendingCheckout = true;
          showAuth("login");
        } else {
          showCheckoutForm();
        }
      });
    }
  }
  if (els.clearBtn) els.clearBtn.addEventListener("click", (e) => { e.preventDefault(); if (confirm("Clear cart?")) clearCart(); });

  // Close checkout form
  const closeCheckoutBtn = document.getElementById("close-checkout");
  if (closeCheckoutBtn) {
    closeCheckoutBtn.addEventListener("click", () => {
      const checkoutOverlay = document.getElementById("checkout-overlay");
      if (checkoutOverlay) {
        checkoutOverlay.style.display = "none";
        checkoutOverlay.classList.remove("show");
      }
    });
  }

  // Close checkout when clicking outside
  const checkoutOverlay = document.getElementById("checkout-overlay");
  if (checkoutOverlay) {
    checkoutOverlay.addEventListener("click", (e) => {
      if (e.target === checkoutOverlay) {
        checkoutOverlay.style.display = "none";
        checkoutOverlay.classList.remove("show");
      }
    });
  }

  // Ensure checkout summary exists (injected if missing)
  if (els.checkoutForm) {
    let summary = els.checkoutForm.querySelector('#checkout-summary');
    if (!summary) {
      const fa = els.checkoutForm.querySelector('.form-actions');
      const div = document.createElement('div');
      div.id = 'checkout-summary';
      div.className = 'checkout-summary';
      div.style.padding = '12px 0';
      div.style.borderTop = '1px dashed #eee';
      if (fa) els.checkoutForm.insertBefore(div, fa);
    }
  }

  // Handle checkout form submission
  const checkoutForm = document.getElementById("checkout-form");
  if (checkoutForm) {
    console.log("Checkout form found, adding event listener");
    const checkoutCityInput = document.getElementById("checkout-city");
    if (checkoutCityInput) {
      const refreshDeliveryPreview = () => renderCart();
      checkoutCityInput.addEventListener("input", refreshDeliveryPreview);
      checkoutCityInput.addEventListener("change", refreshDeliveryPreview);
    }

    checkoutForm.addEventListener("submit", async (e) => {
      console.log("Checkout form submitted");
      e.preventDefault();
      if (checkoutSubmitLocked) return;

      const name = document.getElementById("checkout-name")?.value.trim();
      const email = document.getElementById("checkout-email")?.value.trim();
      const address = document.getElementById("checkout-address")?.value.trim();
      const city = document.getElementById("checkout-city")?.value.trim();
      const phone = document.getElementById("checkout-phone")?.value.trim();
      const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value || "cod";

      if (!name || !email || !address || !city || !phone) {
        alert("Please fill in all required fields");
        return;
      }

      if (paymentMethod !== "cod") {
        alert("Only Cash on Delivery is available.");
        return;
      }

      // Store delivery details
      deliveryDetails = { name, email, address, city, phone };
      const submitBtn = checkoutForm.querySelector('button[type="submit"]');
      const previousBtnText = submitBtn?.textContent || "";

      checkoutSubmitLocked = true;
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Placing...";
      }

      try {
        await createOrder({
          paymentMethod: "cod",
          paymentStatus: "cod",
          paymentData: {},
          alertMessage: "Order placed! Pay cash on delivery."
        });
      } finally {
        checkoutSubmitLocked = false;
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = previousBtnText || "Confirm Order";
        }
      }
    });
  }

  // Setup auth listeners
  setupAuthListeners();
  
  // Load cart state and sync count after initialization
  loadState();
  syncCount();
  placeMobileQuickActions();

}

// Handle redirect result as early as possible
handleRedirectResult();

async function handleRedirectResult() {
  console.log("Handling redirect result");
  try {
    if (authReadyPromise) await authReadyPromise;
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      currentUser = { uid: result.user.uid, email: result.user.email };
      updateUserStatus();
      const overlay = document.getElementById("univ-auth-overlay");
      if (overlay) overlay.classList.remove("open");
      setAuthMessage("Logged in successfully.", "success");
      if (redirectToProfileIfRequested()) return;
      sessionStorage.removeItem(REDIRECT_FLAG);
    }
  } catch (err) {
    if (err && err.message) {
      setAuthMessage(err.message || "Google sign-in failed.");
    }
  }
}

// Initialize event listeners when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initEventListeners);
} else {
  initEventListeners();
}

// ===== Universal add-to-cart event listener =====
document.addEventListener("universal-add-to-cart", (e) => {
  if (e.detail) {
    addItem(e.detail);
    showToast("Added to cart!");
  }
});

// ===== Auth form submit (moved inside initEventListeners) =====
function setupAuthListeners() {
  if (els.auth.form) {
    els.auth.form.addEventListener("submit", async (ev) => {
      console.log("Form submitted", isLogin);
      ev.preventDefault();
      const e = els.auth.email?.value.trim().toLowerCase() || "";
      const p = els.auth.pw?.value || "";
      if (!e || p.length < 6) {
        setAuthMessage("Enter valid email & 6+ char password.");
        return;
      }
      const success = isLogin ? await login(e, p) : await signup(e, p);
      if (success) { closeAuth(); }
    });
  }
  if (els.auth.toggle) els.auth.toggle.addEventListener("click", () => showAuth(isLogin ? "signup" : "login"));
  if (els.auth.closeBtn) els.auth.closeBtn.addEventListener("click", closeAuth);
}





// ===== Firebase auth state sync =====
onAuthStateChanged(auth, (user) => {
  console.log("Auth state changed", !!user);
  currentUser = user ? { uid: user.uid, email: user.email } : null;
  if (currentUser && isGuest) {
    isGuest = false;
    localStorage.removeItem(LS_GUEST);
  }
  updateUserStatus();
  if (currentUser) {
    if (redirectToProfileIfRequested()) return;
    closeAuth();
    setAuthMessage("Logged in successfully.", "success");
  }
  if (!currentUser && sessionStorage.getItem(REDIRECT_FLAG) === "1") {
    setAuthMessage("Google login didn't complete. Please try again.", "error");
    sessionStorage.removeItem(REDIRECT_FLAG);
  }
  if (currentUser && pendingCheckout) {
    pendingCheckout = false;
    showCheckoutForm();
  }
});

// ===== Cart item event delegation =====
document.addEventListener("click", (e) => {
  if (e.target.matches(".univ-qty-plus")) {
    const cartKey = e.target.dataset.id;
    const idx = findIndexByCartKey(cartKey);
    if (idx >= 0) { cart[idx].qty = (cart[idx].qty || 0) + 1; saveState(); renderCart(); syncCount(); }
  }
  if (e.target.matches(".univ-qty-minus")) {
    const cartKey = e.target.dataset.id;
    const idx = findIndexByCartKey(cartKey);
    if (idx >= 0 && cart[idx].qty > 1) { cart[idx].qty--; saveState(); renderCart(); syncCount(); }
  }
  if (e.target.matches(".univ-remove")) {
    const cartKey = e.target.dataset.id;
    const idx = findIndexByCartKey(cartKey);
    if (idx >= 0) { cart.splice(idx, 1); saveState(); renderCart(); syncCount(); }
  }
  if (e.target.id === "univ-guest-login") {
    e.preventDefault();
    continueAsGuest();
  }
});

// ===== Init =====
updateUserStatus();

// ===== Global functions for debugging =====
window.debugCheckout = function() {
  console.log("=== Checkout Debug ===");
  console.log("Cart items:", cart.length);
  console.log("Current user:", currentUser);
  console.log("Checkout overlay:", document.getElementById('checkout-overlay'));
  console.log("Checkout form:", document.getElementById('checkout-form'));
  console.log("Checkout button:", document.getElementById('univ-checkout'));
};

window.forceShowCheckout = function() {
  console.log("Force showing checkout...");
  showCheckoutForm();
};

window.testAddToCart = function() {
  const testItem = {
    id: 'debug-test-' + Date.now(),
    title: 'Debug Test Product',
    img: 'images/roo7z-logo.png',
    pricePKR: 500,
    priceGBP: 5,
    qty: 1
  };
  addItem(testItem);
  console.log("Test item added to cart");
};

// ===== Cart open/close + sync =====
function openCart() { if (!els.sidebar) return; els.sidebar.classList.add("open"); renderCart(); }
function closeCart() { if (!els.sidebar) return; els.sidebar.classList.remove("open"); }
function ensureCartBadgeElements() {
  const toggles = Array.from(document.querySelectorAll("#univ-cart-toggle"));
  const badges = [];

  toggles.forEach((toggle) => {
    let badge = toggle.querySelector("#univ-cart-count") || toggle.querySelector(".cart-badge");
    if (!badge) {
      badge = document.createElement("span");
      badge.id = "univ-cart-count";
      badge.className = "cart-badge";
      badge.textContent = "0";
      toggle.appendChild(badge);
    }
    badges.push(badge);
  });

  if (!els.toggleBtn || !els.toggleBtn.isConnected) {
    els.toggleBtn = toggles[0] || null;
  }
  if (!els.cartCount || !els.cartCount.isConnected) {
    els.cartCount = badges[0] || null;
  }

  return { toggles, badges };
}

function syncCount() {
  const { toggles, badges } = ensureCartBadgeElements();
  if (!badges.length) return;
  const count = getCount();
  const badgeText = count > 99 ? "99+" : String(count);

  toggles.forEach((toggle) => {
    toggle.classList.toggle("has-items", count > 0);
    toggle.style.position = "relative";
  });

  badges.forEach((badge, idx) => {
    const toggle = toggles[idx];
    const inMobileQuickActions = Boolean(toggle?.closest(".mobile-quick-actions"));
    badge.textContent = badgeText;
    badge.hidden = count <= 0;
    badge.style.setProperty("display", count > 0 ? "inline-flex" : "none", "important");
    badge.style.position = "absolute";
    badge.style.top = inMobileQuickActions ? "-6px" : "-10px";
    badge.style.right = inMobileQuickActions ? "-6px" : "-10px";
    badge.style.zIndex = "9";
    badge.style.background = "#ef4444";
    badge.style.color = "#fff";
    badge.style.fontWeight = "700";
    badge.style.borderRadius = "999px";
    badge.style.minWidth = inMobileQuickActions ? "16px" : "18px";
    badge.style.height = inMobileQuickActions ? "16px" : "18px";
    badge.style.alignItems = "center";
    badge.style.justifyContent = "center";
    badge.style.lineHeight = "1";

    if (count > 0 && count !== lastSyncedCount) {
      badge.animate(
        [
          { transform: "scale(0.8)" },
          { transform: "scale(1.18)" },
          { transform: "scale(1)" }
        ],
        { duration: 260, easing: "ease-out" }
      );
    }
  });

  lastSyncedCount = count;
}

async function createOrder({ paymentMethod, paymentStatus, paymentData, alertMessage }) {
  if (orderSubmissionInFlight) {
    console.warn("Order request blocked: submission already in progress.");
    return;
  }
  orderSubmissionInFlight = true;
  try {
    if (!currentUser && !isGuest) {
      alert("Please login or continue as guest to place an order.");
      return;
    }
    const ordersRef = currentUser
      ? collection(db, "users", currentUser.uid, "orders")
      : collection(db, "guest_orders");
    const subtotalValue = getSubtotal();
    const rules = getDeliveryRules(deliveryDetails?.city || "");
    const delivery = subtotalValue >= rules.freeThreshold ? 0 : rules.fee;
    const finalTotal = subtotalValue + delivery;
    const orderCurrency = localStorage.getItem("roo7z_currency") || "PKR";
    const pricedItems = cart.map((item) => {
      const { _cartKey, ...cleanItem } = item;
      const qty = Number(item.qty || item.quantity || 1);
      const unitPrice = orderCurrency === "GBP"
        ? Number(item.priceGBP || 0)
        : Number(item.pricePKR || 0);
      const selectedImage = item.img || item.image || "";
      return {
        ...cleanItem,
        img: selectedImage || "images/roo7z-logo.png",
        image: selectedImage || "images/roo7z-logo.png",
        design: item.design || null,
        quantity: qty,
        unit_price: unitPrice,
        line_total: unitPrice * qty
      };
    });

    const orderData = {
      ...deliveryDetails,
      items: pricedItems,
      subtotal: subtotalValue,
      delivery_charges: delivery,
      delivery_label: delivery === 0 ? 'Free Delivery' : `Delivery Charges: ${formatCurrency(delivery)}`,
      total: finalTotal,
      currency: orderCurrency,
      date: serverTimestamp(),
      status: "new",
      isNew: true,
      user_id: currentUser ? currentUser.uid : null,
      guest_id: isGuest ? getGuestId() : null,
      guest: !!isGuest,
      payment_method: paymentMethod,
      payment_status: paymentStatus,
      ...paymentData
    };

    await addDoc(ordersRef, orderData);

    if (alertMessage) {
      showCheckoutNotice({
        title: "Order Confirmed",
        message: alertMessage,
        tone: "success"
      });
    }
    clearCart();

    const checkoutOverlay = document.getElementById("checkout-overlay");
    if (checkoutOverlay) {
      checkoutOverlay.style.display = "none";
      checkoutOverlay.classList.remove("show");
    }

    const checkoutForm = document.getElementById("checkout-form");
    if (checkoutForm) {
      checkoutForm.reset();
      const codRadio = checkoutForm.querySelector('input[name="payment"][value="cod"]');
      if (codRadio) codRadio.checked = true;
    }
    deliveryDetails = null;
  } catch (error) {
    console.error("Order submission error:", error);
    showCheckoutNotice({
      title: "Checkout Failed",
      message: "Error saving order: " + (error?.message || "Unknown error"),
      tone: "error"
    });
  } finally {
    orderSubmissionInFlight = false;
  }
}



