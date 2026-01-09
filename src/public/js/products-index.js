import { apiFetch } from "/js/api.js";

const grid = document.getElementById("productGrid");
const pagination = document.getElementById("pagination");
const categorySelect = document.getElementById("categorySelect");
const count=document.getElementById("count");

async function loadProducts(query = "") {
  try {
  
    const data = await apiFetch("/v1/products/api" + query);


    categorySelect.innerHTML = `<option value="">All Categories</option>`;

    data.categories.forEach(c => {
      categorySelect.innerHTML += `
        <option value="${c.id}">
          ${c.name}
        </option>
      `;
    });

   
    grid.innerHTML = "";

    if (!data.products || data.products.length === 0) {
      grid.innerHTML = "<p>No products found</p>";
      pagination.innerHTML = "";
      return;
    }

    data.products.forEach(p => {
      grid.innerHTML += `
        <div class="card">
          ${
            p.ProductImages.length
              ? `<img src="${p.ProductImages[0].path}" />`
              : ""
          }

          <h3>${p.title}</h3>
          <p>₹ ${p.price}</p>
          <p>${p.Category.name}</p>
          <p>Available: ${p.qtyAvailable}</p>

          ${
            p.qtyAvailable === 0
              ? `<p>Out of stock</p>`
              : ""
          }

          <a href="/v1/products/${p.id}">
            View
          </a>
        </div>
      `;
    });

    
    pagination.innerHTML = "";

    for (let i = 1; i <= data.totalPages; i++) {
      pagination.innerHTML += `
        <a onclick="loadProducts('?page=${i}')">
          ${i}
        </a>
      `;
    }

  } catch (err) {
    console.error("Load products failed:", err);
  }
}

document
  .getElementById("filterForm")
  .addEventListener("submit", e => {
    e.preventDefault();

    const params = new URLSearchParams(
      new FormData(e.target)
    ).toString();

    loadProducts("?" + params);
  });


document.getElementById("logoutBtn").onclick = async () => {
  try {
    await apiFetch("/v1/auth/logout", {
      method: "POST"
    });
  } finally {
    window.location.href = "/v1/auth/login";
  }
};

loadProducts();
