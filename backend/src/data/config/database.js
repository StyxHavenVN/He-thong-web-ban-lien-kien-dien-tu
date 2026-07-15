const { Sequelize } = require('sequelize');

// Khởi tạo kết nối Sequelize tới PostgreSQL sử dụng DATABASE_URL từ biến môi trường
const connectionString = process.env.DATABASE_URL || 'postgres://root:rootpassword@localhost:5432/web_linh_kien';

const sequelize = new Sequelize(connectionString, {
    dialect: 'postgres',
    logging: process.env.SQL_LOG === 'true' ? console.log : false,
    define: {
        underscored: true,
        freezeTableName: true
    },
});

module.exports = sequelize;
