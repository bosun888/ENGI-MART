// products.js
const productGrid = document.getElementById("productGrid");
const paginationEl = document.getElementById("pagination");
const searchInput = document.getElementById("search");

let products = [];
let filteredProducts = [];
let currentPage = 1;
const productsPerPage = 20;


// ==========================
// Load products
// ==========================
async function loadProducts() {
  try {
    const res = await fetch("http://localhost:5000/products");
    products = await res.json();

    filteredProducts = [...products];
    displayProducts(currentPage);

  } catch (err) {
    console.error(err);
    productGrid.innerHTML = "<p>Failed to load products.</p>";
  }
}


// ==========================
// Display products
// ==========================
function displayProducts(page = 1) {
  productGrid.innerHTML = "";

  const start = (page - 1) * productsPerPage;
  const end = start + productsPerPage;

  const productsToShow = filteredProducts.slice(start, end);

  if (!productsToShow.length) {
    productGrid.innerHTML = "<p>No products found.</p>";
    paginationEl.innerHTML = "";
    return;
  }

  productsToShow.forEach(product => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${product.img || 'https://via.placeholder.com/300'}" />
      <h3>${product.name}</h3>
      <p>${product.description}</p>
      <p class="price">₦${product.price.toLocaleString()}</p>
      <button onclick="addToCart('${product.name}', ${product.price})">
        Add to Cart
      </button>
    `;

    productGrid.appendChild(card);
  });

  renderPagination();
}


// ==========================
// Pagination
// ==========================
function renderPagination() {
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  paginationEl.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;

    if (i === currentPage) btn.style.fontWeight = "bold";

    btn.onclick = () => {
      currentPage = i;
      displayProducts(i);
    };

    paginationEl.appendChild(btn);
  }
}


// ==========================
// Filters
// ==========================
function filterByCategory(category) {
  currentPage = 1;

  if (category === "All") {
    filteredProducts = [...products];
  } else {
    filteredProducts = products.filter(p => p.category === category);
  }

  applyFilters();
}

function applyFilters() {
  const query = searchInput.value.toLowerCase();

  filteredProducts = filteredProducts.filter(p =>
    p.name.toLowerCase().includes(query)
  );

  displayProducts(currentPage);
}


// ==========================
// Search
// ==========================
searchInput.addEventListener("input", () => {
  currentPage = 1;
  filteredProducts = [...products];
  applyFilters();
});


// ==========================
loadProducts();
