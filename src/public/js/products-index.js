import { apiFetch } from "/js/api.js";

const grid = document.getElementById("productGrid");
const pagination = document.getElementById("pagination");
const categorySelect = document.getElementById("categorySelect");

async function loadProducts(query = "") {
  try {
    // normalize params: if query is empty use current window search
    const paramString = query && query.length ? query.replace(/^\?/, "") : window.location.search.replace(/^\?/, "");
    const params = new URLSearchParams(paramString);
    const selectedCategory = params.get("category") || "";

    const data = await apiFetch("/v1/products/api" + (paramString ? `?${paramString}` : ""));

    // render category select and preserve the selected option
    categorySelect.innerHTML = `<option value="" ${selectedCategory === "" ? "selected" : ""}>All Categories</option>`;

    data.categories.forEach(c => {
      const isSelected = String(c.id) === String(selectedCategory) ? "selected" : "";
      categorySelect.innerHTML += `
        <option value="${c.id}" ${isSelected}>
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
      const productImage = p.ProductImages.length 
        ? `<img src="${p.ProductImages[0].path}" class="product-image" alt="${p.title}" />` 
        : `<div class="product-image" style="display: flex; align-items: center; justify-content: center; color: var(--text-muted);">No Image</div>`;

      grid.innerHTML += `
        <div class="product-card">
          <a href="/v1/products/${p.id}">
            ${productImage}
          </a>
          <div class="product-info">
            <h3 class="product-title" style="margin-bottom: 4px; font-size: 1rem;">
              <a href="/v1/products/${p.id}">${p.title}</a>
            </h3>
            <p class="text-muted" style="font-size: 0.875rem; margin-bottom: 8px;">${p.Category.name}</p>
            
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: auto;">
              <span class="product-price">₹ ${p.price}</span>
              ${
                p.qtyAvailable > 0
                  ? `<span style="font-size: 0.75rem; color: var(--success); background: #ecfdf5; padding: 2px 6px; border-radius: 4px;">In Stock</span>`
                  : `<span style="font-size: 0.75rem; color: var(--danger); background: #fef2f2; padding: 2px 6px; border-radius: 4px;">Out of Stock</span>`
              }
            </div>
          </div>
        </div>
      `;
    });

    
    pagination.innerHTML = "";

    // render pagination while preserving current filters
    for (let i = 1; i <= data.totalPages; i++) {
      const pageParams = new URLSearchParams(params.toString());
      pageParams.set("page", i);
      pagination.innerHTML += `
        <a onclick="loadProducts('?${pageParams.toString()}')">
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

const countCart = document.getElementById("count");

async function cartCount() {
  const data = await apiFetch("/v1/cart/count");
  console.log(data);
  countCart.innerText = data.count;
}
cartCount();


loadProducts();
