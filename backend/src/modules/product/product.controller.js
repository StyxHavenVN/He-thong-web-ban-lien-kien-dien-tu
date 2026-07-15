const productService = require('./product.service');

async function handle(res, callback, successStatus = 200) {
  try {
    res.status(successStatus).json({ success: true, data: await callback() });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
}

const getProducts = (req, res) => handle(res, () => productService.getAllProducts(req.query));
const getProduct = (req, res) => handle(res, () => productService.getProduct(req.params.id));
const getCompatibility = (req, res) => handle(res, () => productService.getCompatibility(req.params.id));
const getCategories = (_req, res) => handle(res, () => productService.listCategories());

module.exports = { getProducts, getProduct, getCompatibility, getCategories };
