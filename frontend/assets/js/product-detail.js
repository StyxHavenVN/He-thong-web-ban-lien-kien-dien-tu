const specLabels = { socket: 'Socket', ramType: 'Chuẩn RAM', tdp: 'TDP', form: 'Kích thước', capacity: 'Dung lượng', bus: 'Bus', power: 'Công suất', requiredPower: 'Nguồn đề nghị', chipset: 'Chipset' };

function renderSpecs(specs = {}) {
  const entries = Object.entries(specs);
  return entries.length ? entries.map(([key, value]) => `<div><span>${escapeHtml(specLabels[key] || key)}</span><b>${escapeHtml(value)}${['tdp', 'power', 'requiredPower'].includes(key) ? 'W' : ''}</b></div>`).join('') : '<p>Thông số kỹ thuật đang được cập nhật.</p>';
}

async function addDetailToCart(productId) {
  if (!getUser()) return location.href = `login.html?return=${encodeURIComponent(location.pathname.split('/').pop() + location.search)}`;
  if (getUser().role !== 'CUSTOMER') return showNotice('Chỉ tài khoản khách hàng có thể thêm sản phẩm vào giỏ.', 'error');
  const quantity = Number(document.querySelector('#detailQuantity')?.value || 1);
  try {
    await api('/api/cart/items', { method: 'POST', body: JSON.stringify({ productId, quantity }) });
    showNotice(`Đã thêm ${quantity} sản phẩm vào giỏ hàng.`); updateCartBadge();
  } catch (error) { showNotice(error.message, 'error'); }
}

function recommendationCard(product) {
  return `<article class="recommendation-card"><a href="product.html?id=${encodeURIComponent(product.id)}"><span>${escapeHtml(product.categoryName)}</span><h3>${escapeHtml(product.name)}</h3><p>${escapeHtml(product.brand)} · ${product.stock > 0 ? `Còn ${product.stock}` : 'Hết hàng'}</p><strong>${formatMoney(product.price)}</strong></a>${product.stock > 0 ? `<button class="button button-ghost rec-add" data-id="${escapeHtml(product.id)}">Thêm vào giỏ</button>` : '<span class="sold-out-label">Tạm hết hàng</span>'}</article>`;
}

document.addEventListener('DOMContentLoaded', async () => {
  const id = new URLSearchParams(location.search).get('id');
  const detailRoot = document.querySelector('#productDetail');
  if (!id) { detailRoot.innerHTML = '<div class="empty-state"><h2>Thiếu mã sản phẩm</h2><a href="index.html">Quay lại danh sách</a></div>'; return; }
  try {
    const [product, recommendations] = await Promise.all([api(`/api/products/${encodeURIComponent(id)}`), api(`/api/products/${encodeURIComponent(id)}/recommendations`)]);
    document.title = `${product.name} | BlueTech`;
    document.querySelector('#breadcrumbName').textContent = product.name;
    const unavailable = product.active === false || product.stock < 1;
    detailRoot.innerHTML = `
      <div class="detail-visual"><span class="category-chip">${escapeHtml(product.categoryName)}</span><img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" onerror="setImageFallback(this)"><div class="visual-code">SKU / ${escapeHtml(product.id.toUpperCase())}</div></div>
      <div class="detail-content"><div class="product-meta"><span>${escapeHtml(product.brand)}</span><span class="${unavailable ? 'out-stock' : 'in-stock'}">${unavailable ? (product.active === false ? 'Ngừng kinh doanh' : 'Hết hàng') : `Còn ${product.stock} sản phẩm`}</span></div><h1>${escapeHtml(product.name)}</h1><p class="detail-description">${escapeHtml(product.description)}</p><div class="detail-price">${formatMoney(product.price)}</div><div class="spec-table"><h2>Thông số kỹ thuật</h2>${renderSpecs(product.specs)}</div><div class="buy-row"><label for="detailQuantity">Số lượng<input id="detailQuantity" type="number" min="1" max="${product.stock}" value="1" ${unavailable ? 'disabled' : ''}></label><button id="detailAdd" class="button button-primary" ${unavailable ? 'disabled' : ''}>${unavailable ? 'Sản phẩm không khả dụng' : 'Thêm vào giỏ hàng'}</button></div></div>`;
    document.querySelector('#detailAdd')?.addEventListener('click', () => addDetailToCart(product.id));
    const recRoot = document.querySelector('#recommendations');
    recRoot.innerHTML = recommendations.length ? recommendations.map(recommendationCard).join('') : '<div class="empty-state grid-span"><h3>Chưa có sản phẩm phù hợp</h3><p>BlueTech sẽ cập nhật gợi ý khi có thêm dữ liệu cấu hình.</p></div>';
    recRoot.addEventListener('click', event => { const button = event.target.closest('.rec-add'); if (button) addDetailToCart(button.dataset.id); });
  } catch (error) {
    detailRoot.innerHTML = `<div class="empty-state error-state"><h2>Không tìm thấy sản phẩm</h2><p>${escapeHtml(error.message)}</p><a class="button button-primary" href="index.html">Về danh sách sản phẩm</a></div>`;
  }
});
