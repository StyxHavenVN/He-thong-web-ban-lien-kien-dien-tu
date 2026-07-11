document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.toggle-password').forEach(button => {
    button.addEventListener('click', () => {
      const input = document.getElementById(button.dataset.target);
      if (!input) return;
      const reveal = input.type === 'password';
      input.type = reveal ? 'text' : 'password';
      button.textContent = reveal ? 'Ẩn' : 'Hiện';
      button.setAttribute('aria-label', reveal ? 'Ẩn mật khẩu' : 'Hiện mật khẩu');
    });
  });

  const loginForm = document.querySelector('#loginForm');
  loginForm?.addEventListener('submit', async event => {
    event.preventDefault();
    const button = loginForm.querySelector('button[type="submit"]');
    const formData = Object.fromEntries(new FormData(loginForm));
    try {
      button.disabled = true; button.textContent = 'Đang đăng nhập...';
      const data = await api('/api/auth/login', { method: 'POST', body: JSON.stringify(formData) });
      setSession(data);
      const requested = new URLSearchParams(location.search).get('return');
      const safeReturn = requested && /^[\w-]+\.html(?:\?.*)?$/.test(requested) ? requested : null;
      location.href = data.user.role === 'CUSTOMER' ? (safeReturn || 'index.html') : 'admin.html';
    } catch (error) { showNotice(error.message, 'error'); }
    finally { button.disabled = false; button.textContent = 'Đăng nhập'; }
  });

  const registerForm = document.querySelector('#registerForm');
  registerForm?.addEventListener('submit', async event => {
    event.preventDefault();
    const button = registerForm.querySelector('button[type="submit"]');
    const formData = Object.fromEntries(new FormData(registerForm));
    if (formData.password !== formData.confirmPassword) return showNotice('Mật khẩu xác nhận không khớp.', 'error');
    delete formData.confirmPassword;
    try {
      button.disabled = true; button.textContent = 'Đang tạo tài khoản...';
      const data = await api('/api/auth/register', { method: 'POST', body: JSON.stringify(formData) });
      setSession(data);
      sessionStorage.setItem('flash', 'Đăng ký thành công. Chào mừng bạn đến với BlueTech!');
      location.href = 'index.html';
    } catch (error) { showNotice(error.message, 'error'); }
    finally { button.disabled = false; button.textContent = 'Tạo tài khoản'; }
  });
});
