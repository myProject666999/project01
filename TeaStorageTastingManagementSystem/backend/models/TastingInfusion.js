const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const TastingNote = require('./TastingNote');

const TastingInfusion = sequelize.define('TastingInfusion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  tasting_note_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: TastingNote,
      key: 'id'
    },
    comment: '品鉴笔记ID'
  },
  infusion_number: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '第几泡'
  },
  soup_color: {
    type: DataTypes.STRING(100),
    comment: '汤色'
  },
  aroma: {
    type: DataTypes.STRING(500),
    comment: '香气'
  },
  taste: {
    type: DataTypes.STRING(500),
    comment: '滋味'
  },
  score: {
    type: DataTypes.DECIMAL(4, 2),
    allowNull: false,
    comment: '评分'
  }
}, {
  tableName: 'tasting_infusions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = TastingInfusion;
