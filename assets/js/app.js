// assets/js/app.js
// Shared utilities: cart, rendering helpers, analytics placeholders, accessibility helpers.

const $$ = (sel, root = document) => root.querySelector(sel);
const $$$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const CART_KEY = "souqsmart_cart_v1";
const NEWS_KEY = "souqsmart_newsletter_v1";
const CHAT_RATE_KEY = "souqsmart_chat_rate_v1";

function formatAED(n) {
  return `AED ${Math.round(Number(n) || 0)}`;
}

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch {
    return [];
  }
}
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}
function addToCart(productId, qty = 1) {
  const cart = loadCart();
  const found = cart.find((x) => x.id === productId);
  if (found) found.qty += qty;
  else cart.push({ id: productId, qty });
  saveCart(cart);
  toast("Added to cart ✓");
}
function removeFromCart(productId) {
  const cart = loadCart().filter((x) => x.id !== productId);
  saveCart(cart);
}
function clearCart() {
  saveCart([]);
}
function cartCount() {
  return loadCart().reduce((s, x) => s + x.qty, 0);
}
function cartTotal(products) {
  const cart = loadCart();
  let total = 0;
  for (const item of cart) {
    const p = products.find((x) => x.id === item.id);
    if (p) total += p.price * item.qty;
  }
  return total;
}
function updateCartBadge() {
  const el = $$("#cartBadge");
  if (!el) return;
  const c = cartCount();
  el.textContent = c;
  el.style.display = c > 0 ? "inline-flex" : "none";
}

function toast(msg) {
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.classList.add("show"), 10);
  setTimeout(() => {
    t.classList.remove("show");
    setTimeout(() => t.remove(), 250);
  }, 2200);
}

// URL helpers
function getParam(name) {
  const u = new URL(window.location.href);
  return u.searchParams.get(name);
}

// Newsletter (marketing automation placeholder)
function subscribeNewsletter(email) {
  const list = JSON.parse(localStorage.getItem(NEWS_KEY) || "[]");
  list.push({ email, ts: Date.now() });
  localStorage.setItem(NEWS_KEY, JSON.stringify(list));
}

// Analytics placeholders: GA4 + Meta Pixel hooks (mock)
function track(eventName, payload = {}) {
  // In production: send to GA4 / Meta Pixel
  console.log("[Analytics]", eventName, payload);
}

// Accessibility: reduce motion preference
function prefersReducedMotion() {
  return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// Initialize global UI
document.addEventListener("DOMContentLoaded", () => {
  updateCartBadge();

  // Navbar mobile menu
  const burger = $$("#burger");
  const mobileNav = $$("#mobileNav");
  if (burger && mobileNav) {
    burger.addEventListener("click", () => {
      mobileNav.classList.toggle("open");
      burger.setAttribute("aria-expanded", mobileNav.classList.contains("open") ? "true" : "false");
    });
  }
});
