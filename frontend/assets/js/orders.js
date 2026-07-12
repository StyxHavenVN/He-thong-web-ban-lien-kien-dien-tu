if (!getUser()) location.href = 'login.html';
async function loadOrders() {
  try {
    const orders = await api('/api/orders/my');
    document.querySelector('#orders').innerHTML = orders.map(o => `<tr><td>${o.id.slice(0,8)}</td><td>${o.items.map(i=>`${i.productName} x${i.quantity}`).join('<br>')}</td><td>${formatMoney(o.totalAmount)}</td><td>${o.paymentStatus}</td><td>${o.trackingCode || ''}</td><td>${o.status}</td></tr>`).join('') || '<tr><td colspan="6">Chưa có đơn hàng.</td></tr>';
  } catch (err) { showNotice(err.message, 'error'); }
}
document.addEventListener('DOMContentLoaded', loadOrders);
