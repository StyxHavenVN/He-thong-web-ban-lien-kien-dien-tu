const sequelize = require('../data/config/database');
const { Order, OrderItem, User, Payment, Shipment, Notification } = require('../data/models');

const orderInclude = [
  { model: OrderItem, as: 'items' },
  { model: User, as: 'customer', attributes: ['id', 'fullname', 'email', 'phone'] },
  { model: Payment, as: 'payment' },
  { model: Shipment, as: 'shipment' }
];

const withTransaction = (callback) => sequelize.transaction(callback);
const create = (payload, options = {}) => Order.create(payload, options);
const createItems = (items, options = {}) => OrderItem.bulkCreate(items, options);
const createPayment = (payload, options = {}) => Payment.create(payload, options);
const createShipment = (payload, options = {}) => Shipment.create(payload, options);
const createNotification = (payload, options = {}) => Notification.create(payload, options);
const findById = (id) => Order.findByPk(id, { include: orderInclude });
const listByCustomer = (customerId) => Order.findAll({ where: { customerId }, include: orderInclude, order: [['createdAt', 'DESC']] });
const listAll = () => Order.findAll({ include: orderInclude, order: [['createdAt', 'DESC']] });

async function updateStatus(id, payload) {
  const order = await Order.findByPk(id);
  if (!order) return null;
  await order.update(payload);
  if (payload.shippingStatus) await Shipment.update({ status: payload.shippingStatus }, { where: { orderId: id } });
  return findById(id);
}

module.exports = { withTransaction, create, createItems, createPayment, createShipment, createNotification, findById, listByCustomer, listAll, updateStatus };
