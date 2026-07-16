const currentAdmin = getUser();
if (!currentAdmin || !['ADMIN', 'STAFF'].includes(currentAdmin.role)) location.href = 'login.html';
const root = document.getElementById('adminContent');
if (currentAdmin?.role !== 'ADMIN') document.querySelectorAll('.admin-only').forEach((element) => element.remove());

const statusOptions = ['WAITING_CONFIRM', 'PAID', 'PROCESSING', 'SHIPPING', 'COMPLETED', 'CANCELLED'];
const safe = (value) => String(value || '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

async function loadOrders() {
  try {
    const orders = await api('/api/orders/admin/all');
    root.innerHTML = `<table><thead><tr><th>Mã</th><th>Khách</th><th>Sản phẩm</th><th>Tổng</th><th>Thanh toán</th><th>Vận đơn</th><th>Trạng thái</th></tr></thead><tbody>${orders.map((order) => `<tr><td>${order.id.slice(0,8)}</td><td>${safe(order.customer?.fullname)}<br><small>${safe(order.customer?.phone)}</small></td><td>${order.items.map((item) => `${safe(item.productName)} ×${item.quantity}`).join('<br>')}</td><td>${formatMoney(order.totalAmount)}</td><td>${safe(order.paymentStatus)}</td><td>${order.trackingCode ? `<b>${safe(order.trackingCode)}</b><br><small>${safe(order.shipment?.provider)} · ${safe(order.shippingStatus)}</small>` : '<small>Chưa tạo vận đơn</small>'}</td><td><select data-order-status="${order.id}">${statusOptions.map((status) => `<option ${status === order.status ? 'selected' : ''}>${status}</option>`).join('')}</select></td></tr>`).join('') || '<tr><td colspan="7">Chưa có đơn hàng.</td></tr>'}</tbody></table>`;
  } catch (error) { showNotice(error.message, 'error'); }
}

async function loadProducts() {
  try {
    const products = await api('/api/admin/products');
    root.innerHTML = `<div class="toolbar"><b>${products.length} sản phẩm</b><button id="addProduct">Thêm sản phẩm</button></div><table><thead><tr><th>Tên</th><th>Danh mục</th><th>Giá</th><th>Tồn kho</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>${products.map((product) => `<tr><td>${safe(product.name)}</td><td>${safe(product.categoryName)}</td><td>${formatMoney(product.price)}</td><td>${product.stock}</td><td>${product.active ? 'Đang bán' : 'Đã ẩn'}</td><td><button class="secondary" data-edit-product="${product.id}">Sửa</button> <button class="danger" data-delete-product="${product.id}">Ẩn</button></td></tr>`).join('')}</tbody></table>`;
    document.getElementById('addProduct').onclick = () => editProduct();
    root.querySelectorAll('[data-edit-product]').forEach((button) => button.onclick = () => editProduct(products.find((item) => item.id === button.dataset.editProduct)));
  } catch (error) { showNotice(error.message, 'error'); }
}

async function editProduct(product = {}) {
  const categories = await api('/api/admin/categories');
  root.innerHTML = `<form id="productForm" class="app-card"><h2>${product.id ? 'Cập nhật' : 'Thêm'} sản phẩm</h2><div class="app-grid"><div class="field"><label>Tên</label><input name="name" value="${safe(product.name)}" required></div><div class="field"><label>Danh mục</label><select name="categoryId">${categories.filter((item) => item.active).map((item) => `<option value="${item.id}" ${item.id === product.categoryId ? 'selected' : ''}>${safe(item.name)}</option>`).join('')}</select></div><div class="field"><label>Hãng</label><input name="brand" value="${safe(product.brand)}" required></div><div class="field"><label>Giá</label><input name="price" type="number" min="0" value="${product.price || ''}" required></div><div class="field"><label>Tồn kho</label><input name="stock" type="number" min="0" value="${product.stock ?? ''}" required></div><div class="field"><label>Ảnh</label><input name="image" value="${safe(product.image || 'assets/categories/cpu.png')}"></div></div><div class="field"><label>Mô tả</label><textarea name="description">${safe(product.description)}</textarea></div><div class="row"><button type="submit">Lưu sản phẩm</button><button type="button" class="secondary" id="cancelProduct">Hủy</button></div></form>`;
  document.getElementById('cancelProduct').onclick = loadProducts;
  document.getElementById('productForm').onsubmit = async (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.target));
    try {
      await api(product.id ? `/api/admin/products/${product.id}` : '/api/admin/products', { method: product.id ? 'PUT' : 'POST', body: data });
      showNotice('Đã lưu sản phẩm.'); loadProducts();
    } catch (error) { showNotice(error.message, 'error'); }
  };
}

