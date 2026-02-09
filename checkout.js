// Load cart from localStorage
let cart = JSON.parse(localStorage.getItem("cart")) || [];
const cartItemsEl = document.getElementById("cartItems");
const totalEl = document.getElementById("total");
const cartTable = document.getElementById("cartTable");
const cartEmptyEl = document.getElementById("cartEmpty");
const paymentForm = document.getElementById("paymentForm");

function displayCart() {
  cartItemsEl.innerHTML = "";
  let total = 0;

  if(cart.length === 0){
    cartTable.style.display = "none";
    cartEmptyEl.style.display = "block";
    totalEl.textContent = "0";
    return;
  } else {
    cartTable.style.display = "table";
    cartEmptyEl.style.display = "none";
  }

  cart.forEach(item => {
    const quantity = item.quantity || 1;
    const subtotal = item.price * quantity;
    total += subtotal;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.name}</td>
      <td>${item.price.toLocaleString()}</td>
      <td>${quantity}</td>
      <td>${subtotal.toLocaleString()}</td>
    `;
    cartItemsEl.appendChild(row);
  });

  totalEl.textContent = total.toLocaleString();
}

displayCart();

// --------------------
// Paystack Payment
// --------------------
paymentForm.addEventListener("submit", function(e){
  e.preventDefault();
  if(cart.length === 0){
    alert("Your cart is empty!");
    return;
  }

  const email = document.getElementById("email").value;
  const fullName = document.getElementById("fullName").value;
  const totalAmount = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0) * 100; // kobo

  const handler = PaystackPop.setup({
    key: "pk_test_xxxxxxxxxxxxxxxxxxxxx", // Replace with your Paystack test key
    email: email,
    amount: totalAmount,
    currency: "NGN",
    ref: "ENGI" + Math.floor(Math.random() * 1000000000),
    metadata: {
      custom_fields: [
        { display_name: "Full Name", variable_name: "full_name", value: fullName }
      ]
    },
    callback: function(response){
      saveOrder(email, fullName, response.reference);
    },
    onClose: function(){
      alert("Payment window closed.");
    }
  });

  handler.openIframe();
});

// --------------------
// Save order to backend
// --------------------
async function saveOrder(email, fullName, reference) {
  try {
    const res = await fetch("http://localhost:5000/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer: { email, fullName },
        cart: cart,
        reference: reference
      })
    });

    const data = await res.json();
    alert(`Payment successful! Order ID: ${data.orderId}`);

    // Clear cart after payment
    cart = [];
    localStorage.setItem("cart", JSON.stringify(cart));
    displayCart();

    // Optionally redirect to a Thank You page
    window.location.href = "thankyou.html";

  } catch(err){
    console.error(err);
    alert("Error saving order. Contact support.");
  }
}
