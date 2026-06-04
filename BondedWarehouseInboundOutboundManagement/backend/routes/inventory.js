const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.get('/', async (req, res) => {
  try {
    const { product_id, location_id, keyword } = req.query;
    let sql = `
      SELECT i.*, p.sku, p.name, p.barcode, p.category, l.code as location_code
      FROM inventory i
      LEFT JOIN products p ON i.product_id = p.id
      LEFT JOIN locations l ON i.location_id = l.id
      WHERE 1=1
    `;
    const params = [];
    
    if (product_id) {
      sql += ' AND i.product_id = ?';
      params.push(product_id);
    }
    if (location_id) {
      sql += ' AND i.location_id = ?';
      params.push(location_id);
    }
    if (keyword) {
      sql += ' AND (p.name LIKE ? OR p.sku LIKE ? OR p.barcode LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    }
    
    sql += ' ORDER BY i.id DESC';
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/stocktakes', async (req, res) => {
  try {
    const { status } = req.query;
    let sql = 'SELECT * FROM stocktakes WHERE 1=1';
    const params = [];
    
    if (status !== undefined) {
      sql += ' AND status = ?';
      params.push(status);
    }
    
    sql += ' ORDER BY id DESC';
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/stocktakes/:id', async (req, res) => {
  try {
    const [stocktakes] = await db.query('SELECT * FROM stocktakes WHERE id = ?', [req.params.id]);
    if (stocktakes.length === 0) {
      return res.status(404).json({ error: '盘点单不存在' });
    }
    
    const [items] = await db.query(`
      SELECT si.*, p.sku, p.name, p.barcode, l.code as location_code
      FROM stocktake_items si
      LEFT JOIN products p ON si.product_id = p.id
      LEFT JOIN locations l ON si.location_id = l.id
      WHERE si.stocktake_id = ?
    `, [req.params.id]);
    
    res.json({ ...stocktakes[0], items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/stocktakes/create', async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    const { type, operator, remark } = req.body;
    
    const stocktakeNo = 'ST' + Date.now();
    
    const [inventory] = await connection.query(`
      SELECT i.product_id, i.location_id, i.quantity
      FROM inventory i
      WHERE i.quantity > 0
    `);
    
    const [stocktakeResult] = await connection.query(
      'INSERT INTO stocktakes (stocktake_no, type, status, total_skus, operator, remark, started_at) VALUES (?, ?, 0, ?, ?, ?, NOW())',
      [stocktakeNo, type, inventory.length, operator, remark]
    );
    
    const stocktakeId = stocktakeResult.insertId;
    
    for (const item of inventory) {
      await connection.query(
        'INSERT INTO stocktake_items (stocktake_id, product_id, location_id, system_qty) VALUES (?, ?, ?, ?)',
        [stocktakeId, item.product_id, item.location_id, item.quantity]
      );
    }
    
    await connection.commit();
    res.status(201).json({ id: stocktakeId, stocktake_no: stocktakeNo, message: '盘点单创建成功' });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});

router.post('/stocktakes/:id/scan', async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    const { item_id, actual_qty } = req.body;
    
    const [items] = await connection.query(
      'SELECT * FROM stocktake_items WHERE id = ? AND stocktake_id = ?',
      [item_id, req.params.id]
    );
    
    if (items.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: '盘点明细不存在' });
    }
    
    const difference = actual_qty - items[0].system_qty;
    
    await connection.query(
      'UPDATE stocktake_items SET actual_qty = ?, difference = ?, status = 1 WHERE id = ?',
      [actual_qty, difference, item_id]
    );
    
    await connection.commit();
    res.json({ message: '盘点录入成功', difference });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});

router.post('/stocktakes/:id/complete', async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    const [items] = await connection.query(
      'SELECT difference FROM stocktake_items WHERE stocktake_id = ?',
      [req.params.id]
    );
    
    const differenceCount = items.filter(i => i.difference !== 0).length;
    
    await connection.query(
      'UPDATE stocktakes SET status = 1, difference_count = ?, finished_at = NOW() WHERE id = ?',
      [differenceCount, req.params.id]
    );
    
    await connection.commit();
    res.json({ message: '盘点完成', difference_count: differenceCount });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});

router.post('/stocktakes/:id/adjust', async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    const { item_id } = req.body;
    
    const [items] = await connection.query(
      'SELECT * FROM stocktake_items WHERE id = ? AND stocktake_id = ?',
      [item_id, req.params.id]
    );
    
    if (items.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: '盘点明细不存在' });
    }
    
    const item = items[0];
    
    await connection.query(
      'UPDATE inventory SET quantity = ?, available_qty = ? WHERE product_id = ? AND location_id = ?',
      [item.actual_qty, item.actual_qty, item.product_id, item.location_id]
    );
    
    await connection.commit();
    res.json({ message: '库存调整成功' });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});

module.exports = router;
