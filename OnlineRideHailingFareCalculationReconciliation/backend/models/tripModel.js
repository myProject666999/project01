const pool = require('../config/database');
const { calculateTripMetrics } = require('../utils/tripCalculator');
const { calculateFare } = require('../utils/fareCalculator');
const { getActivePricingRule } = require('./pricingRuleModel');

function generateTripNo() {
  const date = new Date();
  const prefix = 'TRIP' + date.getFullYear() +
    String(date.getMonth() + 1).padStart(2, '0') +
    String(date.getDate()).padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return prefix + random;
}

async function createTrip(vehicleId, driverId, startTime) {
  const tripNo = generateTripNo();
  const [result] = await pool.query(
    'INSERT INTO trips (trip_no, vehicle_id, driver_id, start_time, status) VALUES (?, ?, ?, ?, 0)',
    [tripNo, vehicleId, driverId, startTime]
  );
  return result.insertId;
}

async function getTripById(id) {
  const [rows] = await pool.query('SELECT * FROM trips WHERE id = ?', [id]);
  return rows[0] || null;
}

async function getTripsByDriverAndDate(driverId, date) {
  const [rows] = await pool.query(
    `SELECT t.*, v.plate_no 
     FROM trips t 
     LEFT JOIN vehicles v ON t.vehicle_id = v.id 
     WHERE t.driver_id = ? AND DATE(t.start_time) = ? 
     ORDER BY t.start_time DESC`,
    [driverId, date]
  );
  return rows;
}

async function getTripsByDateRange(startDate, endDate) {
  const [rows] = await pool.query(
    `SELECT t.*, d.driver_name, v.plate_no 
     FROM trips t 
     LEFT JOIN drivers d ON t.driver_id = d.id 
     LEFT JOIN vehicles v ON t.vehicle_id = v.id 
     WHERE t.start_time BETWEEN ? AND ? 
     ORDER BY t.start_time DESC`,
    [startDate, endDate]
  );
  return rows;
}

async function completeTrip(tripId, gpsDataList) {
  const trip = await getTripById(tripId);
  if (!trip) {
    throw new Error('行程不存在');
  }

  const metrics = calculateTripMetrics(gpsDataList);
  const pricingRule = await getActivePricingRule();
  const waitMinutes = metrics.waitDuration / 60;
  const calculatedFare = calculateFare(
    metrics.totalDistance,
    waitMinutes,
    metrics.startTime,
    pricingRule
  );

  const [result] = await pool.query(
    `UPDATE trips SET 
     end_time = ?, 
     start_latitude = ?, start_longitude = ?,
     end_latitude = ?, end_longitude = ?,
     total_distance = ?, total_duration = ?, wait_duration = ?,
     calculated_fare = ?, status = 1
     WHERE id = ?`,
    [
      metrics.endTime,
      metrics.startPoint.latitude, metrics.startPoint.longitude,
      metrics.endPoint.latitude, metrics.endPoint.longitude,
      metrics.totalDistance, metrics.totalDuration, metrics.waitDuration,
      calculatedFare,
      tripId
    ]
  );

  return { success: result.affectedRows > 0, calculatedFare, metrics };
}

async function getDriverDailySummary(driverId, date) {
  const [rows] = await pool.query(
    `SELECT 
      COUNT(*) as trip_count,
      SUM(total_distance) as total_distance,
      SUM(total_duration) as total_duration,
      SUM(calculated_fare) as total_fare
     FROM trips 
     WHERE driver_id = ? AND DATE(start_time) = ? AND status >= 1`,
    [driverId, date]
  );
  return rows[0];
}

async function findMatchingTrip(driverId, startTime, endTime, timeThreshold = 1800) {
  const [rows] = await pool.query(
    `SELECT * FROM trips 
     WHERE driver_id = ? 
     AND status = 1
     AND ABS(TIMESTAMPDIFF(SECOND, start_time, ?)) < ?
     AND ABS(TIMESTAMPDIFF(SECOND, end_time, ?)) < ?
     LIMIT 1`,
    [driverId, startTime, timeThreshold, endTime, timeThreshold]
  );
  return rows[0] || null;
}

module.exports = {
  createTrip,
  getTripById,
  getTripsByDriverAndDate,
  getTripsByDateRange,
  completeTrip,
  getDriverDailySummary,
  findMatchingTrip
};
