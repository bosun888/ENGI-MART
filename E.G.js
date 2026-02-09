let cart = [];

// Get logged-in user

const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
fetch(`http://localhost:5000/cart/${currentUser.id}`)


// Load cart from backend on page load
async function loadCart() {
  if (!currentUser) return; // Not logged in
  try {
    const res = await fetch(`http://localhost:5000/cart/${currentUser.id}`);
    cart = await res.json();
    updateCart();
  } catch {
    cart = [];
    updateCart();
  }
}

// Save cart to backend
async function saveCart() {
  if (!currentUser) return;
  await fetch(`http://localhost:5000/cart/${currentUser.id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cart)
  });
}

// Add item to cart
function addToCart(name, price) {
  const existing = cart.find(item => item.name === name);
  if (existing) existing.quantity += 1;
  else cart.push({ name, price, quantity: 1 });

  updateCart();
  saveCart();
}

// Update cart UI
function updateCart() {
  const cartItemsEl = document.getElementById("cartItems");
  const totalEl = document.getElementById("total");
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
      <button onclick="removeItem(${idx})">Remove</button>
    `;
    cartItemsEl.appendChild(row);
  });

  totalEl.textContent = total.toLocaleString();
}

// Remove item
function removeItem(idx) {
  cart.splice(idx, 1);
  updateCart();
  saveCart();
}

// Checkout
function checkout() {
  if (!currentUser) {
    alert("Please log in to checkout!");
    window.location.href = "login.html";
    return;
  }
  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  window.location.href = "checkout.html";
}

// Load cart when page loads
window.onload = loadCart;
