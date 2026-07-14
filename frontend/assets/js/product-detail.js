document.addEventListener('DOMContentLoaded', async function() {
    const detailWrapper = document.getElementById('product-detail-wrapper');
    const breadcrumbName = document.getElementById('breadcrumb-product-name');
    const breadcrumbContainer = document.getElementById('breadcrumb-container');
    
    if (!detailWrapper) return;

    // 1. Lấy mã ID sản phẩm từ URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        detailWrapper.innerHTML = `
            <div class="detail-container" style="text-align: center; padding: 50px;">
                <h2 style="color: #ef4444; margin-bottom: 16px;">Mã sản phẩm không hợp lệ!</h2>
                <a href="products.html" class="btn-buy-now" style="display: inline-block; padding: 12px 24px; text-decoration: none; width: auto;">Quay lại cửa hàng</a>
            </div>
        `;
        return;
    }

    const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price) + ' ₫';

    try {
        const API_BASE = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1') ? 'http://localhost:3000' : '';
        const response = await fetch(`${API_BASE}/api/products/${productId}`);
        const data = await response.json();

        if (response.ok && data.success) {
            const product = data.data;

            // Cập nhật breadcrumb
            if (product.category) {
                breadcrumbContainer.innerHTML = `
                    <a href="index.html">Trang chủ</a> > 
                    <a href="products.html?category=${product.category.id}">${product.category.name}</a> > 
                    <strong style="color: var(--gray-900);">${product.name}</strong>
                `;
            } else {
                breadcrumbName.innerText = product.name;
            }

            // Nhãn trạng thái kho hàng
            let stockStatusHTML = '';
            let isOutOfStock = product.stock <= 0;

            if (isOutOfStock) {
                stockStatusHTML = `<span class="status-badge status-inactive"><i class="fi fi-rr-cross-circle"></i> Tạm hết hàng</span>`;
            } else {
                stockStatusHTML = `<span class="status-badge status-active"><i class="fi fi-rr-check-circle"></i> Còn hàng (Còn ${product.stock} sản phẩm)</span>`;
            }

            // Nhãn huy hiệu khuyến mãi/mới
            let badgeHTML = '';
            if (product.badge) {
                const bgClass = product.badge === 'MỚI' ? 'bg-blue' : 'bg-red';
                badgeHTML = `<div class="detail-badge ${bgClass}">${product.badge}</div>`;
            }

            // Giao diện giá
            let priceHTML = `<div class="price-big">${formatPrice(product.price)}</div>`;
            if (product.oldPrice) {
                priceHTML = `
                    <div class="price-big">${formatPrice(product.price)}</div>
                    <div class="price-old-big">${formatPrice(product.oldPrice)}</div>
                `;
            }

            // Xử lý thông số kỹ thuật (specs)
            let specs = {};
            if (product.specs) {
                try {
                    specs = typeof product.specs === 'string' ? JSON.parse(product.specs) : product.specs;
                } catch (e) {
                    console.error("Lỗi parse specs:", e);
                }
            }

            let specsTableRowsHTML = '';
            const specEntries = Object.entries(specs);
            if (specEntries.length > 0) {
                specEntries.forEach(([key, val]) => {
                    specsTableRowsHTML += `
                        <tr>
                            <td class="spec-name">${key}</td>
                            <td>${val}</td>
                        </tr>
                    `;
                });
            } else {
                specsTableRowsHTML = `<tr><td colspan="2" style="text-align: center; color: var(--gray-400);">Không có thông số kỹ thuật chi tiết.</td></tr>`;
            }

            // Vẽ toàn bộ thông tin chi tiết
            detailWrapper.innerHTML = `
                <div class="detail-container">
                    <div class="detail-layout">
                        <!-- Cột trái: Hình ảnh -->
                        <div class="detail-img-box">
                            ${badgeHTML}
                            <img src="${product.image}" alt="${product.name}">
                        </div>

                        <!-- Cột phải: Thông tin đặt hàng -->
                        <div class="detail-info">
                            <h1 class="detail-title">${product.name}</h1>
                            
                            <div class="detail-meta">
                                <div class="detail-rating">
                                    <i class="fi fi-ss-star"></i>
                                    <span>${product.rating}</span>
                                </div>
                                <span>|</span>
                                <span>Hãng: <strong>${product.brand || 'Khác'}</strong></span>
                                <span>|</span>
                                ${stockStatusHTML}
                            </div>

                            <div class="detail-price-box">
                                ${priceHTML}
                            </div>

                            <!-- Mô tả ngắn gọn -->
                            <div style="font-size: 14.5px; color: var(--gray-600); margin: 10px 0;">
                                ${product.description || 'Không có mô tả cho sản phẩm này.'}
                            </div>

                            <!-- Chọn số lượng & Mua -->
                            <div class="detail-actions">
                                <div class="quantity-selector">
                                    <button class="qty-btn" id="btn-qty-minus">-</button>
                                    <input type="number" class="qty-input" id="input-qty" value="1" min="1" max="${product.stock || 1}" readonly>
                                    <button class="qty-btn" id="btn-qty-plus">+</button>
                                </div>
                                <button class="btn-buy-now" id="btn-buy-now" ${isOutOfStock ? 'disabled style="background: var(--gray-400); cursor: not-allowed;"' : ''}>
                                    ${isOutOfStock ? 'TẠM HẾT HÀNG' : 'MUA NGAY'}
                                </button>
                                <button class="btn-add-cart" id="btn-add-cart" ${isOutOfStock ? 'disabled style="border-color: var(--gray-300); color: var(--gray-400); cursor: not-allowed;"' : ''}>
                                    Thêm vào giỏ
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Khu vực tab thông tin chi tiết dưới -->
                    <div class="tabs-container">
                        <div class="tab-header">
                            <div class="tab-item active" data-tab="specs">Thông số kỹ thuật</div>
                            <div class="tab-item" data-tab="description">Mô tả sản phẩm</div>
                        </div>
                        
                        <div class="tab-content" id="tab-content-area">
                            <table class="specs-table">
                                <tbody>
                                    ${specsTableRowsHTML}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;

            // Đăng ký các sự kiện tương tác của trang chi tiết
            const btnMinus = document.getElementById('btn-qty-minus');
            const btnPlus = document.getElementById('btn-qty-plus');
            const inputQty = document.getElementById('input-qty');
            
            if (btnMinus && btnPlus && inputQty && !isOutOfStock) {
                btnMinus.addEventListener('click', () => {
                    let val = parseInt(inputQty.value);
                    if (val > 1) {
                        inputQty.value = val - 1;
                    }
                });

                btnPlus.addEventListener('click', () => {
                    let val = parseInt(inputQty.value);
                    if (val < product.stock) {
                        inputQty.value = val + 1;
                    }
                });
            }

            // Xử lý thêm vào giỏ hàng
            const btnAddCart = document.getElementById('btn-add-cart');
            const btnBuyNow = document.getElementById('btn-buy-now');

            if (btnAddCart && !isOutOfStock) {
                btnAddCart.addEventListener('click', () => {
                    const qty = parseInt(inputQty.value);
                    alert(`Đã thêm ${qty} sản phẩm "${product.name}" vào giỏ hàng thành công!`);
                });
            }
            if (btnBuyNow && !isOutOfStock) {
                btnBuyNow.addEventListener('click', () => {
                    const qty = parseInt(inputQty.value);
                    alert(`Đặt mua ngay ${qty} sản phẩm "${product.name}". Chuyển hướng tới trang thanh toán!`);
                });
            }

            // Xử lý chuyển tab thông số / mô tả
            const tabItems = document.querySelectorAll('.tab-item');
            const tabContentArea = document.getElementById('tab-content-area');

            tabItems.forEach(tab => {
                tab.addEventListener('click', function() {
                    tabItems.forEach(t => t.classList.remove('active'));
                    this.classList.add('active');

                    const tabName = this.getAttribute('data-tab');
                    if (tabName === 'specs') {
                        tabContentArea.innerHTML = `
                            <table class="specs-table">
                                <tbody>
                                    ${specsTableRowsHTML}
                                </tbody>
                            </table>
                        `;
                    } else {
                        tabContentArea.innerHTML = `
                            <div style="padding: 15px 10px; color: var(--gray-700);">
                                ${product.description || 'Không có mô tả cho sản phẩm này.'}
                            </div>
                        `;
                    }
                });
            });

        } else {
            detailWrapper.innerHTML = `
                <div class="detail-container" style="text-align: center; padding: 60px;">
                    <h2 style="color: #ef4444; margin-bottom: 20px;">${data.message || 'Sản phẩm không tồn tại!'}</h2>
                    <a href="products.html" class="btn-buy-now" style="display: inline-block; padding: 12px 24px; text-decoration: none; width: auto; font-size: 14px;">Quay lại danh sách sản phẩm</a>
                </div>
            `;
            breadcrumbName.innerText = 'Không tìm thấy sản phẩm';
        }

    } catch (error) {
        console.error("Lỗi API chi tiết sản phẩm:", error);
        detailWrapper.innerHTML = `
            <div class="detail-container" style="text-align: center; padding: 60px;">
                <h2 style="color: #ef4444; margin-bottom: 20px;">Lỗi kết nối máy chủ!</h2>
                <a href="products.html" class="btn-buy-now" style="display: inline-block; padding: 12px 24px; text-decoration: none; width: auto; font-size: 14px;">Quay lại danh sách sản phẩm</a>
            </div>
        `;
        breadcrumbName.innerText = 'Lỗi tải dữ liệu';
    }
});
