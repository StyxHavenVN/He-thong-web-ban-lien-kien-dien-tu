const { v4: uuid } = require('uuid');

function processPayment(db, order, method = 'ONLINE') {
  const payment = {
    id: uuid(), orderId: order.id, amount: order.totalAmount, method,
    status: method === 'COD' ? 'PENDING_COD' : 'SUCCESS', createdAt: new Date().toISOString()
  };
  db.payments.push(payment);
  if (method !== 'COD') order.paymentStatus = 'PAID';
  return payment;
}

module.exports = { processPayment };
