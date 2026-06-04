const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    let sql = 'SELECT * FROM waves WHERE 1=1';
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
    const [waves] = await db.query('SELECT * FROM waves WHERE id = ?', [req.params.id]);
    if (waves.length === 0) {
      return res.status(404).json({ error: '波次不存在' });
    }
    
    const [items] = await db.query(`
      SELECT wi.*, so.order_no, p.sku, p.name, p.barcode, l.code as location_code
      FROM wave_items wi
      LEFT JOIN sales_orders so ON wi.sales_order_id = so.id
      LEFT JOIN products p ON wi.product_id = p.id
      LEFT JOIN locations l ON wi.location_id = l.id
      WHERE wi.wave_id = ?
      ORDER BY l.code
    `, [req.params.id]);
    
    const [orders] = await db.query(`
      SELECT DISTINCT so.* FROM sales_orders so
      INNER JOIN wave_items wi ON so.id = wi.sales_order_id
      WHERE wi.wave_id = ?
    `, [req.params.id]);
    
    res.json({ ...waves[0], items, orders });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/generate', async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    const { order_ids } = req.body;
    
    if (!order_ids || order_ids.length === 0) {
      await connection.rollback();
      return res.status(400).json({ error: '请选择订单' });
    }
    
    const [pendingOrders] = await connection.query(
      'SELECT id FROM sales_orders WHERE id IN (?) AND status = 0',
      [order_ids]
    );
    
    if (pendingOrders.length !== order_ids.length) {
      await connection.rollback();
      return res.status(400).json({ error: '部分订单已处理' });
    }
    
    const waveNo = 'W' + Date.now();
    
    const [waveResult] = await connection.query(
      'INSERT INTO waves (wave_no, order_count, status) VALUES (?, ?, 0)',
      [waveNo, order_ids.length]
    );
    
    const waveId = waveResult.insertId;
    
    let totalQty = 0;
    
    for (const orderId of order_ids) {
      const [orderItems] = await connection.query(
        'SELECT * FROM sales_order_items WHERE sales_order_id = ?',
        [orderId]
      );
      
      for (const item of orderItems) {
        const [inventory] = await connection.query(`
          SELECT i.*, l.code 
          FROM inventory i
          LEFT JOIN locations l ON i.location_id = l.id
          WHERE i.product_id = ? AND i.available_qty >= ?
          ORDER BY l.code
          LIMIT 1
        `, [item.product_id, item.quantity]);
        
        const locationId = inventory.length > 0 ? inventory[0].location_id : null;
        
        await connection.query(
          'INSERT INTO wave_items (wave_id, sales_order_id, product_id, quantity, location_id) VALUES (?, ?, ?, ?, ?)',
          [waveId, orderId, item.product_id, item.quantity, locationId]
        );
        
        totalQty += item.quantity;
        
        if (locationId) {
          await connection.query(
            'UPDATE inventory SET available_qty = available_qty - ?, locked_qty = locked_qty + ? WHERE product_id = ? AND location_id = ?',
            [item.quantity, item.quantity, item.product_id, locationId]
          );
        }
      }
      
      await connection.query(
        'UPDATE sales_orders SET status = 1, wave_id = ? WHERE id = ?',
        [waveId, orderId]
      );
    }
    
    await connection.query(
      'UPDATE waves SET total_qty = ? WHERE id = ?',
      [totalQty, waveId]
    );
    
    await connection.commit();
    res.status(201).json({ id: waveId, wave_no: waveNo, message: '波次生成成功' });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});

router.post('/:id/pick', async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    const { item_id, picked_qty } = req.body;
    
    const [items] = await connection.query(
      'SELECT * FROM wave_items WHERE id = ? AND wave_id = ?',
      [item_id, req.params.id]
    );
    
    if (items.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: '波次明细不存在' });
    }
    
    const item = items[0];
    
    await connection.query(
      'UPDATE wave_items SET picked_qty = ?, status = 1 WHERE id = ?',
      [picked_qty, item_id]
    );
    
    await connection.query(
      'UPDATE sales_order_items SET picked_qty = picked_qty + ? WHERE sales_order_id = ? AND product_id = ?',
      [picked_qty, item.sales_order_id, item.product_id]
    );
    
    await connection.query(
      'UPDATE inventory SET quantity = quantity - ?, locked_qty = locked_qty - ? WHERE product_id = ? AND location_id = ?',
      [picked_qty, picked_qty, item.product_id, item.location_id]
    );
    
    const [allItems] = await connection.query(
      'SELECT status FROM wave_items WHERE wave_id = ?',
      [req.params.id]
    );
    
    const allPicked = allItems.every(i => i.status === 1);
    
    if (allPicked) {
      await connection.query(
        'UPDATE waves SET status = 2, picked_at = NOW() WHERE id = ?',
        [req.params.id]
      );
      
      await connection.query(
        'UPDATE sales_orders SET status = 3 WHERE wave_id = ?',
        [req.params.id]
      );
    } else {
      await connection.query(
        'UPDATE waves SET status = 1 WHERE id = ?',
        [req.params.id]
      );
    }
    
    await connection.commit();
    res.json({ message: '拣货成功' });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});

module.exports = router;
