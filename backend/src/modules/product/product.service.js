const { v4: uuid } = require('uuid');
const { readDb, writeDb } = require('../../repositories/jsonRepository');

function withCategory(product, db) {
  const category = db.categories.find(c => c.id === product.categoryId);
  return { ...product, categoryName: category ? category.name : 'Khác' };
}

function listProducts(query = {}) {
  const db = readDb();
  let products = db.products.map(p => withCategory(p, db));
  if (query.search) {
    const keyword = query.search.toLowerCase();
    products = products.filter(p => p.name.toLowerCase().includes(keyword) || p.brand.toLowerCase().includes(keyword));
  }
  if (query.category) products = products.filter(p => p.categoryId === query.category);
  if (query.brand) products = products.filter(p => p.brand.toLowerCase() === query.brand.toLowerCase());
  if (query.minPrice) products = products.filter(p => p.price >= Number(query.minPrice));
  if (query.maxPrice) products = products.filter(p => p.price <= Number(query.maxPrice));
  return products;
}

function getProduct(id) {
  const db = readDb();
  const product = db.products.find(p => p.id === id);
  if (!product) throw new Error('Không tìm thấy sản phẩm.');
  return withCategory(product, db);
}

function getRecommendations(productId) {
  const db = readDb();
  const product = db.products.find(p => p.id === productId);
  if (!product) throw new Error('Không tìm thấy sản phẩm.');
  const specs = product.specs || {};
  return db.products
    .filter(p => p.id !== product.id && p.stock > 0)
    .filter(p => {
      const s = p.specs || {};
      return (specs.socket && s.socket === specs.socket)
        || (specs.ramType && s.ramType && String(specs.ramType).includes(s.ramType))
        || (specs.requiredPower && s.power && s.power >= specs.requiredPower)
        || (specs.power && s.requiredPower && specs.power >= s.requiredPower);
    })
    .map(p => withCategory(p, db));
}

function createProduct(data) {
  const db = readDb();
  const product = { id: uuid(), stock: 0, specs: {}, ...data, price: Number(data.price || 0), stock: Number(data.stock || 0) };
  db.products.push(product);
  writeDb(db);
  return product;
}

function updateProduct(id, data) {
  const db = readDb();
  const index = db.products.findIndex(p => p.id === id);
  if (index === -1) throw new Error('Không tìm thấy sản phẩm.');
  db.products[index] = { ...db.products[index], ...data, price: Number(data.price ?? db.products[index].price), stock: Number(data.stock ?? db.products[index].stock) };
  writeDb(db);
  return db.products[index];
}

function deleteProduct(id) {
  const db = readDb();
  db.products = db.products.filter(p => p.id !== id);
  writeDb(db);
  return { success: true };
}

function listCategories() {
  return readDb().categories;
}

module.exports = { listProducts, getProduct, getRecommendations, createProduct, updateProduct, deleteProduct, listCategories };
