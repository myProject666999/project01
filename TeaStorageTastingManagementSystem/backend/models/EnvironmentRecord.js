const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const StorageLocation = require('./StorageLocation');

const EnvironmentRecord = sequelize.define('EnvironmentRecord', {
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
  temperature: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    comment: '温度（摄氏度）'
  },
  humidity: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    comment: '湿度（%）'
  },
  record_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: '记录日期'
  },
  record_time: {
    type: DataTypes.TIME,
    allowNull: false,
    comment: '记录时间'
  },
  is_alert: {
    type: DataTypes.TINYINT(1),
    defaultValue: 0,
    comment: '是否触发警报：0否，1是'
  },
  alert_type: {
    type: DataTypes.STRING(50),
    comment: '警报类型'
  }
}, {
  tableName: 'environment_records',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

EnvironmentRecord.belongsTo(StorageLocation, { foreignKey: 'location_id', as: 'location' });

module.exports = EnvironmentRecord;
