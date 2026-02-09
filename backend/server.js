const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { json } = require("stream/consumers");

const app = express();
app.use(cors());
app.use(express.json());

const DATA_DIR = path.join(__dirname, "data");
const PRODUCTS_FILE = path.join(DATA_DIR, "products.json");
const CART_FILE = path.join(DATA_DIR, "carts.json");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

// Ensure JSON files exist
if (!fs.existsSync(PRODUCTS_FILE)) fs.writeFileSync(PRODUCTS_FILE, JSON.stringify([], null, 2));
if (!fs.existsSync(CART_FILE)) fs.writeFileSync(CART_FILE, JSON.stringify([], null, 2));
if (!fs.existsSync(ORDERS_FILE)) fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2));

// -------------------------
// PRODUCTS
// -------------------------
app.get("/products", (req, res) => {
  const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE));
  res.json(products);
});

// -------------------------
// CART per user
// -------------------------

// Get cart by user
app.get("/cart/:userId", (req, res) => {
  const userId = req.params.userId;
  const carts = JSON.parse(fs.readFileSync(CART_FILE));
  const cart = carts.find(c => c.userId === userId) || { userId, items: [] };
  res.json(cart.items);
});

// Save cart for a user
app.post("/cart/:userId", (req, res) => {
  const userId = req.params.userId;
  const items = req.body; // array of cart items

  let carts = JSON.parse(fs.readFileSync(CART_FILE));
  const index = carts.findIndex(c => c.userId === userId);

  if (index >= 0) carts[index].items = items;
  else carts.push({ userId, items });

  fs.writeFileSync(CART_FILE, JSON.stringify(carts, null, 2));
  res.json({ status: "success", message: "Cart saved!" });
});

// -------------------------
// ORDERS
// -------------------------
app.get("/orders", (req,res)=>{
  const orders = JSON.parse(fs.readFileSync(ORDERS_FILE));
  res.json(orders);
});

app.post("/orders", (req,res)=>{
  const orders = JSON.parse(fs.readFileSync(ORDERS_FILE));
  const newOrder = req.body;
  newOrder.id = orders.length + 1;
  newOrder.createdAt = new Date().toISOString();
  orders.push(newOrder);
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders,null,2));
  res.json({status:"success", orderId:newOrder.id});
});



// -------------------------
app.listen(5000, ()=>console.log("✅ Server running on http://localhost:5000"));
