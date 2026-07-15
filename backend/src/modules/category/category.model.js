const { DataTypes } = require('sequelize');
const sequelize = require('../../data/config/database');

const Category = sequelize.define('Category', {
  id: { type: DataTypes.STRING, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  slug: { type: DataTypes.STRING, allowNull: false, unique: true },
  image: { type: DataTypes.STRING },
  active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
}, { tableName: 'categories', timestamps: true });

module.exports = Category;
