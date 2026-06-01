const express = require('express');
const router = express.Router();
const StorageLocation = require('../models/StorageLocation');
const { Op } = require('sequelize');

router.get('/', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, status, mountain, fragrance_type } = req.query;
    const where = {};
    
    if (status) where.status = status;
    if (mountain) where.mountain = mountain;
    if (fragrance_type) where.fragrance_type = fragrance_type;

    const offset = (page - 1) * pageSize;
    const { count, rows } = await StorageLocation.findAndCountAll({
      where,
      offset,
      limit: parseInt(pageSize),
      order: [['warehouse_no', 'ASC'], ['cabinet_no', 'ASC'], ['shelf_no', 'ASC']]
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

router.get('/all', async (req, res) => {
  try {
    const locations = await StorageLocation.findAll({
      where: { status: 'active' },
      order: [['warehouse_no', 'ASC'], ['cabinet_no', 'ASC'], ['shelf_no', 'ASC']]
    });
    res.json({ success: true, data: locations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/suitable', async (req, res) => {
  try {
    const { mountain, fragrance_type } = req.query;
    const where = { status: 'active' };
    
    where[Op.and] = [];
    if (mountain) {
      where[Op.and].push({
        [Op.or]: [
          { mountain: mountain },
          { mountain: null },
          { mountain: '' }
        ]
      });
    }
    if (fragrance_type) {
      where[Op.and].push({
        [Op.or]: [
          { fragrance_type: fragrance_type },
          { fragrance_type: null },
          { fragrance_type: '' }
        ]
      });
    }

    const locations = await StorageLocation.findAll({
      where,
      order: [['warehouse_no', 'ASC'], ['cabinet_no', 'ASC'], ['shelf_no', 'ASC']]
    });

    res.json({ success: true, data: locations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const location = await StorageLocation.findByPk(req.params.id);
    if (!location) {
      return res.status(404).json({ success: false, message: '仓位不存在' });
    }
    res.json({ success: true, data: location });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { warehouse_no, cabinet_no, shelf_no } = req.body;
    const location_code = `${warehouse_no}-${cabinet_no}-${shelf_no}`;
    
    const existing = await StorageLocation.findOne({ where: { location_code } });
    if (existing) {
      return res.status(400).json({ success: false, message: '该仓位已存在' });
    }

    const location = await StorageLocation.create({
      ...req.body,
      location_code
    });
    res.json({ success: true, data: location });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const location = await StorageLocation.findByPk(req.params.id);
    if (!location) {
      return res.status(404).json({ success: false, message: '仓位不存在' });
    }
    
    const { warehouse_no, cabinet_no, shelf_no } = req.body;
    const location_code = `${warehouse_no}-${cabinet_no}-${shelf_no}`;
    
    const existing = await StorageLocation.findOne({
      where: { location_code, id: { [Op.ne]: req.params.id } }
    });
    if (existing) {
      return res.status(400).json({ success: false, message: '该仓位已存在' });
    }

    await location.update({ ...req.body, location_code });
    res.json({ success: true, data: location });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const location = await StorageLocation.findByPk(req.params.id);
    if (!location) {
      return res.status(404).json({ success: false, message: '仓位不存在' });
    }
    await location.destroy();
    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
