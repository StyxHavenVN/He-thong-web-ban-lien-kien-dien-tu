document.addEventListener('DOMContentLoaded', async function() {
    const productContainer = document.getElementById('product-list-container');
    if (!productContainer) return; 

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN').format(price) + ' ₫';
    };

    try {
        const response = await fetch('/api/products');
        const data = await response.json();

        if (response.ok && data.success) {
            const products = data.data;
            productContainer.innerHTML = '';

            products.forEach(product => {
                // Xử lý Badge
                let badgeHTML = '';
                if (product.badge) {
                    const bgClass = product.badge === 'MỚI' ? 'bg-blue' : 'bg-red';
                    badgeHTML = `<div class="catalog-badge ${bgClass}">${product.badge}</div>`;
                }

                // Xử lý Giá tiền
                let priceHTML = `<div class="price-current text-blue">${formatPrice(product.price)}</div>`;
                if (product.oldPrice) {
                    priceHTML = `
                        <div class="price-current text-red">${formatPrice(product.price)}</div>
                        <div class="price-old">${formatPrice(product.oldPrice)}</div>
                    `;
                }

                // Render Card
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
                        <div class="catalog-price">
                            ${priceHTML}
                        </div>
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
        productContainer.innerHTML = '<p style="grid-column: 1/-1; text-align:center; padding: 20px;">Lỗi tải dữ liệu sản phẩm.</p>';
    }
});