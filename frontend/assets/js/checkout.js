if (!getToken() || getUser()?.role !== 'CUSTOMER') location.href = 'login.html';
let currentCart = null;
const safeCheckout = (value) => String(value || '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

async function initCheckout() {
  try {
    currentCart = await api('/api/cart');
    if (!currentCart.items.length) return location.href = 'cart.html';
    document.getElementById('shippingAddress').value = getUser()?.address || '';
    document.getElementById('checkoutItems').innerHTML = currentCart.items.map((item) => `<div class="summary-line"><span>${safeCheckout(item.product.name)} × ${item.quantity}</span><b>${formatMoney(item.product.price * item.quantity)}</b></div>`).join('');
    document.getElementById('checkoutTotal').textContent = formatMoney(currentCart.total);
  } catch (error) { showNotice(error.message, 'error'); }
}

document.getElementById('checkoutForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = event.submitter;
  button.disabled = true;
  try {
    const order = await api('/api/orders', { method: 'POST', body: {
      shippingAddress: document.getElementById('shippingAddress').value,
      deliveryMethod: document.getElementById('deliveryMethod').value,
      paymentMethod: document.getElementById('paymentMethod').value
    }});
    if (order.status === 'PAYMENT_FAILED') {
      showNotice('Thanh toán mô phỏng thất bại. Giỏ hàng vẫn được giữ nguyên.', 'error');
      button.disabled = false;
      return;
    }
    alert(`Đặt hàng thành công. Mã đơn: ${order.id.slice(0, 8)}`);
    location.href = 'orders.html';
  } catch (error) { showNotice(error.message, 'error'); button.disabled = false; }
});
initCheckout();
