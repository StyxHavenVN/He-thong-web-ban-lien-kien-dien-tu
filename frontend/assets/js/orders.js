if (!getUser()) location.href = 'login.html';
const safeOrder = (value) => String(value || '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
async function loadOrders() {
  try {
    const orders = await api('/api/orders/my');
    document.querySelector('#orders').innerHTML = orders.map(o => `<tr><td>${o.id.slice(0,8)}</td><td>${o.items.map(i=>`${safeOrder(i.productName)} x${i.quantity}`).join('<br>')}</td><td>${formatMoney(o.totalAmount)}</td><td>${safeOrder(o.paymentStatus)}</td><td>${safeOrder(o.trackingCode)}</td><td>${safeOrder(o.status)}</td></tr>`).join('') || '<tr><td colspan="6">Chưa có đơn hàng.</td></tr>';
  } catch (err) { showNotice(err.message, 'error'); }
}
document.addEventListener('DOMContentLoaded', loadOrders);
