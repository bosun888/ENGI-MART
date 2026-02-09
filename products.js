// products.js
const productGrid = document.getElementById("productGrid");
const paginationEl = document.getElementById("pagination");
const searchInput = document.getElementById("search");
const cartItemsEl = document.getElementById("cartItems");
const totalEl = document.getElementById("total");

let products = [];
let filteredProducts = [];
let cart = [];
let currentPage = 1;
const productsPerPage = 20;

// --------------------------
// Load products from backend
// --------------------------
async function loadProducts() {
  try {
    const res = await fetch("http://localhost:5000/products");
    products = await res.json();
    filteredProducts = [...products];
    displayProducts(currentPage);
  } catch (err) {
    console.error("Error loading products:", err);
    productGrid.innerHTML = "<p>Failed to load products. Check backend.</p>";
  }
}

// --------------------------
// Display products
// --------------------------
function displayProducts(page = 1) {
  productGrid.innerHTML = "";

  const start = (page - 1) * productsPerPage;
  const end = start + productsPerPage;
  const productsToShow = filteredProducts.slice(start, end);

  if (productsToShow.length === 0) {
    productGrid.innerHTML = "<p>No products found.</p>";
    paginationEl.innerHTML = "";
    return;
  }

  productsToShow.forEach(product => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${product.img || 'https://via.placeholder.com/150'}" alt="${product.name}" style="width:100%;height:150px;object-fit:cover;margin-bottom:10px;" />
      <h3>${product.name}</h3>
      <p>${product.description}</p>
      <p class="price">₦${product.price.toLocaleString()}</p>
      <button onclick="addToCart('${product.name}', ${product.price})">Add to Cart</button>
    `;

    productGrid.appendChild(card);
  });

  renderPagination();
}

// --------------------------
// Render pagination
// --------------------------
function renderPagination() {
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  paginationEl.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    if (i === currentPage) btn.style.fontWeight = "bold";
    btn.onclick = () => {
      currentPage = i;
      displayProducts(currentPage);
    };
    paginationEl.appendChild(btn);
  }
}

// --------------------------
// Filter by category
// --------------------------
function filterByCategory(category) {
  currentPage = 1;
  if (category === "All") {
    filteredProducts = [...products];
  } else {
    filteredProducts = products.filter(p => p.category === category);
  }
  applyFilters();
}

// --------------------------
// Apply search filter
// --------------------------
function applyFilters() {
  const query = searchInput.value.toLowerCase();
  filteredProducts = filteredProducts.filter(p => p.name.toLowerCase().includes(query));
  displayProducts(currentPage);
}

// --------------------------
// Cart functions
// --------------------------
function addToCart(name, price) {
  const existing = cart.find(item => item.name === name);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ name, price, quantity: 1 });
  }
  updateCartUI();
}

function updateCartUI() {
  cartItemsEl.innerHTML = "";
  let total = 0;
  cart.forEach(item => {
    const div = document.createElement("div");
    div.textContent = `${item.name} x ${item.quantity} = ₦${(item.price * item.quantity).toLocaleString()}`;
    cartItemsEl.appendChild(div);
    total += item.price * item.quantity;
  });
  totalEl.textContent = total.toLocaleString();
}

function checkout() {
  if (cart.length === 0) {
    alert("Cart is empty!");
    return;
  }
  alert("Checkout successful! Total: ₦" + totalEl.textContent);
  cart = [];
  updateCartUI();
}

// --------------------------
// Event listener for search input
// --------------------------
searchInput.addEventListener("input", () => {
  currentPage = 1;
  filteredProducts = [...products];
  applyFilters();
});

// --------------------------
// Initial load
// --------------------------
loadProducts();
