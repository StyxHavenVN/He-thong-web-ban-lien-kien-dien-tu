const Product = require('./product.model');

const getAllProducts = async () => {
    return await Product.findAll({
        order: [['createdAt', 'DESC']]
    });
};

module.exports = { getAllProducts };