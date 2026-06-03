const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { traceForwardFromMaterial, traceBackwardFromProduct } = require('../utils/bfs');

router.get('/material/:batchNo', async (req, res) => {
  try {
    const { batchNo } = req.params;

    const [rows] = await pool.execute(
      'SELECT id FROM material_batches WHERE batch_no = ?',
      [batchNo]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: '原料批次不存在' });
    }

    const result = await traceForwardFromMaterial(rows[0].id);

    let totalCost = 0;
    const productBatchIds = result.productBatches.map(pb => pb.id);
    if (productBatchIds.length > 0) {
      const placeholders = productBatchIds.map(() => '?').join(',');
      const [costRows] = await pool.execute(`
        SELECT SUM(s.quantity * p.price) as total_cost
        FROM shipments s
        JOIN product_batches pb ON s.product_batch_id = pb.id
        JOIN products p ON pb.product_id = p.id
        WHERE pb.id IN (${placeholders})
      `, productBatchIds);
      totalCost = costRows[0].total_cost || 0;
    }

    res.json({
      success: true,
      data: {
        ...result,
        totalRecallCost: totalCost
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '服务器错误' });
  }
});

router.get('/product/:batchNo', async (req, res) => {
  try {
    const { batchNo } = req.params;

    const [rows] = await pool.execute(
      'SELECT id FROM product_batches WHERE batch_no = ?',
      [batchNo]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: '成品批次不存在' });
    }

    const result = await traceBackwardFromProduct(rows[0].id);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '服务器错误' });
  }
});

module.exports = router;
