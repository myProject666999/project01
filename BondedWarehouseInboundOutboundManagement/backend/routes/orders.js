const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.get('/', async (req, res) => {
  try {
    const { status, platform } = req.query;
    let sql = 'SELECT * FROM sales_orders WHERE 1=1';
    const params = [];
    
    if (status !== undefined) {
      sql += ' AND status = ?';
      params.push(status);
    }
    if (platform) {
      sql += ' AND platform = ?';
      params.push(platform);
    }
    
    sql += ' ORDER BY id DESC';
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [orders] = await db.query('SELECT * FROM sales_orders WHERE id = ?', [req.params.id]);
    if (orders.length === 0) {
      return res.status(404).json({ error: '订单不存在' });
    }
    
    const [items] = await db.query(`
      SELECT soi.*, p.sku, p.name, p.barcode, p.spec
      FROM sales_order_items soi
      LEFT JOIN products p ON soi.product_id = p.id
      WHERE soi.sales_order_id = ?
    `, [req.params.id]);
    
    res.json({ ...orders[0], items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    const { order_no, platform, customer_name, customer_phone, address, id_card, items } = req.body;
    const total_qty = items.reduce((sum, item) => sum + item.quantity, 0);
    const total_amount = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    
    const [orderResult] = await connection.query(
      'INSERT INTO sales_orders (order_no, platform, customer_name, customer_phone, address, id_card, total_qty, total_amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [order_no, platform, customer_name, customer_phone, address, id_card, total_qty, total_amount]
    );
    
    const orderId = orderResult.insertId;
    
    for (const item of items) {
      await connection.query(
        'INSERT INTO sales_order_items (sales_order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.product_id, item.quantity, item.price]
      );
    }
    
    await connection.commit();
    res.status(201).json({ id: orderId, message: '订单创建成功' });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});

module.exports = router;
