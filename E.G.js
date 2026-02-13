/* =========================
   GLOBAL CART
========================= */
let cart = [];


/* =========================
   CURRENT USER (safe)
========================= */
const currentUser =
  JSON.parse(sessionStorage.getItem("currentUser")) || null;


/* =========================
   LOAD CART FROM BACKEND
========================= */
async function loadCart() {
  if (!currentUser) {
    updateCart();
    return;
  }

  try {
    const res = await fetch(
      `http://192.168.17.1:5000/cart/${currentUser.id}`
    );

    cart = await res.json();
  } catch (err) {
    console.log("Cart load failed");
    cart = [];
  }

  updateCart();
}


/* =========================
   SAVE CART TO BACKEND
========================= */
async function saveCart() {
  if (!currentUser) return;

  await fetch(`http://192.168.17.1:5000/cart/${currentUser.id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cart)
  });
}


/* =========================
   ADD TO CART
========================= */
function addToCart(name, price) {
  const existing = cart.find(item => item.name === name);

  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ name, price, quantity: 1 });
  }

  updateCart();
  saveCart();
  showToast("Added to cart ✓");
}


/* =========================
   REMOVE ITEM
========================= */
function removeItem(idx) {
  cart.splice(idx, 1);

  updateCart();
  saveCart();
}


/* =========================
   UPDATE UI
========================= */
function updateCart() {
  const cartItemsEl = document.getElementById("cartItems");
  const totalEl = document.getElementById("total");

  if (!cartItemsEl || !totalEl) return;

  cartItemsEl.innerHTML = "";

  let total = 0;

  cart.forEach((item, idx) => {
    const subtotal = item.price * item.quantity;
    total += subtotal;

    const row = document.createElement("div");
    row.className = "cart-item";

    row.innerHTML = `
      <span>${item.name} x ${item.quantity}</span>
      <span>₦${subtotal.toLocaleString()}</span>
      <button onclick="removeItem(${idx})">✕</button>
    `;

    cartItemsEl.appendChild(row);
  });

  totalEl.textContent = total.toLocaleString();
}


/* =========================
   CHECKOUT
========================= */
function checkout() {
  if (!currentUser) {
    alert("Please log in first!");
    window.location.href = "login.html";
    return;
  }

  if (currentUser) {
    saveCart();
  }

  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  window.location.href = "checkout.html";
}


/* =========================
   TOAST NOTIFICATION
========================= */
function showToast(msg) {
  let toast = document.querySelector(".notification");

  if (!toast) {
    toast = document.createElement("div");
    toast.className = "notification";
    document.body.appendChild(toast);
  }

  toast.textContent = msg;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 1500);
}


/* =========================
   HAMBURGER MENU
========================= */
function setupMenu() {
  const toggle = document.getElementById("menuToggle");
  const nav = document.getElementById("navMenu");

  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    nav.classList.toggle("show");
  });
}


/* =========================
   INIT WHEN PAGE LOADS
========================= */
window.addEventListener("DOMContentLoaded", () => {
  setupMenu();
  loadCart();
});
