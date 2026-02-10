// server.js
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const stripe = require("stripe")("YOUR_STRIPE_SECRET_KEY"); // replace with your Stripe secret key

const app = express();
app.use(cors());
app.use(express.json());

// =========================
// Config
// =========================
const SECRET_KEY = "YOUR_SECRET_KEY"; // change in production
const DATA_DIR = path.join(__dirname, "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const PRODUCTS_FILE = path.join(DATA_DIR, "products.json");
const CART_FILE = path.join(DATA_DIR, "carts.json");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");
const STRIPE_WEBHOOK_SECRET = "YOUR_STRIPE_WEBHOOK_SECRET"; // get from Stripe dashboard

// =========================
// Ensure data folder/files exist
// =========================
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
[USERS_FILE, PRODUCTS_FILE, CART_FILE, ORDERS_FILE].forEach(file => {
  if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify([], null, 2));
});

// =========================
// Helpers
// =========================
const readJSON = (file) => JSON.parse(fs.readFileSync(file));
const writeJSON = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2));
const generateId = () => Math.random().toString(36).substring(2, 10);

// =========================
// JWT Middleware
// =========================
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user;
    next();
  });
}

// =========================
// USERS
// =========================

// Signup
app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: "Missing fields" });

  const users = readJSON(USERS_FILE);
  if (users.find(u => u.email === email)) return res.status(400).json({ message: "Email already registered" });

  const passwordHash = await bcrypt.hash(password, 10);
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit

  const newUser = {
    id: generateId(),
    name,
    email,
    passwordHash,
    verified: false,
    verificationCode
  };

  users.push(newUser);
  writeJSON(USERS_FILE, users);

  // TODO: send verification email here
  console.log(`Send verification code ${verificationCode} to ${email}`);

  res.json({ message: "Signup successful. Verify your email with the code sent." });
});

// Verify Email
app.post("/verify", (req, res) => {
  const { email, code } = req.body;
  const users = readJSON(USERS_FILE);
  const user = users.find(u => u.email === email);
  if (!user) return res.status(404).json({ message: "User not found" });
  if (user.verified) return res.json({ message: "Already verified" });

  if (user.verificationCode === code) {
    user.verified = true;
    user.verificationCode = null;
    writeJSON(USERS_FILE, users);
    return res.json({ message: "Email verified successfully!" });
  } else {
    return res.status(400).json({ message: "Invalid verification code" });
  }
});

// Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const users = readJSON(USERS_FILE);
  const user = users.find(u => u.email === email);
  if (!user) return res.status(404).json({ message: "User not found" });
  if (!user.verified) return res.status(403).json({ message: "Please verify your email first" });

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return res.status(401).json({ message: "Incorrect password" });

  const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, SECRET_KEY, { expiresIn: "2h" });

  res.json({ message: "Login successful", token, user: { id: user.id, name: user.name, email: user.email } });
});

// =========================
// PRODUCTS
// =========================
app.get("/products", (req, res) => {
  res.json(readJSON(PRODUCTS_FILE));
});

// =========================
// CART (protected)
// =========================
app.get("/cart", authenticateToken, (req, res) => {
  const carts = readJSON(CART_FILE);
  const userCart = carts.find(c => c.userId === req.user.id) || { userId: req.user.id, items: [] };
  res.json(userCart.items);
});

app.post("/cart", authenticateToken, (req, res) => {
  const carts = readJSON(CART_FILE);
  const index = carts.findIndex(c => c.userId === req.user.id);

  if (index >= 0) {
    carts[index].items = req.body;
  } else {
    carts.push({ userId: req.user.id, items: req.body });
  }

  writeJSON(CART_FILE, carts);
  res.json({ status: "success", message: "Cart saved" });
});

// =========================
// ORDERS (protected)
// =========================
app.get("/orders", authenticateToken, (req, res) => {
  const orders = readJSON(ORDERS_FILE);
  const userOrders = orders.filter(o => o.userId === req.user.id);
  res.json(userOrders);
});

app.post("/orders", authenticateToken, (req, res) => {
  const orders = readJSON(ORDERS_FILE);
  const newOrder = {
    id: orders.length + 1,
    userId: req.user.id,
    customer: req.user,
    cart: req.body.cart,
    total: req.body.cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0),
    createdAt: new Date().toISOString(),
    status: "pending"
  };
  orders.push(newOrder);
  writeJSON(ORDERS_FILE, orders);
  res.json({ status: "success", orderId: newOrder.id });
});

// =========================
// STRIPE CHECKOUT
// =========================
app.post("/create-checkout-session", authenticateToken, async (req, res) => {
  const { cart, customerEmail } = req.body;
  if (!cart || cart.length === 0) return res.status(400).json({ message: "Cart is empty" });

  const line_items = cart.map(item => ({
    price_data: {
      currency: "ngn",
      product_data: { name: item.name },
      unit_amount: item.price * 100
    },
    quantity: item.quantity || 1
  }));

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      customer_email: customerEmail,
      success_url: "http://localhost:5500/thankyou.html",
      cancel_url: "http://localhost:5500/checkout.html",
      metadata: {
        userId: req.user.id,
        cart: JSON.stringify(cart)
      }
    });

    res.json({ id: session.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Stripe checkout failed" });
  }
});

// =========================
// STRIPE WEBHOOK
// =========================
app.post("/webhook", express.raw({ type: "application/json" }), (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orders = readJSON(ORDERS_FILE);

    const newOrder = {
      id: orders.length + 1,
      userId: session.metadata?.userId,
      userEmail: session.customer_email,
      stripeSessionId: session.id,
      cart: session.metadata?.cart ? JSON.parse(session.metadata.cart) : [],
      createdAt: new Date().toISOString(),
      status: "paid"
    };

    orders.push(newOrder);
    writeJSON(ORDERS_FILE, orders);
    console.log("✅ Stripe order saved:", newOrder.id);
  }

  res.json({ received: true });
});

// =========================
// START SERVER
// =========================
app.listen(5000, () => console.log("✅ Backend running on http://localhost:5000"));
