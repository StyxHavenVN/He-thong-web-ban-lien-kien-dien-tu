const { DataTypes } = require('sequelize');
const sequelize = require('../../data/config/database');

const Shipment = sequelize.define('Shipment', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  orderId: { type: DataTypes.UUID, allowNull: false, unique: true },
  provider: { type: DataTypes.STRING, allowNull: false },
  fee: { type: DataTypes.INTEGER, allowNull: false },
  trackingCode: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'READY' }
}, { tableName: 'shipments', timestamps: true });

module.exports = Shipment;
