const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory');
const TeaProduct = require('../models/TeaProduct');
const StorageLocation = require('../models/StorageLocation');
const { Op } = require('sequelize');

router.get('/', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, tea_product_id, location_id } = req.query;
    const where = {};
    
    if (tea_product_id) where.tea_product_id = tea_product_id;
    if (location_id) where.location_id = location_id;

    const offset = (page - 1) * pageSize;
    const { count, rows } = await Inventory.findAndCountAll({
      where,
      offset,
      limit: parseInt(pageSize),
      include: [
        { model: TeaProduct, as: 'teaProduct' },
        { model: StorageLocation, as: 'location' }
      ],
      order: [['storage_date', 'DESC']]
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
    const inventory = await Inventory.findByPk(req.params.id, {
      include: [
        { model: TeaProduct, as: 'teaProduct' },
        { model: StorageLocation, as: 'location' }
      ]
    });
    if (!inventory) {
      return res.status(404).json({ success: false, message: '库存记录不存在' });
    }
    res.json({ success: true, data: inventory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { tea_product_id, location_id, quantity } = req.body;
    
    const teaProduct = await TeaProduct.findByPk(tea_product_id);
    const location = await StorageLocation.findByPk(location_id);
    
    if (!teaProduct || !location) {
      return res.status(400).json({ success: false, message: '茶品或仓位不存在' });
    }

    if (location.mountain && teaProduct.mountain && location.mountain !== teaProduct.mountain) {
      return res.status(400).json({
        success: false,
        message: `防串味规则：该仓位仅限存放${location.mountain}茶品，当前茶品为${teaProduct.mountain}`
      });
    }
    if (location.fragrance_type && teaProduct.fragrance_type && location.fragrance_type !== teaProduct.fragrance_type) {
      return res.status(400).json({
        success: false,
        message: `防串味规则：该仓位仅限存放${location.fragrance_type}型茶品，当前茶品为${teaProduct.fragrance_type}型`
      });
    }

    const availableCapacity = location.max_capacity - location.current_quantity;
    if (quantity > availableCapacity) {
      return res.status(400).json({
        success: false,
        message: `仓位容量不足，剩余容量：${availableCapacity}`
      });
    }

    const inventory = await Inventory.create(req.body);
    await location.update({ current_quantity: location.current_quantity + quantity });

    res.json({ success: true, data: inventory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const inventory = await Inventory.findByPk(req.params.id);
    if (!inventory) {
      return res.status(404).json({ success: false, message: '库存记录不存在' });
    }

    const oldLocation = await StorageLocation.findByPk(inventory.location_id);
    const newLocation = await StorageLocation.findByPk(req.body.location_id || inventory.location_id);
    
    if (oldLocation && oldLocation.id !== newLocation.id) {
      await oldLocation.update({ current_quantity: oldLocation.current_quantity - inventory.quantity });
    }
    
    if (newLocation && oldLocation.id !== newLocation.id) {
      const teaProduct = await TeaProduct.findByPk(req.body.tea_product_id || inventory.tea_product_id);
      
      if (newLocation.mountain && teaProduct.mountain && newLocation.mountain !== teaProduct.mountain) {
        return res.status(400).json({
          success: false,
          message: `防串味规则：该仓位仅限存放${newLocation.mountain}茶品`
        });
      }
      if (newLocation.fragrance_type && teaProduct.fragrance_type && newLocation.fragrance_type !== teaProduct.fragrance_type) {
        return res.status(400).json({
          success: false,
          message: `防串味规则：该仓位仅限存放${newLocation.fragrance_type}型茶品`
        });
      }

      const availableCapacity = newLocation.max_capacity - newLocation.current_quantity;
      if ((req.body.quantity || inventory.quantity) > availableCapacity) {
        return res.status(400).json({
          success: false,
          message: `仓位容量不足，剩余容量：${availableCapacity}`
        });
      }
      
      await newLocation.update({ current_quantity: newLocation.current_quantity + (req.body.quantity || inventory.quantity) });
    } else if (req.body.quantity !== undefined && req.body.quantity !== inventory.quantity) {
      const diff = req.body.quantity - inventory.quantity;
      const availableCapacity = newLocation.max_capacity - newLocation.current_quantity;
      if (diff > availableCapacity) {
        return res.status(400).json({
          success: false,
          message: `仓位容量不足，剩余容量：${availableCapacity}`
        });
      }
      await newLocation.update({ current_quantity: newLocation.current_quantity + diff });
    }

    await inventory.update(req.body);
    res.json({ success: true, data: inventory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const inventory = await Inventory.findByPk(req.params.id);
    if (!inventory) {
      return res.status(404).json({ success: false, message: '库存记录不存在' });
    }

    const location = await StorageLocation.findByPk(inventory.location_id);
    if (location) {
      await location.update({ current_quantity: Math.max(0, location.current_quantity - inventory.quantity) });
    }

    await inventory.destroy();
    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
