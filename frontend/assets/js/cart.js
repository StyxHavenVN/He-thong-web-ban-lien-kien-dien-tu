if (!getUser()) location.href = 'login.html';
async function loadCart() {
  try {
    const cart = await api('/api/cart');
    document.querySelector('#cartItems').innerHTML = cart.items.map(i => `<tr><td>${i.product.name}</td><td><input type="number" value="${i.quantity}" min="0" style="width:80px" onchange="updateQty('${i.productId}', this.value)"></td><td>${formatMoney(i.product.price)}</td><td>${formatMoney(i.product.price*i.quantity)}</td></tr>`).join('') || '<tr><td colspan="4">Giỏ hàng trống.</td></tr>';
    document.querySelector('#total').textContent = formatMoney(cart.total);
  } catch (err) { showNotice(err.message, 'error'); }
}
async function updateQty(productId, quantity) {
  try { await api(`/api/cart/items/${productId}`, { method: 'PUT', body: JSON.stringify({ quantity }) }); loadCart(); }
  catch (err) { showNotice(err.message, 'error'); }
}
async function checkout() {
  try {
    await api('/api/orders', { method: 'POST', body: JSON.stringify({ shippingAddress: document.querySelector('#shippingAddress').value, paymentMethod: document.querySelector('#paymentMethod').value }) });
    showNotice('Đặt hàng thành công.'); setTimeout(() => location.href='orders.html', 1000);
  } catch (err) { showNotice(err.message, 'error'); }
}
document.addEventListener('DOMContentLoaded', loadCart);
