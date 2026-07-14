require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

// Middleware cấu hình
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Sequelize Instance phục vụ Health check
const sequelize = require('./data/config/database');

// Endpoint kiểm tra sức khỏe hệ thống công khai (Health Check)
app.get('/health', async (req, res) => {
  try {
    // Kiểm tra kết nối tới Database PostgreSQL
    await sequelize.authenticate();
    return res.status(200).json({
      status: 'OK',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({
      status: 'ERROR',
      database: 'disconnected',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Import các Module Routes
const authRoutes = require('./modules/auth/auth.routes');
const productRoutes = require('./modules/product/product.routes');
const cartRoutes = require('./modules/cart/cart.routes');
const orderRoutes = require('./modules/order/order.routes');
const adminRoutes = require('./modules/admin/admin.routes');

// Đăng ký (Mount) các Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// Phục vụ giao diện frontend tĩnh
const path = require('path');
app.use(express.static(path.join(__dirname, '../../frontend')));

// Xử lý Route 404 (Không tồn tại)
app.use((req, res, next) => {
  res.status(404).json({ message: 'Không tìm thấy trang yêu cầu.' });
});

// Global Error Handler (Bộ xử lý lỗi tập trung)
app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Lỗi máy chủ nội bộ.'
  });
});

module.exports = app;
