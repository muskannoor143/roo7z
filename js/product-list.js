// product-list.js
// Ye file tumhare HTML me <script src="product-list.js"></script> ke through load hogi

// ---------------- WAIT UNTIL PRODUCTS ARE LOADED ----------------
function waitForProducts(callback) {
  if (window.allProducts && Object.keys(window.allProducts).length > 0) {
    callback();
  } else {
    setTimeout(() => waitForProducts(callback), 200);
  }
}

waitForProducts(() => {
  renderProductList();
});

// ---------------- RENDER ALL PRODUCTS ----------------
function renderProductList() {
  const container = document.getElementById("products-container");
  if (!container) return;

  container.innerHTML = ""; // clear previous content

  Object.keys(allProducts).forEach(categoryKey => {
    const products = allProducts[categoryKey];
    products.forEach(product => {
      const card = document.createElement("div");
      card.className = "product-card";

      // Inner HTML for the card
      card.innerHTML = `
        <img src="${product.img || product.images?.[0] || 'images/roo7z-logo.png'}" alt="${product.title}">
        <h3>${product.title}</h3>
        <p>${product.discount ? `<span class="discount">${product.discount}% off</span>` : ''} ${product.pricePKR ? product.pricePKR + '₨' : product.price || 0 + '₨'}</p>
      `;

      // Click to go to preview page
      card.addEventListener("click", () => {
        const params = new URLSearchParams();
        params.set("id", product.id);
        if (product.category) params.set("category", product.category);
        window.location.href = `product-preview.html?${params.toString()}`;
      });

      container.appendChild(card);
    });
  });
}
