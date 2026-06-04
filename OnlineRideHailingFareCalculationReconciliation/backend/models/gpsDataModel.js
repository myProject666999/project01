const pool = require('../config/database');

async function insertGpsData(gpsData) {
  const [result] = await pool.query(
    'INSERT INTO gps_data (gps_device_id, latitude, longitude, speed, gps_time) VALUES (?, ?, ?, ?, ?)',
    [
      gpsData.gps_device_id,
      gpsData.latitude,
      gpsData.longitude,
      gpsData.speed || 0,
      gpsData.gps_time
    ]
  );
  return result.insertId;
}

async function insertGpsDataBatch(gpsDataList) {
  const values = gpsDataList.map(data => [
    data.gps_device_id,
    data.latitude,
    data.longitude,
    data.speed || 0,
    data.gps_time
  ]);
  
  const [result] = await pool.query(
    'INSERT INTO gps_data (gps_device_id, latitude, longitude, speed, gps_time) VALUES ?',
    [values]
  );
  return result.affectedRows;
}

async function getGpsDataByDeviceAndTimeRange(gpsDeviceId, startTime, endTime) {
  const [rows] = await pool.query(
    'SELECT * FROM gps_data WHERE gps_device_id = ? AND gps_time BETWEEN ? AND ? ORDER BY gps_time',
    [gpsDeviceId, startTime, endTime]
  );
  return rows;
}

async function getGpsDataByTrip(tripId) {
  const [tripRows] = await pool.query(
    `SELECT v.gps_device_id, t.start_time, t.end_time 
     FROM trips t 
     LEFT JOIN vehicles v ON t.vehicle_id = v.id 
     WHERE t.id = ?`,
    [tripId]
  );
  
  if (tripRows.length === 0) {
    return [];
  }
  
  const trip = tripRows[0];
  return getGpsDataByDeviceAndTimeRange(
    trip.gps_device_id,
    trip.start_time,
    trip.end_time
  );
}

module.exports = {
  insertGpsData,
  insertGpsDataBatch,
  getGpsDataByDeviceAndTimeRange,
  getGpsDataByTrip
};
