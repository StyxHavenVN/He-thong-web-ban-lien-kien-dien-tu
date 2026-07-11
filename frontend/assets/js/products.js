async function loadCategories() {
  const categories = await api('/api/products/categories');
  const select = document.querySelector('#category');
  select.innerHTML = '<option value="">Tất cả danh mục</option>' + categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
}

async function loadProducts() {
  const params = new URLSearchParams();
  const search = document.querySelector('#search')?.value;
  const category = document.querySelector('#category')?.value;
  const minPrice = document.querySelector('#minPrice')?.value;
  if (search) params.set('search', search);
  if (category) params.set('category', category);
  if (minPrice) params.set('minPrice', minPrice);
  const products = await api('/api/products?' + params.toString());
  const root = document.querySelector('#products');
  root.innerHTML = products.map(p => `
    <article class="card">
      <img src="${p.image}" alt="${p.name}">
      <div class="card-body">
        <span class="badge">${p.categoryName}</span>
        <h3>${p.name}</h3>
        <p class="muted">${p.brand} • Còn ${p.stock}</p>
        <p class="price">${formatMoney(p.price)}</p>
        <p class="muted">${p.description}</p>
        <div class="row">
          <button onclick="addToCart('${p.id}')">Thêm vào giỏ</button>
          <button class="secondary" onclick="showRecommendations('${p.id}')">Gợi ý</button>
        </div>
        <div id="rec-${p.id}" class="muted" style="margin-top:10px"></div>
      </div>
    </article>
  `).join('') || '<p>Không tìm thấy sản phẩm.</p>';
}

async function addToCart(productId) {
  if (!getUser()) return location.href = 'login.html';
  try {
    await api('/api/cart/items', { method: 'POST', body: JSON.stringify({ productId, quantity: 1 }) });
    showNotice('Đã thêm sản phẩm vào giỏ hàng.');
  } catch (err) { showNotice(err.message, 'error'); }
}

async function showRecommendations(productId) {
  const root = document.querySelector(`#rec-${productId}`);
  try {
    const data = await api(`/api/products/${productId}/recommendations`);
    root.innerHTML = data.length ? '<b>Gợi ý tương thích:</b> ' + data.map(p => p.name).join(', ') : 'Chưa có linh kiện tương thích.';
  } catch (err) { root.textContent = err.message; }
}

document.addEventListener('DOMContentLoaded', async () => { await loadCategories(); await loadProducts(); });
