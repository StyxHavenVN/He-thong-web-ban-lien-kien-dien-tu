const API_BASE = '';

function formatMoney(value) {
  return Number(value || 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
}

function formatDate(value) {
  return value ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '';
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}

function getToken() { return localStorage.getItem('token'); }
function getUser() { try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; } }
function setSession(data) { localStorage.setItem('token', data.token); localStorage.setItem('user', JSON.stringify(data.user)); }
function clearSession() { localStorage.removeItem('token'); localStorage.removeItem('user'); }
function logout() { clearSession(); location.href = 'index.html'; }

async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  let response;
  try {
    response = await fetch(API_BASE + path, { ...options, headers });
  } catch {
    throw new Error('Không thể kết nối máy chủ. Vui lòng kiểm tra lại kết nối.');
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && token) clearSession();
    throw new Error(data.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
  }
  return data;
}

function showNotice(message, type = 'success') {
  const element = document.querySelector('#notice');
  if (!element) return;
  element.className = `notice show ${type}`;
  element.textContent = message;
  window.clearTimeout(showNotice.timer);
  showNotice.timer = window.setTimeout(() => element.className = `notice ${type}`, 4500);
}

function renderNav() {
  const user = getUser();
  const nav = document.querySelector('#nav');
  if (!nav) return;
  nav.innerHTML = `
    <a href="index.html">Sản phẩm</a>
    ${user?.role === 'CUSTOMER' ? '<a href="cart.html">Giỏ hàng <span id="cartBadge" class="nav-badge">0</span></a><a href="orders.html">Đơn hàng</a>' : ''}
    ${['ADMIN', 'STAFF'].includes(user?.role) ? '<a href="admin.html">Quản trị</a>' : ''}
    ${user ? `<span class="nav-user">${escapeHtml(user.fullName)}</span><button class="nav-logout" type="button" onclick="logout()">Đăng xuất</button>` : '<a href="login.html">Đăng nhập</a><a class="nav-cta" href="register.html">Đăng ký</a>'}
  `;
  if (user?.role === 'CUSTOMER') updateCartBadge();
}

async function updateCartBadge() {
  const badge = document.querySelector('#cartBadge');
  if (!badge) return;
  try {
    const cart = await api('/api/cart');
    badge.textContent = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  } catch { badge.textContent = '0'; }
}

function requireCustomer() {
  const user = getUser();
  if (!user || user.role !== 'CUSTOMER') {
    const returnTo = encodeURIComponent(location.pathname.split('/').pop() + location.search);
    location.href = `login.html?return=${returnTo}`;
    return null;
  }
  return user;
}

function setImageFallback(image, label = '') {
  image.onerror = null;
  image.removeAttribute('src');
  if (label) image.alt = label;
  image.classList.add('image-fallback');
}

document.addEventListener('DOMContentLoaded', () => {
  renderNav();
  const flash = sessionStorage.getItem('flash');
  if (flash) { sessionStorage.removeItem('flash'); showNotice(flash); }
});
