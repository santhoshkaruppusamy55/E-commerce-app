import { apiFetch } from "/js/api.js";


async function loadCart() {
  try {
    const data = await apiFetch("/v1/cart/data");

    const body = document.getElementById("cartBody");
    body.innerHTML = "";
    let total = 0;

    if (!data.cart || data.cart.CartItems.length === 0) {
      body.innerHTML = "<tr><td colspan='5'>Cart is empty</td></tr>";
      document.getElementById("total").innerText = "";
      return;
    }

    data.cart.CartItems.forEach(item => {
      const sub = item.qty * item.unitPrice;
      total += sub;

      body.innerHTML += `
        <tr>
          <td>${item.Product.title}</td>
          <td>${item.unitPrice}</td>
          <td>
            <input type="number" value="${item.qty}" min="1" id="qty-${item.id}">
            <button onclick="updateItem(${item.id})">Update</button>
          </td>
          <td>${sub}</td>
          <td>
            <button onclick="removeItem(${item.id})">Remove</button>
          </td>
        </tr>
      `;
    });

    document.getElementById("total").innerText = "Total: ₹ " + total;

  } catch (err) {
    alert(err.message);
  }
}


async function updateItem(id) {
  try {
    const qty = document.getElementById(`qty-${id}`).value;

    await apiFetch(`/v1/cart/items/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ qty })
    });

    alert("Cart updated successfully");
    loadCart();

  } catch (err) {
    alert(err.message);
  }
}


async function removeItem(id) {
  try {
    await apiFetch(`/v1/cart/items/${id}`, {
      method: "DELETE"
    });

    alert("Item removed from cart");
    loadCart();

  } catch (err) {
    alert(err.message);
  }
}

function goCheckout() {
  window.location.href = "/v1/cart/items";
}

window.updateItem = updateItem;
window.removeItem = removeItem;
window.goCheckout = goCheckout;

loadCart();
