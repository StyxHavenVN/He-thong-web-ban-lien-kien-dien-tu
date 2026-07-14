const productService = require('./product.service');

const getProducts = async (req, res) => {
    try {
        // Lấy tất cả tham số truy vấn (?keyword=...&brand=...) truyền vào hàm Service
        const products = await productService.getAllProducts(req.query);
        res.status(200).json({ success: true, data: products });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getProducts };