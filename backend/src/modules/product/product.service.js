const Product = require('./product.model');
const { Op } = require('sequelize'); // Import các toán tử SQL (LIKE, IN, BETWEEN...)

const getAllProducts = async (filters = {}) => {
    const { keyword, categoryId, brand, minPrice, maxPrice, sort } = filters;
    let whereClause = {};

    // 1. Lọc theo từ khóa tìm kiếm (FR04)
    if (keyword) {
        // Dùng iLike trong Postgres để tìm kiếm không phân biệt chữ Hoa/thường
        whereClause.name = { [Op.iLike]: `%${keyword}%` }; 
    }

    // 2. Lọc theo Danh mục
    if (categoryId) {
        whereClause.categoryId = categoryId;
    }

    // 3. Lọc theo Hãng (Nhiều hãng cùng lúc, vd: NVIDIA,AMD)
    if (brand) {
        const brandArray = brand.split(',');
        whereClause.brand = { [Op.in]: brandArray };
    }

    // 4. Lọc theo Khoảng giá
    if (minPrice || maxPrice) {
        whereClause.price = {};
        if (minPrice) whereClause.price[Op.gte] = parseInt(minPrice);
        if (maxPrice) whereClause.price[Op.lte] = parseInt(maxPrice);
    }

    // 5. Tính năng Sắp xếp
    let orderClause = [['createdAt', 'DESC']]; // Mặc định: Mới nhất
    if (sort === 'price_asc') orderClause = [['price', 'ASC']]; // Giá tăng dần
    if (sort === 'price_desc') orderClause = [['price', 'DESC']]; // Giá giảm dần

    // Truy xuất CSDL với các bộ lọc
    return await Product.findAll({
        where: whereClause,
        order: orderClause
    });
};

module.exports = { getAllProducts };