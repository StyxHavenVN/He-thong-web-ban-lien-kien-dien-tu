const { readDb, writeDb } = require('../../repositories/jsonRepository');
const productService = require('../product/product.service');

function getCart(userId) {
  const db = readDb();
  const items = db.carts[userId] || [];
  const enriched = items.map(item => ({ ...item, product: productService.getProduct(item.productId) }));
  const total = enriched.reduce((sum, item) => sum + item.quantity * item.product.price, 0);
  return { items: enriched, total };
}

function addItem(userId, productId, quantity = 1) {
  const db = readDb();
  const product = db.products.find(p => p.id === productId);
  if (!product) throw new Error('Không tìm thấy sản phẩm.');
  if (product.stock <= 0) throw new Error('Sản phẩm đã hết hàng.');
  const qty = Number(quantity || 1);
  if (qty > product.stock) throw new Error('Số lượng mua vượt quá tồn kho.');

  db.carts[userId] = db.carts[userId] || [];
  const existed = db.carts[userId].find(i => i.productId === productId);
  if (existed) existed.quantity = Math.min(product.stock, existed.quantity + qty);
  else db.carts[userId].push({ productId, quantity: qty });
  writeDb(db);
  return getCart(userId);
}

function updateItem(userId, productId, quantity) {
  const db = readDb();
  const product = db.products.find(p => p.id === productId);
  if (!product) throw new Error('Không tìm thấy sản phẩm.');
  const qty = Number(quantity || 0);
  if (qty < 1) db.carts[userId] = (db.carts[userId] || []).filter(i => i.productId !== productId);
  else {
    if (qty > product.stock) throw new Error('Số lượng mua vượt quá tồn kho.');
    db.carts[userId] = db.carts[userId] || [];
    const item = db.carts[userId].find(i => i.productId === productId);
    if (item) item.quantity = qty;
  }
  writeDb(db);
  return getCart(userId);
}

function clearCart(userId, db) {
  db.carts[userId] = [];
}

module.exports = { getCart, addItem, updateItem, clearCart };
