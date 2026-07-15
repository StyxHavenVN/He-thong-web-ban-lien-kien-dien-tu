const productRepository = require('../../repositories/product.repository');

function serializeProduct(product) {
  const value = typeof product?.toJSON === 'function' ? product.toJSON() : product;
  if (!value) return null;
  return { ...value, categoryName: value.category?.name || '' };
}

async function getAllProducts(filters = {}, includeInactive = false) {
  const products = await productRepository.list(filters, includeInactive);
  return products.map(serializeProduct);
}

async function getProduct(id) {
  const product = await productRepository.findById(id);
  if (!product) {
    const error = new Error('Không tìm thấy sản phẩm.');
    error.statusCode = 404;
    throw error;
  }
  return serializeProduct(product);
}

async function getCompatibility(id) {
  const selected = await getProduct(id);
  const products = await getAllProducts();
  const specs = selected.specs || {};
  const suggestions = products.filter((candidate) => {
    if (candidate.id === selected.id) return false;
    const other = candidate.specs || {};
    if (specs.socket && other.socket && specs.socket !== other.socket) return false;
    const ramA = specs.ram || specs.ramType || specs.type;
    const ramB = other.ram || other.ramType || other.type;
    if (ramA && ramB && /^DDR/.test(String(ramA)) && /^DDR/.test(String(ramB)) && ramA !== ramB) return false;
    const requiredPower = Number(specs.requiredPower || specs.power || 0);
    const availablePower = Number(other.power || 0);
    if (requiredPower && availablePower && availablePower < requiredPower) return false;
    return true;
  }).slice(0, 6);
  return { selected, suggestions };
}

async function listCategories(includeInactive = false) {
  return productRepository.listCategories(includeInactive);
}

function normalizeProduct(payload = {}) {
  const name = String(payload.name || '').trim();
  const categoryId = String(payload.categoryId || '').trim();
  const brand = String(payload.brand || '').trim();
  const price = Number(payload.price);
  const stock = Number(payload.stock);
  if (!name || !categoryId || !brand || !Number.isFinite(price) || price < 0 || !Number.isInteger(stock) || stock < 0) {
    const error = new Error('Tên, danh mục, hãng, giá và tồn kho chưa hợp lệ.');
    error.statusCode = 400;
    throw error;
  }
  return {
    name, categoryId, brand, price: Math.round(price), stock,
    oldPrice: payload.oldPrice ? Math.round(Number(payload.oldPrice)) : null,
    image: String(payload.image || 'assets/categories/cpu.png'),
    description: String(payload.description || 'Sản phẩm chính hãng tại BlueTech.'),
    specs: typeof payload.specs === 'object' && payload.specs ? payload.specs : {},
    badge: payload.badge ? String(payload.badge) : null,
    active: payload.active !== false
  };
}

async function createProduct(payload) {
  return serializeProduct(await productRepository.create(normalizeProduct(payload)));
}

async function updateProduct(id, payload) {
  const product = await productRepository.update(id, normalizeProduct(payload));
  if (!product) throw Object.assign(new Error('Không tìm thấy sản phẩm.'), { statusCode: 404 });
  return serializeProduct(product);
}

async function hideProduct(id) {
  const product = await productRepository.hide(id);
  if (!product) throw Object.assign(new Error('Không tìm thấy sản phẩm.'), { statusCode: 404 });
  return serializeProduct(product);
}

module.exports = { getAllProducts, getProduct, getCompatibility, listCategories, createProduct, updateProduct, hideProduct, serializeProduct };
