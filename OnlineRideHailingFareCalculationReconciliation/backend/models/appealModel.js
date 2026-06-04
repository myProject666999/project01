const pool = require('../config/database');

function generateAppealNo() {
  const date = new Date();
  const prefix = 'APL' + date.getFullYear() +
    String(date.getMonth() + 1).padStart(2, '0') +
    String(date.getDate()).padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return prefix + random;
}

async function createAppeal(appealData) {
  const appealNo = generateAppealNo();
  const [result] = await pool.query(
    `INSERT INTO appeals 
     (appeal_no, driver_id, reconciliation_id, reconciliation_detail_id, 
      order_no, appeal_type, appeal_reason, appeal_proof, status) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`,
    [
      appealNo,
      appealData.driver_id,
      appealData.reconciliation_id,
      appealData.reconciliation_detail_id,
      appealData.order_no,
      appealData.appeal_type,
      appealData.appeal_reason,
      appealData.appeal_proof
    ]
  );
  
  await pool.query(
    'UPDATE reconciliations SET status = 2 WHERE id = ?',
    [appealData.reconciliation_id]
  );
  
  return result.insertId;
}

async function getAppealById(id) {
  const [rows] = await pool.query(
    'SELECT * FROM appeals WHERE id = ?',
    [id]
  );
  return rows[0] || null;
}

async function getAppealsByDriver(driverId, status = null) {
  let sql = 'SELECT * FROM appeals WHERE driver_id = ?';
  let params = [driverId];
  
  if (status !== null) {
    sql += ' AND status = ?';
    params.push(status);
  }
  
  sql += ' ORDER BY created_at DESC';
  
  const [rows] = await pool.query(sql, params);
  return rows;
}

async function getAllAppeals(status = null) {
  let sql = `SELECT a.*, d.driver_name 
             FROM appeals a 
             LEFT JOIN drivers d ON a.driver_id = d.id`;
  let params = [];
  
  if (status !== null) {
    sql += ' WHERE a.status = ?';
    params.push(status);
  }
  
  sql += ' ORDER BY a.created_at DESC';
  
  const [rows] = await pool.query(sql, params);
  return rows;
}

async function handleAppeal(id, handler, handleRemark, newStatus) {
  const [result] = await pool.query(
    `UPDATE appeals 
     SET handler = ?, handle_remark = ?, status = ?, handled_at = NOW() 
     WHERE id = ?`,
    [handler, handleRemark, newStatus, id]
  );
  
  return result.affectedRows > 0;
}

async function getPendingAppealsCount() {
  const [rows] = await pool.query(
    'SELECT COUNT(*) as count FROM appeals WHERE status IN (0, 1)'
  );
  return rows[0].count;
}

module.exports = {
  createAppeal,
  getAppealById,
  getAppealsByDriver,
  getAllAppeals,
  handleAppeal,
  getPendingAppealsCount
};
