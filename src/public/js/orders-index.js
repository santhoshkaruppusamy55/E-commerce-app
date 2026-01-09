import { apiFetch } from "/js/api.js";

async function loadOrders(page = 1) {
  try {
    const data = await apiFetch(`/v1/orders/data?page=${page}`);

    if (!data) return;

    const tbody = document.querySelector("#ordersTable tbody");
    const pagination = document.getElementById("pagination");

    tbody.innerHTML = "";
    pagination.innerHTML = "";

    if (!data.orders || data.orders.length === 0) {
      tbody.innerHTML =
        "<tr><td colspan='4'>You have not placed any orders yet.</td></tr>";
      return;
    }

    data.orders.forEach(order => {
      const date = new Date(order.createdAt).toDateString();

      tbody.innerHTML += `
        <tr>
          <td>#${order.id}</td>
          <td class="total">₹ ${order.total}</td>
          <td>${date}</td>
          <td>
            <a href="/v1/orders/${order.id}">View</a>
          </td>
        </tr>
      `;
    });

    for (let i = 1; i <= data.totalPages; i++) {
      pagination.innerHTML += `
        <a class="${i === data.currentPage ? "active" : ""}"
           onclick="loadOrders(${i})">
          ${i}
        </a>
      `;
    }

  } catch (err) {
    console.error("Load orders failed:", err);
  }
}

loadOrders();
