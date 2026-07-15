const { Order, OrderItem } = require('../data/models');

const listCompletedOrders = () => Order.findAll({
  where: { status: 'COMPLETED' },
  include: [{ model: OrderItem, as: 'items' }]
});

module.exports = { listCompletedOrders };
