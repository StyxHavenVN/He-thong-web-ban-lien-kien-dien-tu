function calculateFee(address, subtotal, deliveryMethod = 'STANDARD') {
  if (deliveryMethod === 'EXPRESS') return 49000;
  const remoteFee = String(address || '').toLowerCase().includes('huyện') ? 15000 : 0;
  return subtotal >= 10000000 ? remoteFee : 30000 + remoteFee;
}

function createShipment(order, fee) {
  return {
    orderId: order.id,
    provider: 'BlueShip Sandbox',
    fee,
    trackingCode: `BTGHN${Date.now().toString().slice(-9)}`,
    status: 'READY'
  };
}

module.exports = { calculateFee, createShipment };
