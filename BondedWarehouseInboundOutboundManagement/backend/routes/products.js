const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.get('/', async (req, res) => {
  try {
    const { keyword, category } = req.query;
    let sql = 'SELECT * FROM products WHERE 1=1';
    const params = [];
    
    if (keyword) {
      sql += ' AND (name LIKE ? OR sku LIKE ? OR barcode LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    }
    if (category) {
      sql += ' AND category = ?';
      params.push(category);
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
    const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: '商品不存在' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { sku, barcode, name, category, spec, unit, price, country } = req.body;
    const [result] = await db.query(
      'INSERT INTO products (sku, barcode, name, category, spec, unit, price, country) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [sku, barcode, name, category, spec, unit, price, country]
    );
    res.status(201).json({ id: result.insertId, message: '商品创建成功' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { sku, barcode, name, category, spec, unit, price, country } = req.body;
    await db.query(
      'UPDATE products SET sku=?, barcode=?, name=?, category=?, spec=?, unit=?, price=?, country=? WHERE id=?',
      [sku, barcode, name, category, spec, unit, price, country, req.params.id]
    );
    res.json({ message: '商品更新成功' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ message: '商品删除成功' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
