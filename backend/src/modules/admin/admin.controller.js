const adminService = require('./admin.service');

async function respond(res, callback, status = 200) {
  try {
    res.status(status).json(await callback());
  } catch (error) {
    res.status(error.statusCode || 400).json({ message: error.message });
  }
}

const customers = (_req, res) => respond(res, () => adminService.listCustomers());
const toggleCustomerLock = (req, res) => respond(res, () => adminService.toggleCustomerLock(req.params.id));
const report = (_req, res) => respond(res, () => adminService.getRevenueReport());
const products = (req, res) => respond(res, () => adminService.listProducts(req.query));
const createProduct = (req, res) => respond(res, () => adminService.createProduct(req.body), 201);
const updateProduct = (req, res) => respond(res, () => adminService.updateProduct(req.params.id, req.body));
const deleteProduct = (req, res) => respond(res, () => adminService.deleteProduct(req.params.id));
const categories = (_req, res) => respond(res, () => adminService.listCategories());
const createCategory = (req, res) => respond(res, () => adminService.createCategory(req.body), 201);
const updateCategory = (req, res) => respond(res, () => adminService.updateCategory(req.params.id, req.body));
const deleteCategory = (req, res) => respond(res, () => adminService.deleteCategory(req.params.id));

module.exports = { customers, toggleCustomerLock, report, products, createProduct, updateProduct, deleteProduct, categories, createCategory, updateCategory, deleteCategory };
