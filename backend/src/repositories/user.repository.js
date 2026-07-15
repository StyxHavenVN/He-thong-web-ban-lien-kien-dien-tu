const { Op } = require('sequelize');
const { User } = require('../data/models');

const findByEmail = (email) => User.findOne({ where: { email: String(email).toLowerCase() } });
const findById = (id) => User.findByPk(id);
const findByEmailOrPhone = (email, phone) => User.findOne({ where: { [Op.or]: [{ email }, { phone }] } });
const create = (payload, options = {}) => User.create(payload, options);
const listCustomers = () => User.findAll({ where: { role: 'CUSTOMER' }, order: [['createdAt', 'DESC']] });

async function toggleCustomerLock(id) {
  const user = await User.findOne({ where: { id, role: 'CUSTOMER' } });
  if (!user) return null;
  await user.update({ status: user.status === 'LOCKED' ? 'ACTIVE' : 'LOCKED', lockUntil: null });
  return user;
}

module.exports = { findByEmail, findById, findByEmailOrPhone, create, listCustomers, toggleCustomerLock };
