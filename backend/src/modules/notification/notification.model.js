const { DataTypes } = require('sequelize');
const sequelize = require('../../data/config/database');

const Notification = sequelize.define('Notification', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  type: { type: DataTypes.STRING, allowNull: false },
  recipient: { type: DataTypes.STRING, allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false },
  status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'SENT' }
}, { tableName: 'notifications', timestamps: true, indexes: [{ fields: ['user_id'] }] });

module.exports = Notification;
