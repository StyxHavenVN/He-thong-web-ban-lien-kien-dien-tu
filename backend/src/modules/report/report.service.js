const { readDb } = require('../repositories/jsonRepository');

function revenueReport() {
  const db = readDb();
  const completed = db.orders.filter(o => o.status === 'COMPLETED');
  const revenue = completed.reduce((sum, o) => sum + o.totalAmount, 0);
  const orderCount = completed.length;
  const sold = {};
  completed.forEach(o => o.items.forEach(i => sold[i.productName] = (sold[i.productName] || 0) + i.quantity));
  const bestSellers = Object.entries(sold).map(([name, quantity]) => ({ name, quantity })).sort((a,b) => b.quantity - a.quantity);
  return { revenue, orderCount, bestSellers };
}

module.exports = { revenueReport };
