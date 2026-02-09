import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Checkout() {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", address: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    clearCart();
    navigate("/success");
  };

  return (
    <div className="container">
      <h2>Checkout</h2>
      <form onSubmit={handleSubmit} className="checkout-form">
        <input
          type="text"
          placeholder="Full Name"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <textarea
          placeholder="Address"
          required
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />
        <button type="submit">Place Order</button>
      </form>
    </div>
  );
}
