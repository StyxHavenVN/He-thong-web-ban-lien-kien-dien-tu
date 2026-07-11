const loginForm = document.querySelector('#loginForm');
if (loginForm) loginForm.addEventListener('submit', async e => {
  e.preventDefault();
  const form = Object.fromEntries(new FormData(loginForm));
  try { const data = await api('/api/auth/login', { method: 'POST', body: JSON.stringify(form) }); setSession(data); location.href = data.user.role === 'CUSTOMER' ? 'index.html' : 'admin.html'; }
  catch (err) { showNotice(err.message, 'error'); }
});

const registerForm = document.querySelector('#registerForm');
if (registerForm) registerForm.addEventListener('submit', async e => {
  e.preventDefault();
  const form = Object.fromEntries(new FormData(registerForm));
  try { const data = await api('/api/auth/register', { method: 'POST', body: JSON.stringify(form) }); setSession(data); location.href = 'index.html'; }
  catch (err) { showNotice(err.message, 'error'); }
});
