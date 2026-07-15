const { CartItem, Product, Category } = require('../data/models');

const includeProduct = [{
  model: Product,
  as: 'product',
  include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'slug'] }]
}];

const listByUser = (userId, options = {}) => CartItem.findAll({
  where: { userId },
  include: includeProduct,
  order: [['updatedAt', 'DESC']],
  transaction: options.transaction,
  lock: options.lock
});
const findItem = (userId, productId) => CartItem.findOne({ where: { userId, productId } });

async function setItem(userId, productId, quantity) {
  const [item] = await CartItem.findOrCreate({ where: { userId, productId }, defaults: { quantity } });
  if (item.quantity !== quantity) await item.update({ quantity });
  return item;
}

const removeItem = (userId, productId, options = {}) => CartItem.destroy({ where: { userId, productId }, transaction: options.transaction });
const clear = (userId, options = {}) => CartItem.destroy({ where: { userId }, transaction: options.transaction });

module.exports = { listByUser, findItem, setItem, removeItem, clear };
