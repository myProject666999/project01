const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const TeaProduct = require('./TeaProduct');

const TastingNote = sequelize.define('TastingNote', {
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
  tasting_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: '品鉴日期'
  },
  tea_weight: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    comment: '撬茶克重'
  },
  water_type: {
    type: DataTypes.ENUM('pure', 'mineral'),
    defaultValue: 'pure',
    comment: '用水类型：pure纯净水，mineral矿泉水'
  },
  brew_count: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: '冲泡次数'
  },
  overall_score: {
    type: DataTypes.DECIMAL(4, 2),
    comment: '总体评分'
  },
  notes: {
    type: DataTypes.TEXT,
    comment: '总体评价'
  }
}, {
  tableName: 'tasting_notes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

TastingNote.belongsTo(TeaProduct, { foreignKey: 'tea_product_id', as: 'teaProduct' });

module.exports = TastingNote;
