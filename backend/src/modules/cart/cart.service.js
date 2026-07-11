const { readDb, writeDb } = require('../../repositories/jsonRepository');

function getCart(userId) {
  const db = readDb();
  const items = db.carts[userId] || [];
  const enriched = items.map(item => {
    const product = db.products.find(p => p.id === item.productId);
    const category = product && db.categories.find(c => c.id === product.categoryId);
    return product ? { ...item, product: { ...product, categoryName: category?.name || 'Khác' } } : null;
  }).filter(Boolean);
  const total = enriched.reduce((sum, item) => sum + item.quantity * item.product.price, 0);
  return { items: enriched, total };
}

function addItem(userId, productId, quantity = 1) {
  const db = readDb();
  const product = db.products.find(p => p.id === productId);
  if (!product || product.active === false) throw new Error('Không tìm thấy sản phẩm đang bán.');
  if (product.stock <= 0) throw new Error('Sản phẩm đã hết hàng.');
  const qty = Number(quantity || 1);
  if (!Number.isInteger(qty) || qty < 1) throw new Error('Số lượng mua không hợp lệ.');

  db.carts[userId] = db.carts[userId] || [];
  const existed = db.carts[userId].find(i => i.productId === productId);
  if (qty + (existed?.quantity || 0) > product.stock) throw new Error('Số lượng mua vượt quá tồn kho.');
  if (existed) existed.quantity += qty;
  else db.carts[userId].push({ productId, quantity: qty });
  writeDb(db);
  return getCart(userId);
}

function updateItem(userId, productId, quantity) {
  const db = readDb();
  const product = db.products.find(p => p.id === productId);
  if (!product) throw new Error('Không tìm thấy sản phẩm.');
  const qty = Number(quantity);
  if (!Number.isInteger(qty) || qty < 1) throw new Error('Số lượng mua phải là số nguyên lớn hơn 0.');
  db.carts[userId] = db.carts[userId] || [];
  const item = db.carts[userId].find(i => i.productId === productId);
  if (!item) throw new Error('Sản phẩm không có trong giỏ hàng.');
  if (qty > product.stock) throw new Error('Số lượng mua vượt quá tồn kho.');
  item.quantity = qty;
  writeDb(db);
  return getCart(userId);
}

function removeItem(userId, productId) {
  const db = readDb();
  const items = db.carts[userId] || [];
  if (!items.some(item => item.productId === productId)) throw new Error('Sản phẩm không có trong giỏ hàng.');
  db.carts[userId] = items.filter(item => item.productId !== productId);
  writeDb(db);
  return getCart(userId);
}

function clearCart(userId, db) {
  db.carts[userId] = [];
}

module.exports = { getCart, addItem, updateItem, removeItem, clearCart };
