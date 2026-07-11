const orderStatusLabels = { WAITING_PAYMENT: 'Chờ thanh toán', WAITING_CONFIRM: 'Chờ xác nhận', CONFIRMED: 'Đã xác nhận', SHIPPING: 'Đang giao hàng', COMPLETED: 'Hoàn thành', CANCELLED: 'Đã hủy' };
const paymentStatusLabels = { UNPAID: 'Chưa thanh toán', PAID: 'Đã thanh toán', PENDING_COD: 'Thanh toán khi nhận hàng' };
const ordersCustomer = requireCustomer();

function orderCard(order) {
  const quantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
  return `<button class="order-card" type="button" data-id="${escapeHtml(order.id)}"><div class="order-card-top"><span class="order-code">#${escapeHtml(order.id.slice(0, 8).toUpperCase())}</span><span class="status-pill status-${escapeHtml(order.status.toLowerCase())}">${escapeHtml(orderStatusLabels[order.status] || order.status)}</span></div><h3>${escapeHtml(order.items[0]?.productName || 'Đơn hàng')} ${order.items.length > 1 ? `<small>+${order.items.length - 1} sản phẩm khác</small>` : ''}</h3><div class="order-card-meta"><span>${formatDate(order.createdAt)}</span><span>${quantity} sản phẩm</span></div><div class="order-card-bottom"><strong>${formatMoney(order.totalAmount)}</strong><span>Xem chi tiết →</span></div></button>`;
}

async function showOrderDetail(orderId) {
  const root = document.querySelector('#orderDetail');
  root.innerHTML = '<div class="loading-state">Đang tải chi tiết đơn...</div>';
  document.querySelectorAll('.order-card').forEach(card => card.classList.toggle('active', card.dataset.id === orderId));
  try {
    const order = await api(`/api/orders/${encodeURIComponent(orderId)}`);
    root.innerHTML = `<div class="detail-panel-head"><div><span>CHI TIẾT ĐƠN HÀNG</span><h2>#${escapeHtml(order.id.slice(0, 8).toUpperCase())}</h2></div><span class="status-pill status-${escapeHtml(order.status.toLowerCase())}">${escapeHtml(orderStatusLabels[order.status] || order.status)}</span></div>
      <div class="order-timeline"><div class="done"><i>✓</i><span>Đã tạo đơn<small>${formatDate(order.createdAt)}</small></span></div><div class="${['SHIPPING','COMPLETED'].includes(order.status) ? 'done' : ''}"><i>2</i><span>Vận chuyển<small>${escapeHtml(order.trackingCode || 'Đang chờ vận đơn')}</small></span></div><div class="${order.status === 'COMPLETED' ? 'done' : ''}"><i>3</i><span>Hoàn thành</span></div></div>
      <div class="order-items">${order.items.map(item => `<div><span>${escapeHtml(item.productName)}<small>Số lượng: ${item.quantity}</small></span><b>${formatMoney(item.unitPrice * item.quantity)}</b></div>`).join('')}</div>
      <div class="delivery-box"><h3>Thông tin giao hàng</h3><p><b>${escapeHtml(order.customerName || 'Khách hàng')}</b> · ${escapeHtml(order.customerPhone || '')}</p><p>${escapeHtml(order.shippingAddress)}</p></div>
      <div class="order-summary-line"><span>${escapeHtml(paymentStatusLabels[order.paymentStatus] || order.paymentStatus)}</span><strong>Tổng cộng: ${formatMoney(order.totalAmount)}</strong></div>`;
    history.replaceState(null, '', `orders.html?order=${encodeURIComponent(orderId)}`);
  } catch (error) { root.innerHTML = `<div class="empty-state error-state"><h3>Không thể tải chi tiết đơn</h3><p>${escapeHtml(error.message)}</p></div>`; }
}

async function loadOrders() {
  const root = document.querySelector('#orders');
  try {
    const orders = await api('/api/orders/my');
    root.innerHTML = orders.length ? orders.map(orderCard).join('') : '<div class="empty-state"><span>⌁</span><h2>Chưa có lịch sử mua hàng</h2><p>Đơn hàng đầu tiên của bạn sẽ xuất hiện tại đây.</p><a class="button button-primary" href="index.html">Khám phá sản phẩm</a></div>';
    const requested = new URLSearchParams(location.search).get('order');
    if (orders.length) showOrderDetail(orders.some(order => order.id === requested) ? requested : orders[0].id);
  } catch (error) { root.innerHTML = `<div class="empty-state error-state"><h2>Không thể tải đơn hàng</h2><p>${escapeHtml(error.message)}</p></div>`; }
}

document.addEventListener('DOMContentLoaded', () => {
  if (!ordersCustomer) return;
  document.querySelector('#orders').addEventListener('click', event => { const card = event.target.closest('.order-card'); if (card) showOrderDetail(card.dataset.id); });
  loadOrders();
});
