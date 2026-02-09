import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";

import Header from "./components/HEADER.JSX";
import Footer from "./components/Footer";
import React from "react";
import Home from "./pages/Home";
import Products from "./pages/Products";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";

import "./index.css";
import Header from "./components/HEADER.JSX";

function App() {
  return (
    <CartProvider> {/* Make sure CartProvider wraps everything that uses useCart */}
      <Router> {/* Router must wrap all components that use Link/Routes */}
        <Header /> {/* Header can safely use useCart */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/success" element={<OrderSuccess />} />
        </Routes>
        <Footer />
      </Router>
    </CartProvider>
  );
}
export default App;     