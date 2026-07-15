const productId = new URLSearchParams(location.search).get('id');
const money = (value) => Number(value || 0).toLocaleString('vi-VN') + 'đ';
const safe = (value) => String(value || '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

async function loadProductDetail() {
  if (!productId) return location.href = 'products.html';
  try {
    const product = await api(`/api/products/${encodeURIComponent(productId)}`);
    document.title = `${product.name} | BlueTech`;
    document.getElementById('productDetail').innerHTML = `<div class="product-detail">
      <img src="${safe(product.image)}" alt="${safe(product.name)}">
      <div><span class="status">${product.stock > 0 ? `Còn ${product.stock} sản phẩm` : 'Hết hàng'}</span><h1>${safe(product.name)}</h1><p class="muted">${safe(product.brand)} · ${safe(product.categoryName)}</p><div class="price">${money(product.price)}</div><p>${safe(product.description)}</p>
      <div class="spec-list">${Object.entries(product.specs || {}).map(([key,value]) => `<div><b>${safe(key)}</b><span>${safe(value)}</span></div>`).join('')}</div>
      <div class="row"><input id="quantity" type="number" min="1" max="${product.stock}" value="1" style="width:80px;padding:10px"><button id="addToCart" ${product.stock < 1 ? 'disabled' : ''}>Thêm vào giỏ hàng</button></div></div>
    </div>`;
    document.getElementById('addToCart')?.addEventListener('click', async () => {
      if (!getToken()) return location.href = 'login.html';
      try {
        await api('/api/cart/items', { method: 'POST', body: { productId, quantity: Number(document.getElementById('quantity').value) } });
        showNotice('Đã thêm sản phẩm vào giỏ hàng.');
      } catch (error) { showNotice(error.message, 'error'); }
    });
    const compatibility = await api(`/api/products/${encodeURIComponent(productId)}/compatibility`);
    document.getElementById('compatibility').innerHTML = compatibility.suggestions.map((item) => `<a class="mini-product" href="product-detail.html?id=${encodeURIComponent(item.id)}"><img src="${safe(item.image)}" alt="${safe(item.name)}"><b>${safe(item.name)}</b><p class="price" style="font-size:16px">${money(item.price)}</p></a>`).join('') || '<p>Chưa có gợi ý phù hợp.</p>';
  } catch (error) { document.getElementById('productDetail').textContent = error.message; }
}
loadProductDetail();
