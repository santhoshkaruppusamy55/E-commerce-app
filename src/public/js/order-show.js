import { apiFetch } from "/js/api.js";

const orderId = location.pathname.split("/").pop();

async function loadOrder() {
  try {
    const data = await apiFetch(`/v1/orders/data/${orderId}`);

    if (!data) return;

    const { order } = data;

    document.getElementById("orderTitle").innerText =
      `Order #${order.id}`;

    document.getElementById("orderMeta").innerHTML = `
      <p><strong>Placed on:</strong>
        ${new Date(order.createdAt).toDateString()}</p>
      <p><strong>Total:</strong> ₹ ${order.total}</p>
    `;

    document.getElementById("shipping").innerHTML = `
      <p><strong>Name:</strong> ${order.shippingName}</p>
      <p><strong>Email:</strong> ${order.shippingEmail}</p>
      <p><strong>Phone:</strong> ${order.shippingPhone}</p>
      <p><strong>Address:</strong> ${order.shippingAddress}</p>
    `;

    const tbody = document.getElementById("itemsBody");
    tbody.innerHTML = "";

    order.OrderItems.forEach(item => {
      tbody.innerHTML += `
        <tr>
          <td>${item.Product.title}</td>
          <td class="right">${item.qty}</td>
          <td class="right">₹ ${item.unitPrice}</td>
          <td class="right">
            ₹ ${(item.qty * item.unitPrice).toFixed(2)}
          </td>
        </tr>
      `;
    });

    document.getElementById("orderTotal").innerText =
      `₹ ${order.total}`;

  } catch (err) {
    console.error("Load order failed:", err);
    window.location.href = "/v1/orders";
  }
}

loadOrder();
