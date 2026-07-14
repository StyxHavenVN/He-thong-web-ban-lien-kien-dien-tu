document.addEventListener('DOMContentLoaded', () => {
    const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price) + ' ₫';
    
    // Lấy dữ liệu giỏ hàng từ LocalStorage (Nếu chưa có thì tạo mảng rỗng)
    let cart = JSON.parse(localStorage.getItem('cartItems')) || [];

    const cartList = document.getElementById('cart-list');
    const cartContentWrapper = document.getElementById('cart-content-wrapper');
    const emptyCartMessage = document.getElementById('empty-cart-message');

    // Hàm cập nhật lại số đếm ở Header và Tiêu đề
    const updateHeaderCount = () => {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        
        // Cập nhật số đỏ trên cục icon giỏ hàng ở mọi trang
        document.querySelectorAll('.header-cart-count').forEach(el => el.innerText = totalItems);
        
        // Cập nhật tiêu đề trang giỏ hàng
        const countTitle = document.getElementById('cart-count-title');
        const summaryQty = document.getElementById('summary-qty-text');
        if(countTitle) countTitle.innerText = `(${totalItems} sản phẩm)`;
        if(summaryQty) summaryQty.innerText = `Tạm tính (${totalItems} sản phẩm)`;
    };

    // Hàm tính toán và cập nhật cột bên phải
    const updateOrderSummary = () => {
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        document.getElementById('subtotal').innerText = formatPrice(subtotal);
        document.getElementById('grand-total').innerText = formatPrice(subtotal); // Bằng tạm tính vì miễn phí ship
    };

    // Hàm Vẽ (Render) giỏ hàng ra HTML
    const renderCart = () => {
        updateHeaderCount();

        if (cart.length === 0) {
            if(cartContentWrapper) cartContentWrapper.style.display = 'none';
            if(emptyCartMessage) emptyCartMessage.style.display = 'block';
            return;
        }

        if(cartContentWrapper) cartContentWrapper.style.display = 'block';
        if(emptyCartMessage) emptyCartMessage.style.display = 'none';

        cartList.innerHTML = '';
        cart.forEach((item, index) => {
            const itemHTML = `
                <div class="cart-item">
                  <div class="cart-product">
                    <img class="product-image" src="${item.image || 'https://placehold.co/80'}" alt="${item.name}">
                    <div class="product-info">
                      <h3>${item.name}</h3>
                      <p>Bảo hành: 36 tháng</p>
                      <span class="stock-status"><i class="fi fi-sr-check-circle"></i> Còn hàng</span>
                    </div>
                  </div>
                  <div class="unit-price text-center">${formatPrice(item.price)}</div>
                  
                  <div class="quantity-control">
                    <button class="quantity-btn btn-decrease" data-index="${index}">−</button>
                    <input type="number" class="quantity-input" value="${item.quantity}" readonly>
                    <button class="quantity-btn btn-increase" data-index="${index}">+</button>
                  </div>
                  
                  <div class="item-total text-right">${formatPrice(item.price * item.quantity)}</div>
                  <div class="text-center">
                    <button class="remove-item" data-index="${index}"><i class="fi fi-rr-trash"></i></button>
                  </div>
                </div>
            `;
            cartList.innerHTML += itemHTML;
        });

        updateOrderSummary();
        attachEventListeners(); // Gắn sự kiện cho các nút vừa tạo
    };

    // Hàm Lắng nghe các nút Bấm trong Giỏ hàng
    const attachEventListeners = () => {
        // Nút Tăng Số lượng
        document.querySelectorAll('.btn-increase').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = e.target.getAttribute('data-index');
                cart[index].quantity += 1;
                saveAndRender();
            });
        });

        // Nút Giảm Số lượng
        document.querySelectorAll('.btn-decrease').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = e.target.getAttribute('data-index');
                if (cart[index].quantity > 1) {
                    cart[index].quantity -= 1;
                    saveAndRender();
                }
            });
        });

        // Nút Xóa Sản phẩm (Thùng rác)
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = e.currentTarget.getAttribute('data-index');
                cart.splice(index, 1); // Xóa khỏi mảng
                saveAndRender();
            });
        });
    };

    // Lưu vào bộ nhớ và Cập nhật lại UI
    const saveAndRender = () => {
        localStorage.setItem('cartItems', JSON.stringify(cart));
        renderCart();
    };

    // Nút "Xóa toàn bộ giỏ hàng"
    const btnClearCart = document.getElementById('btn-clear-cart');
    if (btnClearCart) {
        btnClearCart.addEventListener('click', () => {
            if(confirm('Bạn có chắc muốn xóa tất cả sản phẩm trong giỏ hàng?')) {
                cart = [];
                saveAndRender();
            }
        });
    }

    // Chạy lần đầu tiên khi mở trang
    renderCart();
});