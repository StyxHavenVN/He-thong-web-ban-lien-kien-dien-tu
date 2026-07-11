document.addEventListener('DOMContentLoaded', () => {
    // Ẩn/hiện mật khẩu
    document.querySelectorAll('.toggle-password').forEach(icon => {
        icon.addEventListener('click', function () {
            const targetId = this.getAttribute('data-target');
            const passwordInput = document.getElementById(targetId);

            if (!passwordInput) return;

            const isHidden = passwordInput.type === 'password';
            passwordInput.type = isHidden ? 'text' : 'password';

            this.classList.toggle('bx-hide', !isHidden);
            this.classList.toggle('bx-show', isHidden);
        });
    });

    // Đăng nhập
    const loginForm = document.querySelector('#loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async event => {
            event.preventDefault();

            const submitButton = loginForm.querySelector(
                'button[type="submit"]'
            );

            const formData = Object.fromEntries(
                new FormData(loginForm)
            );

            try {
                if (submitButton) {
                    submitButton.disabled = true;
                    submitButton.textContent = 'ĐANG ĐĂNG NHẬP...';
                }

                const data = await api('/api/auth/login', {
                    method: 'POST',
                    body: JSON.stringify({
                        email: formData.email,
                        password: formData.password
                    })
                });

                setSession(data);

                location.href =
                    data.user.role === 'CUSTOMER'
                        ? 'index.html'
                        : 'admin.html';
            } catch (error) {
                showNotice(error.message, 'error');
            } finally {
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = 'ĐĂNG NHẬP';
                }
            }
        });
    }

    // Đăng ký
    const registerForm = document.querySelector('#registerForm');

    if (registerForm) {
        registerForm.addEventListener('submit', async event => {
            event.preventDefault();

            const formData = Object.fromEntries(
                new FormData(registerForm)
            );

            if (
                formData.confirmPassword &&
                formData.password !== formData.confirmPassword
            ) {
                showNotice(
                    'Mật khẩu xác nhận không khớp.',
                    'error'
                );
                return;
            }

            delete formData.confirmPassword;

            try {
                const data = await api('/api/auth/register', {
                    method: 'POST',
                    body: JSON.stringify(formData)
                });

                setSession(data);
                location.href = 'index.html';
            } catch (error) {
                showNotice(error.message, 'error');
            }
        });
    }
});