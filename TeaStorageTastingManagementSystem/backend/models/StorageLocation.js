const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StorageLocation = sequelize.define('StorageLocation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  warehouse_no: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '仓号'
  },
  cabinet_no: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '柜号'
  },
  shelf_no: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '层号'
  },
  location_code: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true,
    comment: '仓位坐标：仓号-柜号-层号'
  },
  mountain: {
    type: DataTypes.STRING(100),
    comment: '适合存放的山头'
  },
  fragrance_type: {
    type: DataTypes.STRING(100),
    comment: '适合存放的香型'
  },
  max_capacity: {
    type: DataTypes.INTEGER,
    defaultValue: 100,
    comment: '最大容量（片/份）'
  },
  current_quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '当前存量'
  },
  status: {
    type: DataTypes.ENUM('active', 'maintenance', 'disabled'),
    defaultValue: 'active',
    comment: '状态'
  }
}, {
  tableName: 'storage_locations',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = StorageLocation;
