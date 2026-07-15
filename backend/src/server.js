require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const sequelize = require('./data/config/database');
require('./data/models');
const { seedDatabase } = require('./data/seed');

const authRoutes = require('./modules/auth/auth.routes');
const productRoutes = require('./modules/product/product.routes');
const cartRoutes = require('./modules/cart/cart.routes');
const orderRoutes = require('./modules/order/order.routes');
const adminRoutes = require('./modules/admin/admin.routes');

const app = express();
const port = Number(process.env.PORT || 3000);

app.disable('x-powered-by');
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.get('/api/health', async (_req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ status: 'ok', database: 'connected', architecture: 'layered-modular-monolith' });
  } catch (_error) {
    res.status(503).json({ status: 'error', database: 'disconnected' });
  }
});
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

app.use('/api', (_req, res) => res.status(404).json({ message: 'API không tồn tại.' }));
app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: 'Lỗi hệ thống. Vui lòng thử lại.' });
});

async function start() {
  await sequelize.authenticate();
  await sequelize.sync({ alter: process.env.DB_ALTER === 'true' });
  await seedDatabase();
  app.listen(port, () => console.log(`BlueTech API đang chạy tại cổng ${port}`));
}

if (require.main === module) {
  start().catch((error) => {
    console.error('Không thể khởi động backend:', error);
    process.exit(1);
  });
}

module.exports = { app, start };
