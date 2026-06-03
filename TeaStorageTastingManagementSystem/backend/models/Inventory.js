const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const TeaProduct = require('./TeaProduct');
const StorageLocation = require('./StorageLocation');

const Inventory = sequelize.define('Inventory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  tea_product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: TeaProduct,
      key: 'id'
    },
    comment: '茶品ID'
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
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: '存放数量'
  },
  storage_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: '入仓日期'
  },
  batch_no: {
    type: DataTypes.STRING(100),
    comment: '批次号'
  },
  notes: {
    type: DataTypes.TEXT,
    comment: '备注'
  }
}, {
  tableName: 'inventory',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Inventory;
