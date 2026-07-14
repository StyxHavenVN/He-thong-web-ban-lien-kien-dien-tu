require('dotenv').config();
const app = require('./app');
const sequelize = require('./data/config/database');

const PORT = process.env.PORT || 3000;

// Xác thực kết nối CSDL và khởi chạy server lắng nghe
sequelize.authenticate()
    .then(() => {
        console.log('✅ PostgreSQL Database connected successfully.');
        app.listen(PORT, () => {
            console.log(`🚀 Backend server is running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('❌ DB connection error:', err);
        process.exit(1);
    });