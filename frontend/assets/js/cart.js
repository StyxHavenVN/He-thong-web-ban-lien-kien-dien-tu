let currentCart = { items: [], total: 0 };
const customer = requireCustomer();

function renderCart(cart) {
  currentCart = cart;
  const root = document.querySelector('#cartItems');
  const count = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  document.querySelector('#cartItemCount').textContent = `${count} sản phẩm`;
  document.querySelector('#total').textContent = formatMoney(cart.total);
  document.querySelector('#checkoutButton').disabled = cart.items.length === 0;
  root.innerHTML = cart.items.length ? cart.items.map(item => `<article class="cart-item" data-id="${escapeHtml(item.productId)}">
    <a class="cart-image" href="product.html?id=${encodeURIComponent(item.productId)}"><img src="${escapeHtml(item.product.image)}" alt="${escapeHtml(item.product.name)}" onerror="setImageFallback(this)"></a>
    <div class="cart-product"><span>${escapeHtml(item.product.categoryName)}</span><h3><a href="product.html?id=${encodeURIComponent(item.productId)}">${escapeHtml(item.product.name)}</a></h3><p>${escapeHtml(item.product.brand)} · Còn ${item.product.stock} sản phẩm</p><button class="text-button remove-item" type="button">Xóa khỏi giỏ</button></div>
    <div class="quantity-control"><button class="qty-step" type="button" data-step="-1" aria-label="Giảm số lượng">−</button><input class="qty-input" type="number" min="1" max="${item.product.stock}" value="${item.quantity}" aria-label="Số lượng ${escapeHtml(item.product.name)}"><button class="qty-step" type="button" data-step="1" aria-label="Tăng số lượng">+</button></div>
    <div class="cart-price"><span>${formatMoney(item.product.price)} / sản phẩm</span><strong>${formatMoney(item.product.price * item.quantity)}</strong></div>
  </article>`).join('') : '<div class="empty-state"><span>□</span><h2>Giỏ hàng đang trống</h2><p>Khám phá kho linh kiện và chọn sản phẩm phù hợp với cấu hình của bạn.</p><a class="button button-primary" href="index.html">Xem sản phẩm</a></div>';
}

async function loadCart() {
  try { renderCart(await api('/api/cart')); }
  catch (error) { showNotice(error.message, 'error'); }
}

async function updateQuantity(productId, quantity) {
  try {
    renderCart(await api(`/api/cart/items/${encodeURIComponent(productId)}`, { method: 'PUT', body: JSON.stringify({ quantity }) }));
    updateCartBadge();
  } catch (error) { showNotice(error.message, 'error'); loadCart(); }
}

async function removeItem(productId) {
  try {
    renderCart(await api(`/api/cart/items/${encodeURIComponent(productId)}`, { method: 'DELETE' }));
    showNotice('Đã xóa sản phẩm khỏi giỏ hàng.'); updateCartBadge();
  } catch (error) { showNotice(error.message, 'error'); }
}

document.addEventListener('DOMContentLoaded', () => {
  if (!customer) return;
  document.querySelector('#customerName').value = customer.fullName || '';
  document.querySelector('#customerPhone').value = customer.phone || '';
  document.querySelector('#shippingAddress').value = customer.address || '';
  document.querySelector('#cartItems').addEventListener('click', event => {
    const item = event.target.closest('.cart-item'); if (!item) return;
    if (event.target.closest('.remove-item')) return removeItem(item.dataset.id);
    const step = event.target.closest('.qty-step');
    if (step) { const input = item.querySelector('.qty-input'); updateQuantity(item.dataset.id, Number(input.value) + Number(step.dataset.step)); }
  });
  document.querySelector('#cartItems').addEventListener('change', event => {
    if (!event.target.matches('.qty-input')) return;
    updateQuantity(event.target.closest('.cart-item').dataset.id, Number(event.target.value));
  });
  document.querySelector('#checkoutForm').addEventListener('submit', async event => {
    event.preventDefault();
    if (!currentCart.items.length) return showNotice('Giỏ hàng đang trống.', 'error');
    const button = document.querySelector('#checkoutButton');
    const payload = Object.fromEntries(new FormData(event.currentTarget));
    try {
      button.disabled = true; button.textContent = 'Đang tạo đơn hàng...';
      const order = await api('/api/orders', { method: 'POST', body: JSON.stringify(payload) });
      sessionStorage.setItem('flash', `Đặt hàng thành công. Mã đơn ${order.id.slice(0, 8).toUpperCase()}.`);
      location.href = `orders.html?order=${encodeURIComponent(order.id)}`;
    } catch (error) { showNotice(error.message, 'error'); button.disabled = false; button.textContent = 'Xác nhận đặt hàng'; }
  });
  loadCart();
});
