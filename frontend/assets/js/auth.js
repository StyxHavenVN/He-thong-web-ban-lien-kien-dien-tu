document.addEventListener('DOMContentLoaded', function() {
    const userAuthArea = document.getElementById('user-auth-area');
    
    if (userAuthArea) {
        // Lấy thông tin user và token từ LocalStorage (được lưu lúc login thành công)
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const token = localStorage.getItem('accessToken');

        if (userInfo && token) {
            // Lấy tên ngắn gọn (Ví dụ: "Đoàn Bảo Khanh" -> "Đoàn Bảo Khanh")
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
                    e.preventDefault(); // Ngăn chặn reload mặc định của thẻ <a>
                    
                    // 1. Xóa dữ liệu trong LocalStorage
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('userInfo');
                    
                    // 2. Chuyển hướng về trang chủ và làm mới giao diện
                    window.location.reload();
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
            e.preventDefault(); // CHẶN reload trang (ngăn lỗi 405 của Nginx)

            // Lấy dữ liệu từ các ô input
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
                // Gọi API backend qua Nginx proxy (/api/auth/register)
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ fullname, email, phone, password })
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    alert(data.message); // Báo thành công
                    window.location.href = 'login.html'; // Chuyển hướng sang trang đăng nhập
                } else {
                    alert("Lỗi: " + data.message); // Báo lỗi (ví dụ: email đã tồn tại)
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
            e.preventDefault(); // CHẶN reload trang

            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    alert(data.message);
                    // Lưu JWT Token vào LocalStorage để dùng cho các API sau này
                    localStorage.setItem('accessToken', data.token);
                    localStorage.setItem('userInfo', JSON.stringify(data.data));
                    
                    // Chuyển hướng về trang chủ
                    window.location.href = 'index.html'; 
                } else {
                    alert("Lỗi: " + data.message); // Lỗi sai mật khẩu, tài khoản khóa...
                }
            } catch (error) {
                console.error("Lỗi kết nối API:", error);
                alert("Không thể kết nối đến máy chủ. Vui lòng thử lại!");
            }
        });
    }
});
document.addEventListener('DOMContentLoaded', () => {
    const updateGlobalCartCount = () => {
        // Lấy giỏ hàng từ bộ nhớ máy
        const cart = JSON.parse(localStorage.getItem('cartItems')) || [];
        // Tính tổng số lượng
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        
        // Cập nhật lên tất cả các bóng đỏ trên Header
        document.querySelectorAll('.header-cart-count').forEach(el => {
            el.innerText = totalItems;
        });
    };
    
    // Chạy ngay khi vừa mở trang
    updateGlobalCartCount();
});