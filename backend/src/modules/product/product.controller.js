const productService = require('./product.service');

const getProducts = async (req, res) => {
    try {
        const result = await productService.getAllProducts(req.query);
        res.status(200).json({
            success: true,
            data: result.products,
            pagination: result.pagination
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({ success: false, message: error.message });
    }
};

const getProductDetail = async (req, res) => {
    try {
        const product = await productService.getProductById(req.params.id);
        res.status(200).json({
            success: true,
            data: product
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({ success: false, message: error.message });
    }
};

module.exports = {
    getProducts,
    getProductDetail
};