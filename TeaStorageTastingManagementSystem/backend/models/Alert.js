const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const StorageLocation = require('./StorageLocation');

const Alert = sequelize.define('Alert', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  location_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: StorageLocation,
      key: 'id'
    },
    comment: '仓位ID'
  },
  alert_type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '警报类型'
  },
  alert_level: {
    type: DataTypes.ENUM('warning', 'danger'),
    defaultValue: 'warning',
    comment: '警报级别'
  },
  message: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: '警报内容'
  },
  value: {
    type: DataTypes.DECIMAL(8, 2),
    comment: '触发值'
  },
  threshold: {
    type: DataTypes.DECIMAL(8, 2),
    comment: '阈值'
  },
  resolved: {
    type: DataTypes.TINYINT(1),
    defaultValue: 0,
    comment: '是否已处理'
  },
  resolved_at: {
    type: DataTypes.DATE,
    comment: '处理时间'
  },
  resolved_note: {
    type: DataTypes.TEXT,
    comment: '处理备注'
  }
}, {
  tableName: 'alerts',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

Alert.belongsTo(StorageLocation, { foreignKey: 'location_id', as: 'location' });

module.exports = Alert;
