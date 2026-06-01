const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TeaProduct = sequelize.define('TeaProduct', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  product_name: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: '茶品名称'
  },
  origin: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: '产区/厂家'
  },
  production_year: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '生产年份'
  },
  material_type: {
    type: DataTypes.ENUM('pure', 'blend'),
    defaultValue: 'pure',
    comment: '原料属性：pure纯料，blend拼配'
  },
  pressing_date: {
    type: DataTypes.DATEONLY,
    comment: '压制日期'
  },
  shape: {
    type: DataTypes.ENUM('cake', 'brick', 'tuo', 'loose'),
    defaultValue: 'cake',
    comment: '形态：cake饼茶，brick砖茶，tuo沱茶，loose散茶'
  },
  specification: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 357.00,
    comment: '规格（克）'
  },
  mountain: {
    type: DataTypes.STRING(100),
    comment: '山头'
  },
  fragrance_type: {
    type: DataTypes.STRING(100),
    comment: '香型'
  },
  description: {
    type: DataTypes.TEXT,
    comment: '备注描述'
  }
}, {
  tableName: 'tea_products',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = TeaProduct;
