const cartRepository = require('../../repositories/cart.repository');
const productRepository = require('../../repositories/product.repository');
const productService = require('../product/product.service');

function serializeCart(rows) {
  const items = rows.map((row) => ({
    productId: row.productId,
    quantity: row.quantity,
    product: productService.serializeProduct(row.product)
  }));
  const total = items.reduce((sum, item) => sum + item.quantity * item.product.price, 0);
  return { items, total, quantity: items.reduce((sum, item) => sum + item.quantity, 0) };
}

async function getCart(userId) {
  return serializeCart(await cartRepository.listByUser(userId));
}

async function addItem(userId, productId, quantity = 1) {
  const product = await productRepository.findById(productId);
  if (!product) throw new Error('Không tìm thấy sản phẩm.');
  const qty = Number(quantity);
  if (!Number.isInteger(qty) || qty < 1) throw new Error('Số lượng phải là số nguyên dương.');
  const current = await cartRepository.findItem(userId, productId);
  const next = Number(current?.quantity || 0) + qty;
  if (next > product.stock) throw new Error(`Chỉ còn ${product.stock} sản phẩm trong kho.`);
  await cartRepository.setItem(userId, productId, next);
  return getCart(userId);
}

async function updateItem(userId, productId, quantity) {
  const qty = Number(quantity);
  if (!Number.isInteger(qty)) throw new Error('Số lượng chưa hợp lệ.');
  if (qty <= 0) {
    await cartRepository.removeItem(userId, productId);
    return getCart(userId);
  }
  const product = await productRepository.findById(productId);
  if (!product) throw new Error('Không tìm thấy sản phẩm.');
  if (qty > product.stock) throw new Error(`Chỉ còn ${product.stock} sản phẩm trong kho.`);
  await cartRepository.setItem(userId, productId, qty);
  return getCart(userId);
}

async function removeItem(userId, productId) {
  await cartRepository.removeItem(userId, productId);
  return getCart(userId);
}

module.exports = { getCart, addItem, updateItem, removeItem };
