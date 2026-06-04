const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.get('/', async (req, res) => {
  try {
    const { zone, status } = req.query;
    let sql = 'SELECT * FROM locations WHERE 1=1';
    const params = [];
    
    if (zone) {
      sql += ' AND zone = ?';
      params.push(zone);
    }
    if (status !== undefined) {
      sql += ' AND status = ?';
      params.push(status);
    }
    
    sql += ' ORDER BY code';
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM locations WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: '库位不存在' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { code, zone, aisle, shelf, layer, position } = req.body;
    const [result] = await db.query(
      'INSERT INTO locations (code, zone, aisle, shelf, layer, position) VALUES (?, ?, ?, ?, ?, ?)',
      [code, zone, aisle, shelf, layer, position]
    );
    res.status(201).json({ id: result.insertId, message: '库位创建成功' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { code, zone, aisle, shelf, layer, position, status } = req.body;
    await db.query(
      'UPDATE locations SET code=?, zone=?, aisle=?, shelf=?, layer=?, position=?, status=? WHERE id=?',
      [code, zone, aisle, shelf, layer, position, status, req.params.id]
    );
    res.json({ message: '库位更新成功' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM locations WHERE id = ?', [req.params.id]);
    res.json({ message: '库位删除成功' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
