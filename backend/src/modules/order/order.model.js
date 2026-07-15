const { DataTypes } = require('sequelize');
const sequelize = require('../../data/config/database');

const Order = sequelize.define('Order', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  customerId: { type: DataTypes.UUID, allowNull: false },
  subtotal: { type: DataTypes.INTEGER, allowNull: false },
  shippingFee: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  totalAmount: { type: DataTypes.INTEGER, allowNull: false },
  paymentMethod: { type: DataTypes.STRING, allowNull: false, defaultValue: 'COD' },
  paymentStatus: { type: DataTypes.STRING, allowNull: false, defaultValue: 'UNPAID' },
  shippingAddress: { type: DataTypes.TEXT, allowNull: false },
  shippingStatus: { type: DataTypes.STRING, allowNull: false, defaultValue: 'READY' },
  trackingCode: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'WAITING_CONFIRM' }
}, { tableName: 'orders', timestamps: true, indexes: [{ fields: ['customer_id'] }, { fields: ['status'] }, { fields: ['created_at'] }] });

module.exports = Order;
