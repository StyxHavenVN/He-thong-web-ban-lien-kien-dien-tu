const user = getUser();
if (!user || !['ADMIN','STAFF'].includes(user.role)) location.href = 'login.html';
const root = document.querySelector('#adminContent');
async function loadOrders() {
  try {
    const orders = await api('/api/orders/admin/all');
    root.innerHTML = `<table><thead><tr><th>Mã</th><th>Khách</th><th>Sản phẩm</th><th>Tổng</th><th>Trạng thái</th><th>Cập nhật</th></tr></thead><tbody>${orders.map(o => `<tr><td>${o.id.slice(0,8)}</td><td>${o.customer?.fullName || ''}</td><td>${o.items.map(i=>`${i.productName} x${i.quantity}`).join('<br>')}</td><td>${formatMoney(o.totalAmount)}</td><td>${o.status}</td><td><select onchange="updateStatus('${o.id}', this.value)"><option value="WAITING_CONFIRM">Chờ xác nhận</option><option value="PROCESSING">Đang xử lý</option><option value="SHIPPING">Đang giao hàng</option><option value="COMPLETED">Hoàn thành</option><option value="CANCELLED">Đã hủy</option></select></td></tr>`).join('')}</tbody></table>`;
  } catch (err) { showNotice(err.message, 'error'); }
}
async function updateStatus(id, status) {
  try { await api(`/api/orders/${id}/status`, { method:'PATCH', body: JSON.stringify({ status }) }); showNotice('Đã cập nhật trạng thái.'); loadOrders(); }
  catch (err) { showNotice(err.message, 'error'); }
}
async function loadProducts() {
  const products = await api('/api/products');
  root.innerHTML = `<table><thead><tr><th>Tên</th><th>Danh mục</th><th>Giá</th><th>Tồn kho</th></tr></thead><tbody>${products.map(p => `<tr><td>${p.name}</td><td>${p.categoryName}</td><td>${formatMoney(p.price)}</td><td>${p.stock}</td></tr>`).join('')}</tbody></table>`;
}
async function loadReport() {
  try {
    const r = await api('/api/admin/reports/revenue');
    root.innerHTML = `<div class="card-body"><h2>Thống kê doanh thu</h2><p>Doanh thu đơn hoàn thành: <b>${formatMoney(r.revenue)}</b></p><p>Số đơn hoàn thành: <b>${r.orderCount}</b></p><h3>Sản phẩm bán chạy</h3>${r.bestSellers.map(i => `<p>${i.name}: ${i.quantity}</p>`).join('') || '<p>Chưa có dữ liệu.</p>'}</div>`;
  } catch (err) { showNotice(err.message, 'error'); }
}
document.addEventListener('DOMContentLoaded', loadOrders);
