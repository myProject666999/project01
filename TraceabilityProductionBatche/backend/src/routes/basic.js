const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/materials', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT mb.id, mb.batch_no, mb.quantity, mb.production_date,
             m.name as material_name, s.name as supplier_name
      FROM material_batches mb
      LEFT JOIN materials m ON mb.material_id = m.id
      LEFT JOIN suppliers s ON mb.supplier_id = s.id
      ORDER BY mb.created_at DESC
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/products', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT pb.id, pb.batch_no, pb.quantity, pb.production_date,
             p.name as product_name
      FROM product_batches pb
      LEFT JOIN products p ON pb.product_id = p.id
      ORDER BY pb.created_at DESC
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/distributors', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM distributors ORDER BY name');
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/suppliers', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM suppliers ORDER BY name');
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/work-orders', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT wo.*, p.name as product_name
      FROM work_orders wo
      LEFT JOIN products p ON wo.product_id = p.id
      ORDER BY wo.created_at DESC
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const [materialCount] = await pool.execute('SELECT COUNT(*) as count FROM material_batches');
    const [productCount] = await pool.execute('SELECT COUNT(*) as count FROM product_batches');
    const [workOrderCount] = await pool.execute('SELECT COUNT(*) as count FROM work_orders');
    const [distributorCount] = await pool.execute('SELECT COUNT(*) as count FROM distributors');

    res.json({
      success: true,
      data: {
        materialBatches: materialCount[0].count,
        productBatches: productCount[0].count,
        workOrders: workOrderCount[0].count,
        distributors: distributorCount[0].count
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
