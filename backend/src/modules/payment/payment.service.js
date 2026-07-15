function createPayment(order, method = 'COD', simulateFailure = false) {
  const online = method === 'ONLINE';
  return {
    orderId: order.id,
    provider: online ? 'BluePay Sandbox' : 'COD',
    method,
    amount: order.totalAmount,
    status: online ? (simulateFailure ? 'FAILED' : 'SUCCESS') : 'PENDING',
    transactionRef: online && !simulateFailure ? `BP${Date.now()}` : null
  };
}

module.exports = { createPayment };
