document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('accessToken');
  let user = null;
  try { user = JSON.parse(localStorage.getItem('userInfo') || 'null'); } catch (_error) {}

  const userAuthArea = document.getElementById('user-auth-area');
  if (userAuthArea && user && token) {
    const displayName = String(user.fullName || '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
    const role = String(user.role || '').toUpperCase();
    const accountPage = ['ADMIN', 'STAFF'].includes(role) ? 'admin.html' : 'orders.html';
    const accountLabel = role === 'ADMIN'
      ? 'Trang quản trị'
      : role === 'STAFF'
        ? 'Quản lý đơn hàng'
        : 'Đơn hàng của tôi';

    userAuthArea.innerHTML = `
      <div class="user-logged-in">
        <span class="user-name">Chào, ${displayName}</span>
        <div class="user-account-links">
          <a href="${accountPage}" class="account-page-link">${accountLabel}</a>
          <span aria-hidden="true">·</span>
          <a href="#" id="logout-btn" class="logout-link">Đăng xuất</a>
        </div>
      </div>`;

    const orderTrackingLink = document.getElementById('order-tracking-link');
    if (orderTrackingLink) {
      orderTrackingLink.href = accountPage;
      orderTrackingLink.querySelector('.tracking-label').textContent = accountLabel;
    }

    document.getElementById('logout-btn')?.addEventListener('click', (event) => {
      event.preventDefault();
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userInfo');
      location.href = 'index.html';
    });
  }

  document.querySelectorAll('.toggle-password').forEach((icon) => {
    icon.addEventListener('click', () => {
      const input = document.getElementById(icon.getAttribute('data-target'));
      input.type = input.type === 'password' ? 'text' : 'password';
      icon.classList.toggle('bx-hide');
      icon.classList.toggle('bx-show');
    });
  });

  document.getElementById('registerForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const password = document.getElementById('reg-password').value;
    if (password !== document.getElementById('reg-confirm-password').value) return alert('Mật khẩu xác nhận không khớp.');
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullname: document.getElementById('fullname').value,
          email: document.getElementById('email').value,
          phone: document.getElementById('phone').value,
          password
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      alert(data.message);
      location.href = 'login.html';
    } catch (error) { alert(error.message || 'Không thể đăng ký.'); }
  });

  document.getElementById('loginForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: document.getElementById('login-email').value,
          password: document.getElementById('login-password').value
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      localStorage.setItem('accessToken', data.token);
      localStorage.setItem('userInfo', JSON.stringify(data.data));
      location.href = ['ADMIN', 'STAFF'].includes(data.data.role) ? 'admin.html' : 'index.html';
    } catch (error) { alert(error.message || 'Không thể đăng nhập.'); }
  });
});
