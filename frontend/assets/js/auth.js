document.addEventListener('DOMContentLoaded', function() {
    const userAuthArea = document.getElementById('user-auth-area');
    
    if (userAuthArea) {
        // Lấy thông tin user và token từ LocalStorage (thống nhất khóa token/user)
        const userInfo = JSON.parse(localStorage.getItem('user'));
        const token = localStorage.getItem('token');

        if (userInfo && token) {
            // Lấy tên hiển thị
            const displayName = userInfo.fullname || userInfo.email.split('@')[0];

            // Thay đổi giao diện
            userAuthArea.innerHTML = `
                <div class="user-logged-in">
                    <span class="user-name" title="${displayName}">Chào, ${displayName}</span>
                    <a href="#" id="logout-btn" class="logout-link">Đăng xuất</a>
                </div>
            `;

            // Bắt sự kiện khi click Đăng xuất
            const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    // Xóa dữ liệu trong LocalStorage
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    
                    // Chuyển hướng về trang chủ và làm mới giao diện
                    window.location.href = 'index.html';
                });
            }
        }
    }

    const togglePasswordIcons = document.querySelectorAll('.toggle-password');

    togglePasswordIcons.forEach(icon => {
        icon.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const passwordInput = document.getElementById(targetId);

            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                this.classList.remove('bx-hide');
                this.classList.add('bx-show');
            } else {
                passwordInput.type = 'password';
                this.classList.remove('bx-show');
                this.classList.add('bx-hide');
            }
        });
    });

    // ==========================================
    // 2. Xử lý Gọi API Đăng ký (FR01)
    // ==========================================
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const fullname = document.getElementById('fullname').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const password = document.getElementById('reg-password').value;
            const confirmPassword = document.getElementById('reg-confirm-password').value;

            // Kiểm tra mật khẩu khớp nhau
            if (password !== confirmPassword) {
                alert("Mật khẩu xác nhận không khớp!");
                return;
            }

            try {
                // Tự động lấy nguồn gốc host để tránh lỗi CORS khi dev local
                const API_BASE = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1') ? 'http://localhost:3000' : '';
                
                const response = await fetch(`${API_BASE}/api/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ fullname, email, phone, password })
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    alert(data.message);
                    window.location.href = 'login.html';
                } else {
                    alert("Lỗi: " + data.message);
                }
            } catch (error) {
                console.error("Lỗi kết nối API:", error);
                alert("Không thể kết nối đến máy chủ. Vui lòng thử lại!");
            }
        });
    }

    // ==========================================
    // 3. Xử lý Gọi API Đăng nhập (FR02)
    // ==========================================
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            try {
                const API_BASE = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1') ? 'http://localhost:3000' : '';

                const response = await fetch(`${API_BASE}/api/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    alert(data.message);
                    // Lưu JWT Token và User Info vào LocalStorage
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.data));
                    
                    // Điều hướng theo vai trò (Role-Based Redirect)
                    if (data.data.role === 'ADMIN' || data.data.role === 'STAFF') {
                        window.location.href = 'admin.html';
                    } else {
                        window.location.href = 'index.html';
                    }
                } else {
                    alert("Lỗi: " + data.message);
                }
            } catch (error) {
                console.error("Lỗi kết nối API:", error);
                alert("Không thể kết nối đến máy chủ. Vui lòng thử lại!");
            }
        });
    }
});