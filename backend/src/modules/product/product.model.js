const { DataTypes } = require('sequelize');
const sequelize = require('../../data/config/database');
const Category = require('./category.model');

const Product = sequelize.define('Product', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    categoryId: { type: DataTypes.STRING, references: { model: 'categories', key: 'id' } },
    brand: { type: DataTypes.STRING },
    price: { type: DataTypes.INTEGER, allowNull: false },
    oldPrice: { type: DataTypes.INTEGER },
    stock: { type: DataTypes.INTEGER, defaultValue: 0 },
    image: { type: DataTypes.STRING },
    description: { type: DataTypes.TEXT },
    specs: { type: DataTypes.JSONB },
    badge: { type: DataTypes.STRING },
    rating: { type: DataTypes.FLOAT, defaultValue: 5.0 },
    reviews: { type: DataTypes.INTEGER, defaultValue: 0 },
    active: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
    tableName: 'products',
    timestamps: true
});

Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });

module.exports = Product;