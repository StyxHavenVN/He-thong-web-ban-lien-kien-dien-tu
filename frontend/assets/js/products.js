document.addEventListener('DOMContentLoaded', function() {
    const productContainer = document.getElementById('product-list-container');
    if (!productContainer) return; 

    // Tiêm các lớp CSS cho nút phân trang vào trang web động
    const styleEl = document.createElement('style');
    styleEl.textContent = `
        .page-btn {
            padding: 8px 16px;
            border: 1px solid var(--gray-200);
            background: var(--white);
            color: var(--gray-700);
            border-radius: 6px;
            cursor: pointer;
            font-weight: 600;
            font-size: 13px;
            transition: all 0.2s;
            user-select: none;
        }
        .page-btn:hover:not(.disabled) {
            border-color: var(--blue-600);
            color: var(--blue-600);
            background: var(--blue-50);
        }
        .page-btn.active {
            background: var(--blue-600);
            color: var(--white);
            border-color: var(--blue-600);
        }
        .page-btn.disabled {
            opacity: 0.5;
            cursor: not-allowed;
            background: var(--gray-50);
            color: var(--gray-400);
        }
    `;
    document.head.appendChild(styleEl);

    const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price) + ' ₫';

    // Đọc tham mục ban đầu từ URL nếu có
    const urlParams = new URLSearchParams(window.location.search);
    
    let currentFilters = {
        keyword: urlParams.get('keyword') || '',
        categoryId: urlParams.get('category') || 'all',
        brands: [],
        minPrice: '',
        maxPrice: '',
        sort: 'newest',
        page: 1,
        limit: 8 // Mỗi trang hiển thị 8 sản phẩm cho cân đối lưới
    };

    // Đồng bộ UI ban đầu với bộ lọc từ URL hoặc mặc định
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = currentFilters.keyword;

    // Kích hoạt Active trên danh mục sidebar phù hợp
    const syncCategorySidebarUI = () => {
        const categoryLinks = document.querySelectorAll('#category-filter-list a');
        categoryLinks.forEach(link => {
            const li = link.parentElement;
            const catId = link.getAttribute('data-category');
            if (catId === currentFilters.categoryId) {
                li.className = 'active';
            } else {
                li.className = '';
            }
        });
    };
    syncCategorySidebarUI();

    // ==========================================
    // Hàm gọi API và vẽ sản phẩm & phân trang
    // ==========================================
    const fetchAndRenderProducts = async () => {
        try {
            productContainer.innerHTML = '<p style="grid-column: 1/-1; text-align:center; padding: 40px; font-weight: bold; color: var(--blue-600);">Đang tải dữ liệu sản phẩm...</p>';
            
            const queryParams = new URLSearchParams();
            if (currentFilters.keyword) queryParams.append('keyword', currentFilters.keyword);
            if (currentFilters.categoryId && currentFilters.categoryId !== 'all') {
                queryParams.append('categoryId', currentFilters.categoryId);
            }
            if (currentFilters.brands.length > 0) {
                queryParams.append('brand', currentFilters.brands.join(','));
            }
            if (currentFilters.minPrice) queryParams.append('minPrice', currentFilters.minPrice);
            if (currentFilters.maxPrice) queryParams.append('maxPrice', currentFilters.maxPrice);
            if (currentFilters.sort) queryParams.append('sort', currentFilters.sort);
            queryParams.append('page', currentFilters.page);
            queryParams.append('limit', currentFilters.limit);

            const API_BASE = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1') ? 'http://localhost:3000' : '';
            const response = await fetch(`${API_BASE}/api/products?${queryParams.toString()}`);
            const data = await response.json();

            if (response.ok && data.success) {
                const products = data.data;
                const pagination = data.pagination;
                
                productContainer.innerHTML = '';

                // Cập nhật số lượng sản phẩm hiển thị trên tiêu đề
                const totalCountEl = document.getElementById('total-product-count');
                if (totalCountEl && pagination) {
                    totalCountEl.innerText = `Hiển thị ${products.length}/${pagination.totalItems} sản phẩm`;
                }

                if (products.length === 0) {
                    productContainer.innerHTML = '<p style="grid-column: 1/-1; text-align:center; padding: 60px; color: var(--gray-600); font-weight: bold;">Không tìm thấy sản phẩm nào phù hợp.</p>';
                    renderPagination(0, 1);
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

                    // Thay đổi cấu trúc card dẫn tới product-detail.html?id=<id>
                    const cardHTML = `
                        <div class="catalog-card" style="cursor: pointer;" onclick="window.location.href='product-detail.html?id=${product.id}'">
                            ${badgeHTML}
                            <div class="catalog-img">
                                <img src="${product.image}" alt="${product.name}">
                            </div>
                            <div class="catalog-title">${product.name}</div>
                            <div class="catalog-rating">
                                <i class="fi fi-sr-star"></i><i class="fi fi-sr-star"></i><i class="fi fi-sr-star"></i><i class="fi fi-sr-star"></i><i class="fi fi-sr-star"></i>
                                <span>(${product.reviews})</span>
                            </div>
                            <div class="catalog-price">${priceHTML}</div>
                            <div class="catalog-actions" onclick="event.stopPropagation()">
                                <button class="btn-cart-outline"><i class="fi fi-rr-shopping-cart"></i></button>
                                <button class="btn-cart-solid"><i class="fi fi-rr-shopping-cart-add"></i> Thêm vào giỏ</button>
                            </div>
                        </div>
                    `;
                    productContainer.innerHTML += cardHTML;
                });

                // Vẽ giao diện phân trang
                if (pagination) {
                    renderPagination(pagination.totalPages, pagination.page);
                }
            } else {
                productContainer.innerHTML = `<p style="grid-column: 1/-1; text-align:center; padding: 40px; color: #ef4444;">Lỗi: ${data.message}</p>`;
            }
        } catch (error) {
            console.error("Lỗi tải sản phẩm:", error);
            productContainer.innerHTML = '<p style="grid-column: 1/-1; text-align:center; padding: 40px; color: #ef4444; font-weight: bold;">Lỗi kết nối máy chủ để tải dữ liệu sản phẩm.</p>';
        }
    };

    // ==========================================
    // Hàm vẽ bộ phân trang (Pagination)
    // ==========================================
    const renderPagination = (totalPages, currentPage) => {
        const pagContainer = document.getElementById('pagination-container');
        if (!pagContainer) return;
        pagContainer.innerHTML = '';

        if (totalPages <= 1) return; // Không cần phân trang nếu chỉ có 1 hoặc 0 trang

        // Nút trang trước (Prev)
        const prevBtn = document.createElement('button');
        prevBtn.className = `page-btn ${currentPage === 1 ? 'disabled' : ''}`;
        prevBtn.innerHTML = '‹';
        if (currentPage > 1) {
            prevBtn.addEventListener('click', () => {
                currentFilters.page = currentPage - 1;
                fetchAndRenderProducts();
                window.scrollTo({ top: 300, behavior: 'smooth' });
            });
        }
        pagContainer.appendChild(prevBtn);

        // Các số trang
        for (let i = 1; i <= totalPages; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `page-btn ${currentPage === i ? 'active' : ''}`;
            pageBtn.innerText = i;
            pageBtn.addEventListener('click', () => {
                currentFilters.page = i;
                fetchAndRenderProducts();
                window.scrollTo({ top: 300, behavior: 'smooth' });
            });
            pagContainer.appendChild(pageBtn);
        }

        // Nút trang sau (Next)
        const nextBtn = document.createElement('button');
        nextBtn.className = `page-btn ${currentPage === totalPages ? 'disabled' : ''}`;
        nextBtn.innerHTML = '›';
        if (currentPage < totalPages) {
            nextBtn.addEventListener('click', () => {
                currentFilters.page = currentPage + 1;
                fetchAndRenderProducts();
                window.scrollTo({ top: 300, behavior: 'smooth' });
            });
        }
        pagContainer.appendChild(nextBtn);
    };

    // Khởi chạy lấy dữ liệu lần đầu
    fetchAndRenderProducts();

    // ==========================================
    // Đăng ký sự kiện tương tác người dùng
    // ==========================================

    // 1. Tìm kiếm (Tìm từ khóa)
    const executeSearch = (e) => {
        e.preventDefault();
        currentFilters.keyword = searchInput.value.trim();
        currentFilters.page = 1; // Reset về trang 1
        fetchAndRenderProducts();
    };
    const searchBtn = document.getElementById('search-btn');
    if (searchBtn) searchBtn.addEventListener('click', executeSearch);
    if (searchInput) searchInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') executeSearch(e); });

    // 2. Click Danh mục ở Sidebar
    const categoryLinks = document.querySelectorAll('#category-filter-list a');
    categoryLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const catId = this.getAttribute('data-category');
            currentFilters.categoryId = catId;
            currentFilters.page = 1; // Reset trang
            syncCategorySidebarUI();
            
            // Cập nhật tiêu đề trang
            const h1Title = document.querySelector('.toolbar-left h1');
            if (h1Title) {
                h1Title.innerText = this.innerText;
            }

            fetchAndRenderProducts();
        });
    });

    // 3. Lọc theo Hãng (Checkbox change)
    const brandCheckboxes = document.querySelectorAll('#brand-filter-list input[type="checkbox"]');
    brandCheckboxes.forEach(cb => {
        cb.addEventListener('change', function() {
            const checkedBrands = [];
            brandCheckboxes.forEach(item => {
                if (item.checked) checkedBrands.push(item.value);
            });
            currentFilters.brands = checkedBrands;
            currentFilters.page = 1; // Reset trang
            fetchAndRenderProducts();
        });
    });

    // 4. Lọc theo Giá (Button Apply)
    const minPriceInput = document.getElementById('price-min');
    const maxPriceInput = document.getElementById('price-max');
    const applyPriceBtn = document.getElementById('btn-apply-price');

    if (applyPriceBtn) {
        applyPriceBtn.addEventListener('click', function() {
            const minVal = minPriceInput.value.trim();
            const maxVal = maxPriceInput.value.trim();

            if (minVal && parseInt(minVal) < 0) {
                alert("Giá tối thiểu không được âm!");
                return;
            }
            if (maxVal && parseInt(maxVal) < 0) {
                alert("Giá tối đa không được âm!");
                return;
            }
            if (minVal && maxVal && parseInt(minVal) > parseInt(maxVal)) {
                alert("Giá tối thiểu không được lớn hơn giá tối đa!");
                return;
            }

            currentFilters.minPrice = minVal;
            currentFilters.maxPrice = maxVal;
            currentFilters.page = 1; // Reset trang
            fetchAndRenderProducts();
        });
    }

    // 5. Thay đổi Sắp xếp
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentFilters.sort = e.target.value;
            currentFilters.page = 1; // Reset trang
            fetchAndRenderProducts();
        });
    }
});