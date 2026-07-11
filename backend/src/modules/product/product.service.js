const { v4: uuid } = require('uuid');
const { readDb, writeDb } = require('../../repositories/jsonRepository');

function withCategory(product, db) {
  const category = db.categories.find(c => c.id === product.categoryId);
  return { ...product, categoryName: category ? category.name : 'Khác' };
}

function listProducts(query = {}) {
  const db = readDb();
  const allProducts = db.products.filter(p => p.active !== false).map(p => withCategory(p, db));
  let products = [...allProducts];
  if (query.search) {
    const keyword = String(query.search).trim().toLowerCase();
    if (keyword.length > 100) throw new Error('Từ khóa tìm kiếm không hợp lệ.');
    products = products.filter(p => [p.name, p.brand, p.description]
      .some(value => String(value || '').toLowerCase().includes(keyword)));
  }
  if (query.category) products = products.filter(p => p.categoryId === query.category);
  if (query.brand) products = products.filter(p => p.brand.toLowerCase() === query.brand.toLowerCase());
  if (query.spec) {
    const spec = String(query.spec).trim().toLowerCase();
    products = products.filter(p => JSON.stringify(p.specs || {}).toLowerCase().includes(spec));
  }
  const minPrice = query.minPrice === undefined || query.minPrice === '' ? null : Number(query.minPrice);
  const maxPrice = query.maxPrice === undefined || query.maxPrice === '' ? null : Number(query.maxPrice);
  if (minPrice !== null && (!Number.isFinite(minPrice) || minPrice < 0)) throw new Error('Giá tối thiểu không hợp lệ.');
  if (maxPrice !== null && (!Number.isFinite(maxPrice) || maxPrice < 0)) throw new Error('Giá tối đa không hợp lệ.');
  if (minPrice !== null) products = products.filter(p => p.price >= minPrice);
  if (maxPrice !== null) products = products.filter(p => p.price <= maxPrice);
  if (query.sort === 'price_asc') products.sort((a, b) => a.price - b.price);
  if (query.sort === 'price_desc') products.sort((a, b) => b.price - a.price);
  if (query.sort === 'name_asc') products.sort((a, b) => a.name.localeCompare(b.name, 'vi'));

  if (query.page !== undefined || query.limit !== undefined) {
    const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
    const limit = Math.min(48, Math.max(1, Number.parseInt(query.limit, 10) || 8));
    const totalItems = products.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / limit));
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * limit;
    return {
      items: products.slice(start, start + limit),
      pagination: { page: safePage, limit, totalItems, totalPages },
      filters: { brands: [...new Set(allProducts.map(p => p.brand))].sort() }
    };
  }
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
  const candidates = db.products
    .filter(p => p.id !== product.id && p.active !== false);
  let recommendations = candidates
    .filter(p => {
      const s = p.specs || {};
      if (product.categoryId === 'cat-cpu') {
        return (p.categoryId === 'cat-mainboard' && specs.socket && s.socket === specs.socket)
          || (p.categoryId === 'cat-ram' && specs.ramType && s.ramType && String(specs.ramType).includes(s.ramType));
      }
      if (product.categoryId === 'cat-mainboard') {
        return (p.categoryId === 'cat-cpu' && specs.socket && s.socket === specs.socket)
          || (p.categoryId === 'cat-ram' && specs.ramType && s.ramType && String(specs.ramType).includes(s.ramType));
      }
      if (product.categoryId === 'cat-ram') {
        return ['cat-cpu', 'cat-mainboard'].includes(p.categoryId)
          && specs.ramType && s.ramType && String(s.ramType).includes(specs.ramType);
      }
      if (product.categoryId === 'cat-vga') return p.categoryId === 'cat-psu' && specs.requiredPower && s.power >= specs.requiredPower;
      if (product.categoryId === 'cat-psu') return p.categoryId === 'cat-vga' && s.requiredPower && specs.power >= s.requiredPower;
      return false;
    });
  if (!recommendations.length) {
    recommendations = candidates.filter(p => p.categoryId === product.categoryId || p.brand === product.brand);
  }
  return recommendations.slice(0, 4).map(p => withCategory(p, db));
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
