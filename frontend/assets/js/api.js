const API_BASE = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1') ? 'http://localhost:3000' : '';

function formatMoney(value) {
  return Number(value || 0).toLocaleString('vi-VN') + 'đ';
}

function getToken() { return localStorage.getItem('token'); }
function getUser() { try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; } }
function setSession(data) { localStorage.setItem('token', data.token); localStorage.setItem('user', JSON.stringify(data.user)); }
function logout() { localStorage.removeItem('token'); localStorage.removeItem('user'); location.href = 'index.html'; }

async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(API_BASE + path, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Có lỗi xảy ra.');
  return data;
}

function showNotice(message, type = 'success') {
  const el = document.querySelector('#notice');
  if (!el) return alert(message);
  el.className = `notice show ${type}`;
  el.textContent = message;
  setTimeout(() => el.className = `notice ${type}`, 3500);
}

function renderNav() {
  const user = getUser();
  const nav = document.querySelector('#nav');
  if (!nav) return;
  nav.innerHTML = `
    <a href="index.html">Sản phẩm</a>
    ${user?.role === 'CUSTOMER' ? '<a href="cart.html">Giỏ hàng</a><a href="orders.html">Đơn hàng</a>' : ''}
    ${user?.role === 'ADMIN' || user?.role === 'STAFF' ? '<a href="admin.html">Quản trị</a>' : ''}
    ${user ? `<span>Xin chào, ${user.fullname}</span><button onclick="logout()">Đăng xuất</button>` : '<a href="login.html">Đăng nhập</a><a href="register.html">Đăng ký</a>'}
  `;
}

document.addEventListener('DOMContentLoaded', renderNav);
