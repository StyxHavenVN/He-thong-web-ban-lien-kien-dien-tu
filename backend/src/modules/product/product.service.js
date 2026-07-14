const Product = require('./product.model');
const Category = require('./category.model');
const { Op } = require('sequelize');

const getAllProducts = async (filters = {}) => {
    const { keyword, categoryId, brand, minPrice, maxPrice, sort, page, limit } = filters;
    let whereClause = {};

    // Chỉ hiển thị sản phẩm đang kinh doanh
    whereClause.active = true;

    // 1. Phân trang: Đọc và Validate page, limit
    const pageNum = parseInt(page || 1);
    const limitNum = parseInt(limit || 10);

    if (isNaN(pageNum) || pageNum < 1) {
        const error = new Error("Số trang 'page' phải lớn hơn hoặc bằng 1!");
        error.statusCode = 400;
        throw error;
    }
    if (isNaN(limitNum) || limitNum < 1) {
        const error = new Error("Số lượng giới hạn 'limit' phải lớn hơn hoặc bằng 1!");
        error.statusCode = 400;
        throw error;
    }

    // 2. Validate khoảng giá lọc
    if (minPrice !== undefined && minPrice !== '') {
        const min = parseInt(minPrice);
        if (isNaN(min) || min < 0) {
            const error = new Error("Giá trị minPrice không được phép âm!");
            error.statusCode = 400;
            throw error;
        }
    }
    if (maxPrice !== undefined && maxPrice !== '') {
        const max = parseInt(maxPrice);
        if (isNaN(max) || max < 0) {
            const error = new Error("Giá trị maxPrice không được phép âm!");
            error.statusCode = 400;
            throw error;
        }
    }
    if (minPrice !== undefined && minPrice !== '' && maxPrice !== undefined && maxPrice !== '') {
        if (parseInt(minPrice) > parseInt(maxPrice)) {
            const error = new Error("Giá trị minPrice không được lớn hơn maxPrice!");
            error.statusCode = 400;
            throw error;
        }
    }

    // 3. Tìm kiếm theo từ khóa
    if (keyword) {
        whereClause.name = { [Op.iLike]: `%${keyword}%` };
    }

    // 4. Lọc theo Danh mục
    if (categoryId) {
        whereClause.categoryId = categoryId;
    }

    // 5. Lọc theo Hãng (Nhiều hãng cách nhau bằng dấu phẩy)
    if (brand) {
        const brandArray = brand.split(',').map(b => b.trim()).filter(Boolean);
        if (brandArray.length > 0) {
            whereClause.brand = { [Op.in]: brandArray };
        }
    }

    // 6. Lọc theo khoảng giá
    if ((minPrice !== undefined && minPrice !== '') || (maxPrice !== undefined && maxPrice !== '')) {
        whereClause.price = {};
        if (minPrice !== undefined && minPrice !== '') {
            whereClause.price[Op.gte] = parseInt(minPrice);
        }
        if (maxPrice !== undefined && maxPrice !== '') {
            whereClause.price[Op.lte] = parseInt(maxPrice);
        }
    }

    // 7. Sắp xếp kết quả
    let orderClause = [['createdAt', 'DESC']]; // Mặc định: mới nhất
    if (sort === 'price_asc') orderClause = [['price', 'ASC']];
    if (sort === 'price_desc') orderClause = [['price', 'DESC']];
    if (sort === 'newest') orderClause = [['createdAt', 'DESC']];

    // 8. Tính toán phân trang
    const offset = (pageNum - 1) * limitNum;

    // 9. Truy xuất DB
    const { count, rows } = await Product.findAndCountAll({
        where: whereClause,
        include: [{
            model: Category,
            as: 'category',
            attributes: ['id', 'name']
        }],
        order: orderClause,
        limit: limitNum,
        offset: offset
    });

    const totalPages = Math.ceil(count / limitNum);

    return {
        products: rows,
        pagination: {
            page: pageNum,
            limit: limitNum,
            totalItems: count,
            totalPages: totalPages
        }
    };
};

const getProductById = async (id) => {
    if (!id) {
        const error = new Error("Mã sản phẩm không hợp lệ!");
        error.statusCode = 400;
        throw error;
    }

    const product = await Product.findByPk(id, {
        include: [{
            model: Category,
            as: 'category',
            attributes: ['id', 'name']
        }]
    });

    if (!product || !product.active) {
        const error = new Error("Sản phẩm không tồn tại hoặc đã ngừng kinh doanh!");
        error.statusCode = 404;
        throw error;
    }

    return product;
};

module.exports = {
    getAllProducts,
    getProductById
};