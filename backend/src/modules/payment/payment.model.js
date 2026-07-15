const { DataTypes } = require('sequelize');
const sequelize = require('../../data/config/database');

const Payment = sequelize.define('Payment', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  orderId: { type: DataTypes.UUID, allowNull: false, unique: true },
  provider: { type: DataTypes.STRING, allowNull: false },
  method: { type: DataTypes.STRING, allowNull: false },
  amount: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.STRING, allowNull: false },
  transactionRef: { type: DataTypes.STRING }
}, { tableName: 'payments', timestamps: true });

module.exports = Payment;
