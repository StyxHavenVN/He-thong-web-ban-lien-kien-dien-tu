const userRepository = require('../../repositories/user.repository');
const productRepository = require('../../repositories/product.repository');
const authService = require('../auth/auth.service');
const productService = require('../product/product.service');
const reportService = require('../report/report.service');

async function listCustomers() {
  return (await userRepository.listCustomers()).map(authService.publicUser);
}

async function toggleCustomerLock(id) {
  const user = await userRepository.toggleCustomerLock(id);
  if (!user) throw Object.assign(new Error('Không tìm thấy khách hàng.'), { statusCode: 404 });
  return authService.publicUser(user);
}

const getRevenueReport = () => reportService.revenueReport();
const listProducts = (filters) => productService.getAllProducts(filters, true);
const createProduct = (payload) => productService.createProduct(payload);
const updateProduct = (id, payload) => productService.updateProduct(id, payload);
const deleteProduct = (id) => productService.hideProduct(id);
const listCategories = () => productService.listCategories(true);

async function createCategory(payload = {}) {
  const name = String(payload.name || '').trim();
  const slug = String(payload.slug || '').trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
  if (!name || !slug) throw new Error('Tên và mã danh mục là bắt buộc.');
  return productRepository.createCategory({ id: payload.id || `cat-${slug}`, name, slug, image: payload.image || 'assets/categories/cpu.png' });
}

async function updateCategory(id, payload) {
  const name = String(payload.name || '').trim();
  const slug = String(payload.slug || '').trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
  if (!name || !slug) throw new Error('Tên và mã danh mục là bắt buộc.');
  const category = await productRepository.updateCategory(id, { name, slug, image: payload.image });
  if (!category) throw Object.assign(new Error('Không tìm thấy danh mục.'), { statusCode: 404 });
  return category;
}

async function deleteCategory(id) {
  const category = await productRepository.hideCategory(id);
  if (category?.conflict) throw Object.assign(new Error('Danh mục đang có sản phẩm, không thể xóa.'), { statusCode: 409 });
  if (!category) throw Object.assign(new Error('Không tìm thấy danh mục.'), { statusCode: 404 });
  return category;
}

module.exports = { listCustomers, toggleCustomerLock, getRevenueReport, listProducts, createProduct, updateProduct, deleteProduct, listCategories, createCategory, updateCategory, deleteCategory };
