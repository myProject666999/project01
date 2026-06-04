const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    let sql = 'SELECT r.*, so.order_no FROM reviews r LEFT JOIN sales_orders so ON r.sales_order_id = so.id WHERE 1=1';
    const params = [];
    
    if (status !== undefined) {
      sql += ' AND r.status = ?';
      params.push(status);
    }
    
    sql += ' ORDER BY r.id DESC';
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [reviews] = await db.query(`
      SELECT r.*, so.order_no, so.customer_name, so.address
      FROM reviews r
      LEFT JOIN sales_orders so ON r.sales_order_id = so.id
      WHERE r.id = ?
    `, [req.params.id]);
    
    if (reviews.length === 0) {
      return res.status(404).json({ error: '复核记录不存在' });
    }
    
    const [items] = await db.query(`
      SELECT ri.*, p.sku, p.name, p.barcode
      FROM review_items ri
      LEFT JOIN products p ON ri.product_id = p.id
      WHERE ri.review_id = ?
    `, [req.params.id]);
    
    res.json({ ...reviews[0], items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/start', async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    const { order_id } = req.body;
    
    const [orders] = await connection.query(
      'SELECT * FROM sales_orders WHERE id = ? AND status = 3',
      [order_id]
    );
    
    if (orders.length === 0) {
      await connection.rollback();
      return res.status(400).json({ error: '订单状态不正确或不存在' });
    }
    
    const [orderItems] = await connection.query(
      'SELECT * FROM sales_order_items WHERE sales_order_id = ?',
      [order_id]
    );
    
    const reviewNo = 'R' + Date.now();
    
    const [reviewResult] = await connection.query(
      'INSERT INTO reviews (review_no, sales_order_id, status, total_items) VALUES (?, ?, 0, ?)',
      [reviewNo, order_id, orderItems.length]
    );
    
    const reviewId = reviewResult.insertId;
    
    for (const item of orderItems) {
      await connection.query(
        'INSERT INTO review_items (review_id, product_id, expected_qty) VALUES (?, ?, ?)',
        [reviewId, item.product_id, item.picked_qty]
      );
    }
    
    await connection.commit();
    res.status(201).json({ id: reviewId, review_no: reviewNo, message: '复核开始' });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});

router.post('/:id/scan', async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    const { barcode } = req.body;
    
    const [products] = await connection.query(
      'SELECT * FROM products WHERE barcode = ?',
      [barcode]
    );
    
    if (products.length === 0) {
      await connection.rollback();
      return res.status(400).json({ error: '条码不存在', type: 'barcode_error' });
    }
    
    const product = products[0];
    
    const [reviewItems] = await connection.query(`
      SELECT * FROM review_items 
      WHERE review_id = ? AND product_id = ? AND status = 0
      LIMIT 1
    `, [req.params.id, product.id]);
    
    if (reviewItems.length === 0) {
      await connection.rollback();
      return res.status(400).json({ error: '该商品不在此订单中或已复核完成', type: 'not_in_order' });
    }
    
    const item = reviewItems[0];
    const newActualQty = item.actual_qty + 1;
    
    if (newActualQty > item.expected_qty) {
      await connection.rollback();
      return res.status(400).json({ error: '数量超出', type: 'qty_over' });
    }
    
    const isComplete = newActualQty === item.expected_qty;
    
    await connection.query(
      'UPDATE review_items SET scanned_barcode = ?, actual_qty = ?, status = ? WHERE id = ?',
      [barcode, newActualQty, isComplete ? 1 : 0, item.id]
    );
    
    await connection.commit();
    res.json({ 
      message: '扫描成功', 
      product: { name: product.name, sku: product.sku },
      scanned: newActualQty,
      expected: item.expected_qty,
      complete: isComplete
    });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});

router.post('/:id/complete', async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    const [items] = await connection.query(
      'SELECT status, expected_qty, actual_qty FROM review_items WHERE review_id = ?',
      [req.params.id]
    );
    
    const passItems = items.filter(i => i.status === 1).length;
    const failItems = items.length - passItems;
    const allPass = failItems === 0;
    
    await connection.query(
      'UPDATE reviews SET status = ?, pass_items = ?, fail_items = ?, reviewed_at = NOW() WHERE id = ?',
      [allPass ? 1 : 2, passItems, failItems, req.params.id]
    );
    
    const [reviews] = await connection.query(
      'SELECT sales_order_id FROM reviews WHERE id = ?',
      [req.params.id]
    );
    
    if (allPass) {
      await connection.query(
        'UPDATE sales_orders SET status = 4 WHERE id = ?',
        [reviews[0].sales_order_id]
      );
    }
    
    await connection.commit();
    res.json({ 
      message: allPass ? '复核通过' : '复核存在异常',
      status: allPass ? 1 : 2,
      pass_items: passItems,
      fail_items: failItems
    });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});

module.exports = router;
