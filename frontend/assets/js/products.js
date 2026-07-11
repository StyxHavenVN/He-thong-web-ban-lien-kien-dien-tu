const catalogState = { page: 1, limit: 8 };

async function loadCategories() {
  const categories = await api('/api/products/categories');
  const select = document.querySelector('#category');
  select.innerHTML = '<option value="">Tất cả danh mục</option>' + categories
    .map(category => `<option value="${escapeHtml(category.id)}">${escapeHtml(category.name)}</option>`).join('');
}

function buildProductParams() {
  const params = new URLSearchParams({ page: catalogState.page, limit: catalogState.limit });
  ['search', 'category', 'brand', 'spec', 'minPrice', 'maxPrice'].forEach(id => {
    const value = document.querySelector(`#${id}`)?.value.trim();
    if (value) params.set(id, value);
  });
  const sort = document.querySelector('#sort')?.value;
  if (sort) params.set('sort', sort);
  return params;
}

function productCard(product) {
  const stockLabel = product.stock > 0 ? `Còn ${product.stock} sản phẩm` : 'Hết hàng';
  const specValues = Object.values(product.specs || {}).slice(0, 2).map(escapeHtml);
  return `<article class="product-card">
    <a class="product-visual" href="product.html?id=${encodeURIComponent(product.id)}">
      <span class="category-chip">${escapeHtml(product.categoryName)}</span>
      <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" onerror="setImageFallback(this)">
    </a>
    <div class="product-body">
      <div class="product-meta"><span>${escapeHtml(product.brand)}</span><span class="${product.stock > 0 ? 'in-stock' : 'out-stock'}">${stockLabel}</span></div>
      <h3><a href="product.html?id=${encodeURIComponent(product.id)}">${escapeHtml(product.name)}</a></h3>
      <div class="spec-strip">${specValues.length ? specValues.map(value => `<span>${value}</span>`).join('') : '<span>Thông số cơ bản</span>'}</div>
      <div class="product-footer"><strong>${formatMoney(product.price)}</strong><button class="icon-button add-cart" data-id="${escapeHtml(product.id)}" ${product.stock < 1 ? 'disabled' : ''} aria-label="Thêm ${escapeHtml(product.name)} vào giỏ">+</button></div>
    </div>
  </article>`;
}

function renderPagination(pagination) {
  const root = document.querySelector('#pagination');
  if (pagination.totalPages <= 1) { root.innerHTML = ''; return; }
  const buttons = [];
  buttons.push(`<button data-page="${pagination.page - 1}" ${pagination.page === 1 ? 'disabled' : ''} aria-label="Trang trước">←</button>`);
  for (let page = 1; page <= pagination.totalPages; page += 1) {
    buttons.push(`<button data-page="${page}" class="${page === pagination.page ? 'active' : ''}" ${page === pagination.page ? 'aria-current="page"' : ''}>${page}</button>`);
  }
  buttons.push(`<button data-page="${pagination.page + 1}" ${pagination.page === pagination.totalPages ? 'disabled' : ''} aria-label="Trang sau">→</button>`);
  root.innerHTML = buttons.join('');
}

async function loadProducts() {
  const root = document.querySelector('#products');
  root.innerHTML = '<div class="loading-state grid-span">Đang tải sản phẩm...</div>';
  try {
    const data = await api(`/api/products?${buildProductParams()}`);
    catalogState.page = data.pagination.page;
    root.innerHTML = data.items.length ? data.items.map(productCard).join('') : '<div class="empty-state grid-span"><span>⌕</span><h3>Không tìm thấy sản phẩm</h3><p>Hãy thử từ khóa hoặc khoảng giá khác.</p></div>';
    document.querySelector('#resultSummary').textContent = data.pagination.totalItems
      ? `Hiển thị ${((data.pagination.page - 1) * data.pagination.limit) + 1}–${Math.min(data.pagination.page * data.pagination.limit, data.pagination.totalItems)} / ${data.pagination.totalItems} sản phẩm`
      : 'Chưa có sản phẩm phù hợp';
    const brandSelect = document.querySelector('#brand');
    const selectedBrand = brandSelect.value;
    brandSelect.innerHTML = '<option value="">Tất cả hãng</option>' + data.filters.brands.map(brand => `<option value="${escapeHtml(brand)}">${escapeHtml(brand)}</option>`).join('');
    brandSelect.value = selectedBrand;
    renderPagination(data.pagination);
  } catch (error) {
    root.innerHTML = `<div class="empty-state error-state grid-span"><h3>Không thể tải sản phẩm</h3><p>${escapeHtml(error.message)}</p><button class="button button-primary" type="button" id="retryProducts">Thử lại</button></div>`;
    document.querySelector('#retryProducts')?.addEventListener('click', loadProducts);
    document.querySelector('#resultSummary').textContent = 'Có lỗi khi tải dữ liệu';
  }
}

async function addToCart(productId) {
  if (!getUser()) {
    const returnTo = encodeURIComponent(`product.html?id=${productId}`);
    location.href = `login.html?return=${returnTo}`;
    return;
  }
  if (getUser().role !== 'CUSTOMER') return showNotice('Chỉ tài khoản khách hàng có thể thêm sản phẩm vào giỏ.', 'error');
  try {
    await api('/api/cart/items', { method: 'POST', body: JSON.stringify({ productId, quantity: 1 }) });
    showNotice('Đã thêm sản phẩm vào giỏ hàng.');
    updateCartBadge();
  } catch (error) { showNotice(error.message, 'error'); }
}

document.addEventListener('DOMContentLoaded', async () => {
  const form = document.querySelector('#filterForm');
  form.addEventListener('submit', event => { event.preventDefault(); catalogState.page = 1; loadProducts(); });
  document.querySelector('#sort').addEventListener('change', () => { catalogState.page = 1; loadProducts(); });
  document.querySelector('#clearFilters').addEventListener('click', () => { form.reset(); document.querySelector('#sort').value = ''; catalogState.page = 1; loadProducts(); });
  document.querySelector('#products').addEventListener('click', event => {
    const button = event.target.closest('.add-cart');
    if (button) addToCart(button.dataset.id);
  });
  document.querySelector('#pagination').addEventListener('click', event => {
    const button = event.target.closest('button[data-page]');
    if (!button || button.disabled) return;
    catalogState.page = Number(button.dataset.page); loadProducts();
    document.querySelector('#catalog').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  try { await loadCategories(); await loadProducts(); }
  catch (error) { showNotice(error.message, 'error'); }
});
