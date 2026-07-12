const { Sequelize } = require('sequelize');

// Khởi tạo kết nối Sequelize tới PostgreSQL sử dụng DATABASE_URL từ biến môi trường
const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false, // Tắt log câu lệnh SQL trên terminal cho gọn
});

module.exports = sequelize;