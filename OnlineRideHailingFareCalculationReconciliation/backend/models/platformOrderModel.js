const pool = require('../config/database');
const { findMatchingTrip } = require('./tripModel');

async function createPlatformOrder(orderData) {
  const [result] = await pool.query(
    `INSERT INTO platform_orders 
     (order_no, platform_name, driver_id, driver_name, vehicle_plate, 
      start_time, end_time, start_address, end_address, 
      distance, duration, total_amount, driver_amount, status, import_batch) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      orderData.order_no,
      orderData.platform_name,
      orderData.driver_id || null,
      orderData.driver_name,
      orderData.vehicle_plate,
      orderData.start_time,
      orderData.end_time,
      orderData.start_address,
      orderData.end_address,
      orderData.distance,
      orderData.duration,
      orderData.total_amount,
      orderData.driver_amount,
      0,
      orderData.import_batch
    ]
  );
  return result.insertId;
}

async function getPlatformOrderById(id) {
  const [rows] = await pool.query('SELECT * FROM platform_orders WHERE id = ?', [id]);
  return rows[0] || null;
}

async function getPlatformOrdersByDriverAndDate(driverId, date) {
  const [rows] = await pool.query(
    `SELECT po.*, t.trip_no, t.total_distance as local_distance, t.calculated_fare as local_fare
     FROM platform_orders po
     LEFT JOIN trips t ON po.matched_trip_id = t.id
     WHERE po.driver_id = ? AND DATE(po.start_time) = ?
     ORDER BY po.start_time DESC`,
    [driverId, date]
  );
  return rows;
}

async function getUnmatchedOrders() {
  const [rows] = await pool.query(
    'SELECT * FROM platform_orders WHERE status = 0 ORDER BY created_at DESC'
  );
  return rows;
}

async function matchOrderToTrip(orderId, tripId) {
  const [result] = await pool.query(
    'UPDATE platform_orders SET matched_trip_id = ?, status = 1 WHERE id = ?',
    [tripId, orderId]
  );
  return result.affectedRows > 0;
}

async function autoMatchOrders(driverId, date) {
  const orders = await getPlatformOrdersByDriverAndDate(driverId, date);
  const matchedCount = 0;
  
  for (const order of orders) {
    if (order.status === 0) {
      const trip = await findMatchingTrip(
        driverId,
        order.start_time,
        order.end_time
      );
      
      if (trip) {
        await matchOrderToTrip(order.id, trip.id);
        matchedCount++;
      }
    }
  }
  
  return matchedCount;
}

async function updateOrderStatus(orderId, status) {
  const [result] = await pool.query(
    'UPDATE platform_orders SET status = ? WHERE id = ?',
    [status, orderId]
  );
  return result.affectedRows > 0;
}

async function getOrdersByImportBatch(batch) {
  const [rows] = await pool.query(
    'SELECT * FROM platform_orders WHERE import_batch = ? ORDER BY start_time',
    [batch]
  );
  return rows;
}

module.exports = {
  createPlatformOrder,
  getPlatformOrderById,
  getPlatformOrdersByDriverAndDate,
  getUnmatchedOrders,
  matchOrderToTrip,
  autoMatchOrders,
  updateOrderStatus,
  getOrdersByImportBatch
};