async function loadCategories() {
  try {
    const categories = await api('/api/admin/categories');
    root.innerHTML = `<div class="toolbar"><b>Danh mục sản phẩm</b><button id="addCategory">Thêm danh mục</button></div><table><thead><tr><th>Tên</th><th>Mã</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>${categories.map((category) => `<tr><td>${safe(category.name)}</td><td>${safe(category.slug)}</td><td>${category.active ? 'Hoạt động' : 'Đã ẩn'}</td><td><button class="secondary" data-edit-category="${category.id}">Sửa</button> <button class="danger" data-delete-category="${category.id}">Ẩn</button></td></tr>`).join('')}</tbody></table>`;
    document.getElementById('addCategory').onclick = async () => {
      const name = prompt('Tên danh mục:'); if (!name) return;
      const slug = prompt('Mã danh mục (không dấu):'); if (!slug) return;
      try { await api('/api/admin/categories', { method: 'POST', body: { name, slug } }); loadCategories(); } catch (error) { showNotice(error.message, 'error'); }
    };
    root.querySelectorAll('[data-edit-category]').forEach((button) => button.onclick = async () => {
      const category = categories.find((item) => item.id === button.dataset.editCategory);
      const name = prompt('Tên danh mục:', category.name); if (!name) return;
      const slug = prompt('Mã danh mục:', category.slug); if (!slug) return;
      try { await api(`/api/admin/categories/${category.id}`, { method: 'PUT', body: { name, slug } }); loadCategories(); } catch (error) { showNotice(error.message, 'error'); }
    });
  } catch (error) { showNotice(error.message, 'error'); }
}

async function loadCustomers() {
  try {
    const customers = await api('/api/admin/customers');
    root.innerHTML = `<table><thead><tr><th>Họ tên</th><th>Email</th><th>Điện thoại</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>${customers.map((user) => `<tr><td>${safe(user.fullName)}</td><td>${safe(user.email)}</td><td>${safe(user.phone)}</td><td>${user.locked ? 'Đã khóa' : 'Hoạt động'}</td><td><button data-lock-user="${user.id}">${user.locked ? 'Mở khóa' : 'Khóa'}</button></td></tr>`).join('')}</tbody></table>`;
  } catch (error) { showNotice(error.message, 'error'); }
}

async function loadReport() {
  try {
    const report = await api('/api/admin/reports/revenue');
    root.innerHTML = `<div class="app-card"><h2>Doanh thu đơn đã hoàn thành</h2><p class="price">${formatMoney(report.revenue)}</p><p>Số đơn: <b>${report.orderCount}</b> · Sản phẩm đã bán: <b>${report.productsSold}</b></p><h3 style="margin-top:20px">Sản phẩm bán chạy</h3>${report.bestSellers.map((item) => `<div class="summary-line"><span>${safe(item.name)}</span><b>${item.quantity}</b></div>`).join('') || '<p>Chưa có dữ liệu.</p>'}</div>`;
  } catch (error) { showNotice(error.message, 'error'); }
}

root.addEventListener('change', async (event) => {
  if (!event.target.matches('[data-order-status]')) return;
  try { await api(`/api/orders/${event.target.dataset.orderStatus}/status`, { method: 'PATCH', body: { status: event.target.value } }); showNotice('Đã cập nhật đơn hàng.'); }
  catch (error) { showNotice(error.message, 'error'); loadOrders(); }
});
root.addEventListener('click', async (event) => {
  const deleteProduct = event.target.closest('[data-delete-product]');
  const deleteCategory = event.target.closest('[data-delete-category]');
  const lockUser = event.target.closest('[data-lock-user]');
  try {
    if (deleteProduct && confirm('Ẩn sản phẩm này?')) { await api(`/api/admin/products/${deleteProduct.dataset.deleteProduct}`, { method: 'DELETE' }); loadProducts(); }
    if (deleteCategory && confirm('Ẩn danh mục này?')) { await api(`/api/admin/categories/${deleteCategory.dataset.deleteCategory}`, { method: 'DELETE' }); loadCategories(); }
    if (lockUser) { await api(`/api/admin/customers/${lockUser.dataset.lockUser}/lock`, { method: 'PATCH' }); loadCustomers(); }
  } catch (error) { showNotice(error.message, 'error'); }
});
document.getElementById('adminToolbar').addEventListener('click', (event) => {
  const view = event.target.dataset.view;
  if ({ orders: loadOrders, products: loadProducts, categories: loadCategories, customers: loadCustomers, report: loadReport }[view]) ({ orders: loadOrders, products: loadProducts, categories: loadCategories, customers: loadCustomers, report: loadReport }[view])();
});
loadOrders();
