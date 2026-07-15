const { Op } = require('sequelize');
const { Product, Category } = require('../data/models');

function buildWhere(filters = {}, includeInactive = false) {
  const where = includeInactive ? {} : { active: true };
  if (filters.keyword) where.name = { [Op.iLike]: `%${String(filters.keyword).trim()}%` };
  if (filters.categoryId) where.categoryId = filters.categoryId;
  if (filters.brand) where.brand = { [Op.in]: String(filters.brand).split(',').map((item) => item.trim()).filter(Boolean) };
  if (filters.minPrice || filters.maxPrice) {
    where.price = {};
    if (filters.minPrice) where.price[Op.gte] = Number(filters.minPrice);
    if (filters.maxPrice) where.price[Op.lte] = Number(filters.maxPrice);
  }
  return where;
}

function list(filters = {}, includeInactive = false) {
  const order = filters.sort === 'price_asc' ? [['price', 'ASC']]
    : filters.sort === 'price_desc' ? [['price', 'DESC']]
      : [['createdAt', 'DESC']];
  return Product.findAll({
    where: buildWhere(filters, includeInactive),
    include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'slug'] }],
    order
  });
}

const findById = (id, options = {}) => Product.findOne({
  where: { id, ...(options.includeInactive ? {} : { active: true }) },
  include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'slug'] }],
  transaction: options.transaction,
  lock: options.lock
});
const create = (payload) => Product.create(payload);
const findForUpdate = (id, transaction) => Product.findByPk(id, { transaction, lock: transaction.LOCK.UPDATE });

async function decrementStock(id, quantity, transaction) {
  const product = await findForUpdate(id, transaction);
  if (!product || !product.active || product.stock < quantity) return null;
  await product.update({ stock: product.stock - quantity }, { transaction });
  return product;
}

async function update(id, payload) {
  const product = await Product.findByPk(id);
  if (!product) return null;
  return product.update(payload);
}

async function hide(id) {
  const product = await Product.findByPk(id);
  if (!product) return null;
  return product.update({ active: false });
}

const listCategories = (includeInactive = false) => Category.findAll({
  where: includeInactive ? {} : { active: true },
  order: [['name', 'ASC']]
});
const findCategory = (id) => Category.findByPk(id);
const createCategory = (payload) => Category.create(payload);

async function updateCategory(id, payload) {
  const category = await Category.findByPk(id);
  if (!category) return null;
  return category.update(payload);
}

async function hideCategory(id) {
  const productCount = await Product.count({ where: { categoryId: id, active: true } });
  if (productCount) return { conflict: true };
  const category = await Category.findByPk(id);
  if (!category) return null;
  await category.update({ active: false });
  return category;
}

module.exports = { list, findById, findForUpdate, decrementStock, create, update, hide, listCategories, findCategory, createCategory, updateCategory, hideCategory };
