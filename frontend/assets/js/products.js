document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('product-list-container');
  if (!container) return;
  const params = new URLSearchParams(location.search);
  const filters = { keyword: params.get('keyword') || '', categoryId: params.get('category') || '', sort: 'newest' };
  const money = (value) => Number(value || 0).toLocaleString('vi-VN') + ' ₫';
  const escapeHtml = (value) => String(value || '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

  async function loadProducts() {
    container.innerHTML = '<p style="grid-column:1/-1;text-align:center;padding:40px">Đang tải dữ liệu...</p>';
    const query = new URLSearchParams(Object.entries(filters).filter(([, value]) => value));
    try {
      const response = await fetch(`/api/products?${query}`);
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message);
      const products = payload.data || [];
      document.getElementById('total-product-count').textContent = `Hiển thị ${products.length} sản phẩm`;
      container.innerHTML = products.map((product) => `
        <article class="catalog-card" data-id="${product.id}">
          ${product.badge ? `<div class="catalog-badge ${product.badge === 'MỚI' ? 'bg-blue' : 'bg-red'}">${escapeHtml(product.badge)}</div>` : ''}
          <a class="catalog-img" href="product-detail.html?id=${encodeURIComponent(product.id)}"><img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}"></a>
          <a class="catalog-title" href="product-detail.html?id=${encodeURIComponent(product.id)}">${escapeHtml(product.name)}</a>
          <div class="catalog-rating"><i class="fi fi-sr-star"></i> ${product.rating || 5} <span>(${product.reviews || 0})</span></div>
          <div class="catalog-price"><div class="price-current ${product.oldPrice ? 'text-red' : 'text-blue'}">${money(product.price)}</div>${product.oldPrice ? `<div class="price-old">${money(product.oldPrice)}</div>` : ''}</div>
          <div class="catalog-actions"><a class="btn-cart-outline" href="product-detail.html?id=${encodeURIComponent(product.id)}" aria-label="Xem chi tiết">⌕</a><button class="btn-cart-solid add-cart"><i class="fi fi-rr-shopping-cart-add"></i> Thêm vào giỏ</button></div>
        </article>`).join('') || '<p style="grid-column:1/-1;text-align:center;padding:40px">Không tìm thấy sản phẩm.</p>';
    } catch (error) {
      container.innerHTML = `<p style="grid-column:1/-1;text-align:center">${escapeHtml(error.message || 'Lỗi tải sản phẩm.')}</p>`;
    }
  }

  container.addEventListener('click', async (event) => {
    const button = event.target.closest('.add-cart');
    if (!button) return;
    const token = localStorage.getItem('accessToken');
    if (!token) return location.href = 'login.html';
    try {
      button.disabled = true;
      const response = await fetch('/api/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ productId: button.closest('.catalog-card').dataset.id, quantity: 1 })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message);
      alert('Đã thêm sản phẩm vào giỏ hàng.');
    } catch (error) { alert(error.message); }
    finally { button.disabled = false; }
  });

  const searchInput = document.getElementById('search-input');
  if (searchInput) searchInput.value = filters.keyword;
  const executeSearch = () => { filters.keyword = searchInput.value.trim(); loadProducts(); };
  document.getElementById('search-btn')?.addEventListener('click', executeSearch);
  searchInput?.addEventListener('keydown', (event) => { if (event.key === 'Enter') executeSearch(); });
  document.getElementById('sort-select')?.addEventListener('change', (event) => { filters.sort = event.target.value; loadProducts(); });
  loadProducts();
});
