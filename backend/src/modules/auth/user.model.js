const { DataTypes } = require('sequelize');
const sequelize = require('../../data/config/database');

// Định nghĩa cấu trúc bảng 'users' trong PostgreSQL
const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    fullname: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    address: {
        type: DataTypes.STRING
    },
    role: {
        type: DataTypes.STRING,
        defaultValue: 'CUSTOMER',
        validate: { isIn: [['CUSTOMER', 'STAFF', 'ADMIN']] }
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'ACTIVE'
    },
    failedLoginAttempts: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    lockUntil: {
        type: DataTypes.DATE
    }
}, {
    tableName: 'users',
    timestamps: true // Tự động tạo cột createdAt và updatedAt
});

module.exports = User;
