const API_BASE = '';

function formatMoney(value) {
  return Number(value || 0).toLocaleString('vi-VN') + 'đ';
}

function getToken() { return localStorage.getItem('accessToken'); }
function escapeText(value) { return String(value || '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;'); }
function getUser() {
  try { return JSON.parse(localStorage.getItem('userInfo') || 'null'); }
  catch (_error) { return null; }
}
function setSession(data) {
  localStorage.setItem('accessToken', data.token);
  localStorage.setItem('userInfo', JSON.stringify(data.user));
}
function logout() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('userInfo');
  location.href = 'index.html';
}

async function api(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  let body = options.body;
  if (body !== undefined && !(body instanceof FormData)) {
    headers['Content-Type'] ||= 'application/json';
    if (typeof body !== 'string') body = JSON.stringify(body);
  }
  const res = await fetch(API_BASE + path, { ...options, headers, body });
  const payload = await res.json().catch(() => ({}));
  if (res.status === 401) {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userInfo');
  }
  if (!res.ok) throw new Error(payload.message || 'Có lỗi xảy ra.');
  return payload.success && Object.prototype.hasOwnProperty.call(payload, 'data') ? payload.data : payload;
}

function showNotice(message, type = 'success') {
  const el = document.querySelector('#notice');
  if (!el) return alert(message);
  el.className = `notice show ${type}`;
  el.textContent = message;
  setTimeout(() => { el.className = `notice ${type}`; }, 3500);
}

function renderNav() {
  const user = getUser();
  const role = String(user?.role || '').toUpperCase();
  const nav = document.querySelector('#nav');
  if (!nav) return;
  nav.innerHTML = `
    <a href="index.html">Trang chủ</a>
    <a href="products.html?group=components">PC - Linh kiện</a>
    <a href="build-pc.html">Build PC</a>
    <a href="products.html?promotion=1">Khuyến mãi</a>
    <a href="news.html">Tin tức</a>
    <a href="support.html">Hỗ trợ</a>
    ${role === 'CUSTOMER' ? '<a href="cart.html">Giỏ hàng</a><a href="orders.html">Đơn hàng của tôi</a>' : ''}
    ${role === 'ADMIN' ? '<a href="admin.html">Trang quản trị</a>' : ''}
    ${role === 'STAFF' ? '<a href="admin.html">Quản lý đơn hàng</a>' : ''}
    ${user ? `<span>Xin chào, ${escapeText(user.fullName)}</span><button onclick="logout()">Đăng xuất</button>` : '<a href="login.html">Đăng nhập</a><a href="register.html">Đăng ký</a>'}
  `;
}

document.addEventListener('DOMContentLoaded', renderNav);
