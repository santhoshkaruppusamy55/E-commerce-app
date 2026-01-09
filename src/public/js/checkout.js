import { apiFetch } from "/js/api.js";

async function loadCheckout() {
  try {
    const data = await apiFetch("/v1/cart/data");

    if (!data.cart || data.cart.CartItems.length === 0) {
      window.location.href = "/v1/cart";
      return;
    }

    let total = 0;
    const ul = document.getElementById("summary");
    ul.innerHTML = "";

    data.cart.CartItems.forEach(item => {
      const sub = item.qty * item.unitPrice;
      total += sub;

      ul.innerHTML += `
        <li>
          ${item.Product.title} —
          ${item.qty} × ₹${item.unitPrice} = ₹${sub.toFixed(2)}
        </li>
      `;
    });

    document.getElementById("total").innerText =
      "Total: ₹ " + total.toFixed(2);

  } catch (err) {
    alert(err.message);
  }
}

document.getElementById("orderForm").onsubmit = async (e) => {
  e.preventDefault();

  try {
    const formData = new FormData(e.target);

    await apiFetch("/v1/orders", {
      method: "POST",
       headers: {
        "Content-Type": "application/x-www-form-urlencoded"
       },
      body: new URLSearchParams(formData)
    });

    window.location.href = "/v1/orders";

  } catch (err) {
    alert(err.message);
  }
};

loadCheckout();
