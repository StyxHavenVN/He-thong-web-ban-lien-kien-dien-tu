const reportRepository = require('../../repositories/report.repository');

async function revenueReport() {
  const completed = await reportRepository.listCompletedOrders();
  const revenue = completed.reduce((sum, order) => sum + order.totalAmount, 0);
  const sold = new Map();
  completed.flatMap((order) => order.items || []).forEach((item) => {
    sold.set(item.productName, (sold.get(item.productName) || 0) + item.quantity);
  });
  const bestSellers = [...sold.entries()]
    .map(([name, quantity]) => ({ name, quantity }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10);
  return {
    revenue,
    orderCount: completed.length,
    productsSold: [...sold.values()].reduce((sum, quantity) => sum + quantity, 0),
    bestSellers
  };
}

module.exports = { revenueReport };
