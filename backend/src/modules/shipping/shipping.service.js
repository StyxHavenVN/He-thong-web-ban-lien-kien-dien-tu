const { v4: uuid } = require('uuid');

function calculateFee(address, totalAmount) {
  const base = 30000;
  const remoteFee = String(address || '').toLowerCase().includes('huyện') ? 15000 : 0;
  const discount = totalAmount >= 10000000 ? 30000 : 0;
  return Math.max(0, base + remoteFee - discount);
}

function createShipment(db, order) {
  const shipment = {
    id: uuid(), orderId: order.id,
    trackingCode: 'VC' + Math.floor(100000 + Math.random() * 900000),
    fee: calculateFee(order.shippingAddress, order.totalAmount),
    status: 'CREATED', createdAt: new Date().toISOString()
  };
  db.shipments.push(shipment);
  order.shippingStatus = 'CREATED';
  order.trackingCode = shipment.trackingCode;
  return shipment;
}

module.exports = { calculateFee, createShipment };
