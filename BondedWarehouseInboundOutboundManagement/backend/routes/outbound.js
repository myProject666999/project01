const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    let sql = `
      SELECT oo.*, so.order_no, so.customer_name, r.review_no
      FROM outbound_orders oo
      LEFT JOIN sales_orders so ON oo.sales_order_id = so.id
      LEFT JOIN reviews r ON oo.review_id = r.id
      WHERE 1=1
    `;
    const params = [];
    
    if (status !== undefined) {
      sql += ' AND oo.status = ?';
      params.push(status);
    }
    
    sql += ' ORDER BY oo.id DESC';
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [outbounds] = await db.query(`
      SELECT oo.*, so.order_no, so.customer_name, so.customer_phone, so.address, so.id_card, r.review_no
      FROM outbound_orders oo
      LEFT JOIN sales_orders so ON oo.sales_order_id = so.id
      LEFT JOIN reviews r ON oo.review_id = r.id
      WHERE oo.id = ?
    `, [req.params.id]);
    
    if (outbounds.length === 0) {
      return res.status(404).json({ error: '出库单不存在' });
    }
    
    const [items] = await db.query(`
      SELECT soi.*, p.sku, p.name, p.barcode, p.spec, p.country
      FROM sales_order_items soi
      LEFT JOIN products p ON soi.product_id = p.id
      WHERE soi.sales_order_id = ?
    `, [outbounds[0].sales_order_id]);
    
    res.json({ ...outbounds[0], items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/create', async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    const { order_id, review_id } = req.body;
    
    const [orders] = await connection.query(
      'SELECT * FROM sales_orders WHERE id = ? AND status = 4',
      [order_id]
    );
    
    if (orders.length === 0) {
      await connection.rollback();
      return res.status(400).json({ error: '订单状态不正确或不存在' });
    }
    
    const [existing] = await connection.query(
      'SELECT id FROM outbound_orders WHERE sales_order_id = ?',
      [order_id]
    );
    
    if (existing.length > 0) {
      await connection.rollback();
      return res.status(400).json({ error: '出库单已存在' });
    }
    
    const outboundNo = 'O' + Date.now();
    
    await connection.query(
      'INSERT INTO outbound_orders (outbound_no, sales_order_id, review_id, status) VALUES (?, ?, ?, 0)',
      [outboundNo, order_id, review_id]
    );
    
    await connection.commit();
    res.status(201).json({ outbound_no: outboundNo, message: '出库单创建成功' });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});

router.post('/:id/confirm', async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    const { operator, logistics_no } = req.body;
    
    await connection.query(
      'UPDATE outbound_orders SET status = 1, operator = ?, logistics_no = ?, outbound_at = NOW() WHERE id = ?',
      [operator, logistics_no, req.params.id]
    );
    
    await connection.commit();
    res.json({ message: '出库确认成功' });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});

router.post('/:id/ship', async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    await connection.query(
      'UPDATE outbound_orders SET status = 2 WHERE id = ?',
      [req.params.id]
    );
    
    await connection.commit();
    res.json({ message: '发货成功' });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});

router.post('/:id/customs', async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    const { customs_status } = req.body;
    
    await connection.query(
      'UPDATE outbound_orders SET customs_status = ? WHERE id = ?',
      [customs_status, req.params.id]
    );
    
    await connection.commit();
    res.json({ message: '报关状态更新成功' });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});

module.exports = router;
