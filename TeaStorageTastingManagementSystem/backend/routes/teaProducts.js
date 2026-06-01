const express = require('express');
const router = express.Router();
const TeaProduct = require('../models/TeaProduct');
const { Op } = require('sequelize');

router.get('/', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, keyword, production_year, material_type, shape } = req.query;
    const where = {};
    
    if (keyword) {
      where[Op.or] = [
        { product_name: { [Op.like]: `%${keyword}%` } },
        { origin: { [Op.like]: `%${keyword}%` } },
        { mountain: { [Op.like]: `%${keyword}%` } }
      ];
    }
    if (production_year) where.production_year = production_year;
    if (material_type) where.material_type = material_type;
    if (shape) where.shape = shape;

    const offset = (page - 1) * pageSize;
    const { count, rows } = await TeaProduct.findAndCountAll({
      where,
      offset,
      limit: parseInt(pageSize),
      order: [['production_year', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        list: rows,
        total: count,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await TeaProduct.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: '茶品不存在' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const product = await TeaProduct.create(req.body);
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const product = await TeaProduct.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: '茶品不存在' });
    }
    await product.update(req.body);
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const product = await TeaProduct.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: '茶品不存在' });
    }
    await product.destroy();
    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
