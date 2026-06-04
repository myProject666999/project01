const pool = require('../config/database');

async function getAllDrivers() {
  const [rows] = await pool.query('SELECT * FROM drivers WHERE status = 1 ORDER BY created_at DESC');
  return rows;
}

async function getDriverById(id) {
  const [rows] = await pool.query('SELECT * FROM drivers WHERE id = ?', [id]);
  return rows[0] || null;
}

async function createDriver(driverData) {
  const [result] = await pool.query(
    'INSERT INTO drivers (driver_name, phone, license_no) VALUES (?, ?, ?)',
    [driverData.driver_name, driverData.phone, driverData.license_no]
  );
  return result.insertId;
}

async function updateDriver(id, driverData) {
  const [result] = await pool.query(
    'UPDATE drivers SET driver_name = ?, phone = ?, license_no = ? WHERE id = ?',
    [driverData.driver_name, driverData.phone, driverData.license_no, id]
  );
  return result.affectedRows > 0;
}

async function deleteDriver(id) {
  const [result] = await pool.query('UPDATE drivers SET status = 0 WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = {
  getAllDrivers,
  getDriverById,
  createDriver,
  updateDriver,
  deleteDriver
};
