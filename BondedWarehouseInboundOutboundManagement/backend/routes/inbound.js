const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    let sql = 'SELECT * FROM inbound_orders WHERE 1=1';
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

router.get('/:id', async (req, res) => {
  try {
    const [orders] = await db.query('SELECT * FROM inbound_orders WHERE id = ?', [req.params.id]);
    if (orders.length === 0) {
      return res.status(404).json({ error: '入库单不存在' });
    }
    
    const [items] = await db.query(`
      SELECT ii.*, p.sku, p.name, p.barcode, l.code as location_code
      FROM inbound_items ii
      LEFT JOIN products p ON ii.product_id = p.id
      LEFT JOIN locations l ON ii.location_id = l.id
      WHERE ii.inbound_order_id = ?
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
    
    const { order_no, supplier, remark, items } = req.body;
    const total_qty = items.reduce((sum, item) => sum + item.plan_qty, 0);
    
    const [orderResult] = await connection.query(
      'INSERT INTO inbound_orders (order_no, supplier, total_qty, remark) VALUES (?, ?, ?, ?)',
      [order_no, supplier, total_qty, remark]
    );
    
    const orderId = orderResult.insertId;
    
    for (const item of items) {
      await connection.query(
        'INSERT INTO inbound_items (inbound_order_id, product_id, plan_qty) VALUES (?, ?, ?)',
        [orderId, item.product_id, item.plan_qty]
      );
    }
    
    await connection.commit();
    res.status(201).json({ id: orderId, message: '入库单创建成功' });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});

router.post('/:id/receive', async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    const { item_id, actual_qty, location_id } = req.body;
    
    const [items] = await connection.query(
      'SELECT * FROM inbound_items WHERE id = ? AND inbound_order_id = ?',
      [item_id, req.params.id]
    );
    
    if (items.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: '入库明细不存在' });
    }
    
    await connection.query(
      'UPDATE inbound_items SET actual_qty = ?, location_id = ?, status = 1 WHERE id = ?',
      [actual_qty, location_id, item_id]
    );
    
    const [inventory] = await connection.query(
      'SELECT * FROM inventory WHERE product_id = ? AND location_id = ?',
      [items[0].product_id, location_id]
    );
    
    if (inventory.length > 0) {
      await connection.query(
        'UPDATE inventory SET quantity = quantity + ?, available_qty = available_qty + ? WHERE id = ?',
        [actual_qty, actual_qty, inventory[0].id]
      );
    } else {
      await connection.query(
        'INSERT INTO inventory (product_id, location_id, quantity, available_qty) VALUES (?, ?, ?, ?)',
        [items[0].product_id, location_id, actual_qty, actual_qty]
      );
    }
    
    const [allItems] = await connection.query(
      'SELECT status FROM inbound_items WHERE inbound_order_id = ?',
      [req.params.id]
    );
    
    const allCompleted = allItems.every(item => item.status === 1);
    const anyCompleted = allItems.some(item => item.status === 1);
    
    let status = 0;
    if (allCompleted) status = 2;
    else if (anyCompleted) status = 1;
    
    await connection.query(
      'UPDATE inbound_orders SET status = ? WHERE id = ?',
      [status, req.params.id]
    );
    
    await connection.commit();
    res.json({ message: '入库成功' });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});

module.exports = router;
