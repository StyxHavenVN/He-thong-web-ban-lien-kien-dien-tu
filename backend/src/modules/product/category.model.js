const { DataTypes } = require('sequelize');
const sequelize = require('../../data/config/database');

const Category = sequelize.define('Category', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
}, {
    tableName: 'categories',
    timestamps: true
});

module.exports = Category;
