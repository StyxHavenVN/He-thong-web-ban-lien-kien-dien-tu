document.addEventListener('DOMContentLoaded', function() {
    const productContainer = document.getElementById('product-list-container');
    if (!productContainer) return; 

    const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price) + ' ₫';

    let currentFilters = {
        keyword: new URLSearchParams(window.location.search).get('keyword') || '',
        categoryId: new URLSearchParams(window.location.search).get('category') || '', 
        sort: 'newest'
    };

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
                                <span>(${product.reviews})</span>
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