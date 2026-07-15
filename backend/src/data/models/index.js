const User = require('../../modules/auth/user.model');
const Category = require('../../modules/category/category.model');
const Product = require('../../modules/product/product.model');
const CartItem = require('../../modules/cart/cart-item.model');
const Order = require('../../modules/order/order.model');
const OrderItem = require('../../modules/order/order-item.model');
const Payment = require('../../modules/payment/payment.model');
const Shipment = require('../../modules/shipping/shipment.model');
const Notification = require('../../modules/notification/notification.model');

Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

User.hasMany(CartItem, { foreignKey: 'userId', as: 'cartItems', onDelete: 'CASCADE' });
CartItem.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Product.hasMany(CartItem, { foreignKey: 'productId', as: 'cartItems', onDelete: 'CASCADE' });
CartItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

User.hasMany(Order, { foreignKey: 'customerId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'customerId', as: 'customer' });
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
Product.hasMany(OrderItem, { foreignKey: 'productId', as: 'orderItems' });
OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

Order.hasOne(Payment, { foreignKey: 'orderId', as: 'payment', onDelete: 'CASCADE' });
Payment.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
Order.hasOne(Shipment, { foreignKey: 'orderId', as: 'shipment', onDelete: 'CASCADE' });
Shipment.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications', onDelete: 'CASCADE' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = { User, Category, Product, CartItem, Order, OrderItem, Payment, Shipment, Notification };
