document.addEventListener('DOMContentLoaded', function() {
    const productContainer = document.getElementById('product-list-container');
    if (!productContainer) return; 

    const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price) + ' ₫';

    let currentFilters = {
        keyword: new URLSearchParams(window.location.search).get('keyword') || '',
        categoryId: new URLSearchParams(window.location.search).get('category') || '', 
        sort: 'newest'
    };

    // ==================================================
    // Cập nhật số lượng giỏ hàng trên Header khi load trang
    // ==================================================
    const updateHeaderCartCount = () => {
        const cart = JSON.parse(localStorage.getItem('cartItems')) || [];
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        document.querySelectorAll('.header-cart-count').forEach(el => el.innerText = totalItems);
    };
    updateHeaderCartCount(); // Gọi ngay lần đầu mở trang

    const fetchAndRenderProducts = async () => {
        try {
            productContainer.innerHTML = '<p style="grid-column: 1/-1; text-align:center; padding: 40px; font-weight: bold; color: var(--blue-600);">Đang tải dữ liệu...</p>';

            const queryParams = new URLSearchParams();
            if (currentFilters.keyword) queryParams.append('keyword', currentFilters.keyword);
            if (currentFilters.categoryId) queryParams.append('categoryId', currentFilters.categoryId);
            if (currentFilters.sort) queryParams.append('sort', currentFilters.sort);

            const response = await fetch(`/api/products?${queryParams.toString()}`);
            const data = await response.json();

            if (response.ok && data.success) {
                const products = data.data;
                productContainer.innerHTML = '';

                const totalCountEl = document.getElementById('total-product-count');
                if (totalCountEl) totalCountEl.innerText = `Hiển thị ${products.length} sản phẩm`;

                if(products.length === 0) {
                    productContainer.innerHTML = '<p style="grid-column: 1/-1; text-align:center; padding: 40px; color: var(--gray-600);">Không tìm thấy sản phẩm nào.</p>';
                    return;
                }

                products.forEach(product => {
                    let badgeHTML = '';
                    if (product.badge) {
                        const bgClass = product.badge === 'MỚI' ? 'bg-blue' : 'bg-red';
                        badgeHTML = `<div class="catalog-badge ${bgClass}">${product.badge}</div>`;
                    }

                    let priceHTML = `<div class="price-current text-blue">${formatPrice(product.price)}</div>`;
                    if (product.oldPrice) {
                        priceHTML = `<div class="price-current text-red">${formatPrice(product.price)}</div>
                                     <div class="price-old">${formatPrice(product.oldPrice)}</div>`;
                    }

                    const cardHTML = `
                        <div class="catalog-card">
                            ${badgeHTML}
                                <div class="catalog-img">
                                    <img src="${product.image}" alt="${product.name}">
                                </div>
                            <div class="catalog-title">${product.name}</div>
                            <div class="catalog-rating">
                                <i class="fi fi-sr-star"></i><i class="fi fi-sr-star"></i><i class="fi fi-sr-star"></i><i class="fi fi-sr-star"></i><i class="fi fi-sr-star"></i>
                                <span>(${product.reviews || 0})</span>
                            </div>
                            <div class="catalog-price">${priceHTML}</div>
                            <div class="catalog-actions">
                                <button class="btn-cart-outline"><i class="fi fi-rr-shopping-cart"></i></button>
                                <button class="btn-cart-solid"><i class="fi fi-rr-shopping-cart-add"></i> Thêm vào giỏ</button>
                            </div>
                        </div>
                    `;
                    productContainer.innerHTML += cardHTML;
                });

                // ==================================================
                // LOGIC XỬ LÝ THÊM VÀO GIỎ HÀNG
                // ==================================================
                const attachCartEvent = (buttonClass) => {
                    document.querySelectorAll(buttonClass).forEach((btn, index) => {
                        btn.addEventListener('click', () => {
                            const product = products[index]; // Lấy đúng sản phẩm tại vị trí click
                            
                            let cart = JSON.parse(localStorage.getItem('cartItems')) || [];
                            
                            // Kiểm tra xem sản phẩm đã có trong giỏ chưa (Dựa vào ID hoặc Tên)
                            const existingItem = cart.find(item => (item.id && item.id === product.id) || item.name === product.name);
                            
                            if (existingItem) {
                                existingItem.quantity += 1; // Nếu có rồi thì tăng số lượng
                            } else {
                                cart.push({ // Nếu chưa có thì tạo mới
                                    id: product.id || new Date().getTime(),
                                    name: product.name,
                                    image: product.image,
                                    price: product.price,
                                    quantity: 1
                                });
                            }
                            
                            // Lưu vào trình duyệt và thông báo
                            localStorage.setItem('cartItems', JSON.stringify(cart));
                            alert(`Đã thêm "${product.name}" vào giỏ hàng!`);
                            
                            // Cập nhật lại con số màu đỏ trên Header
                            updateHeaderCartCount();
                        });
                    });
                };

                // Kích hoạt sự kiện cho cả 2 loại nút trên thẻ sản phẩm
                attachCartEvent('.btn-cart-solid');
                attachCartEvent('.btn-cart-outline');
            }
        } catch (error) {
            productContainer.innerHTML = '<p style="grid-column: 1/-1; text-align:center;">Lỗi tải dữ liệu sản phẩm.</p>';
        }
    };

    fetchAndRenderProducts();

    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    if(searchInput) searchInput.value = currentFilters.keyword;

    const executeSearch = (e) => {
        e.preventDefault();
        currentFilters.keyword = searchInput.value.trim();
        fetchAndRenderProducts();
    };
    if(searchBtn) searchBtn.addEventListener('click', executeSearch);
    if(searchInput) searchInput.addEventListener('keypress', (e) => { if(e.key === 'Enter') executeSearch(e); });

    const sortSelect = document.getElementById('sort-select');
    if(sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentFilters.sort = e.target.value;
            fetchAndRenderProducts();
        });
    }
});