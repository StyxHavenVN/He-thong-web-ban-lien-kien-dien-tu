document.addEventListener('DOMContentLoaded', function() {
    // Xử lý sự kiện Ẩn/Hiện mật khẩu
    const togglePasswordIcons = document.querySelectorAll('.toggle-password');

    togglePasswordIcons.forEach(icon => {
        icon.addEventListener('click', function() {
            // Lấy ID của input cần toggle từ attribute data-target
            const targetId = this.getAttribute('data-target');
            const passwordInput = document.getElementById(targetId);

            // Chuyển đổi type input
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
});