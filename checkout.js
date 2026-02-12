// checkout.js

const stripe = Stripe("YOUR_STRIPE_PUBLISHABLE_KEY"); // Replace with your key
const cart = JSON.parse(sessionStorage.getItem("currentCart")) || [];
const checkoutItemsEl = document.getElementById("checkoutItems");
const totalAmountEl = document.getElementById("totalAmount");
const payBtn = document.getElementById("payBtn");

// Display cart items
function displayCart() {
  checkoutItemsEl.innerHTML = "";
  let total = 0;

  if(cart.length === 0) {
    checkoutItemsEl.innerHTML = `<tr><td colspan="4">Your cart is empty</td></tr>`;
    totalAmountEl.textContent = "0";
    payBtn.disabled = true;
    return;
  }

  cart.forEach(item => {
    const qty = item.quantity || 1;
    const subtotal = item.price * qty;
    total += subtotal;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.name}</td>
      <td>₦${item.price.toLocaleString()}</td>
      <td>${qty}</td>
      <td>₦${subtotal.toLocaleString()}</td>
    `;
    checkoutItemsEl.appendChild(row);
  });

  totalAmountEl.textContent = total.toLocaleString();
  payBtn.disabled = false;
}

displayCart();

// Stripe Checkout
payBtn.addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  if(!email) return alert("Please enter your email");
  if(cart.length === 0) return alert("Cart is empty!");

  try {
    const res = await fetch("http://192.168.17.1:5000/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cart, customerEmail: email })
    });

    const data = await res.json();
    if(data.id) {
      // Redirect to Stripe Checkout
      const { error } = await stripe.redirectToCheckout({ sessionId: data.id });
      if(error) console.error(error.message);
    } else {
      console.error("No session ID returned from backend");
      alert("Failed to initiate payment");
    }
  } catch(err) {
    console.error("Stripe error:", err);
    alert("Payment failed");
  }
});
