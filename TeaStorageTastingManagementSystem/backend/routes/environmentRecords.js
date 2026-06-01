const express = require('express');
const router = express.Router();
const EnvironmentRecord = require('../models/EnvironmentRecord');
const StorageLocation = require('../models/StorageLocation');
const Alert = require('../models/Alert');
const { Op, fn, col } = require('sequelize');

const HUMIDITY_THRESHOLD = process.env.HUMIDITY_THRESHOLD || 75;

router.get('/', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, location_id, start_date, end_date, is_alert } = req.query;
    const where = {};
    
    if (location_id) where.location_id = location_id;
    if (start_date) where.record_date = { [Op.gte]: start_date };
    if (end_date) where.record_date = { ...where.record_date, [Op.lte]: end_date };
    if (is_alert !== undefined) where.is_alert = is_alert;

    const offset = (page - 1) * pageSize;
    const { count, rows } = await EnvironmentRecord.findAndCountAll({
      where,
      offset,
      limit: parseInt(pageSize),
      include: [{ model: StorageLocation, as: 'location' }],
      order: [['record_date', 'DESC'], ['record_time', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        list: rows,
        total: count,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/latest', async (req, res) => {
  try {
    const { location_id } = req.query;
    const where = {};
    if (location_id) where.location_id = location_id;

    const latestRecords = await EnvironmentRecord.findAll({
      where,
      include: [{ model: StorageLocation, as: 'location' }],
      order: [['location_id', 'ASC'], ['record_date', 'DESC'], ['record_time', 'DESC']],
      distinct: true,
      col: 'location_id'
    });

    const uniqueRecords = [];
    const locationIds = new Set();
    for (const record of latestRecords) {
      if (!locationIds.has(record.location_id)) {
        locationIds.add(record.location_id);
        uniqueRecords.push(record);
      }
    }

    res.json({ success: true, data: uniqueRecords });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/statistics', async (req, res) => {
  try {
    const { location_id, days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const where = {
      record_date: { [Op.gte]: startDate.toISOString().split('T')[0] }
    };
    if (location_id) where.location_id = location_id;

    const records = await EnvironmentRecord.findAll({
      where,
      include: [{ model: StorageLocation, as: 'location' }],
      order: [['record_date', 'ASC'], ['record_time', 'ASC']]
    });

    const dailyStats = {};
    records.forEach(record => {
      const date = record.record_date;
      if (!dailyStats[date]) {
        dailyStats[date] = {
          date,
          temperature: [],
          humidity: [],
          alerts: 0
        };
      }
      dailyStats[date].temperature.push(parseFloat(record.temperature));
      dailyStats[date].humidity.push(parseFloat(record.humidity));
      if (record.is_alert) dailyStats[date].alerts++;
    });

    const result = Object.values(dailyStats).map(stat => ({
      date: stat.date,
      avg_temperature: (stat.temperature.reduce((a, b) => a + b, 0) / stat.temperature.length).toFixed(2),
      avg_humidity: (stat.humidity.reduce((a, b) => a + b, 0) / stat.humidity.length).toFixed(2),
      max_temperature: Math.max(...stat.temperature).toFixed(2),
      min_temperature: Math.min(...stat.temperature).toFixed(2),
      max_humidity: Math.max(...stat.humidity).toFixed(2),
      min_humidity: Math.min(...stat.humidity).toFixed(2),
      alerts: stat.alerts
    }));

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { location_id, temperature, humidity, record_date, record_time } = req.body;
    
    const is_alert = parseFloat(humidity) > HUMIDITY_THRESHOLD;
    const alert_type = is_alert ? 'humidity_high' : null;

    const record = await EnvironmentRecord.create({
      location_id,
      temperature,
      humidity,
      record_date: record_date || new Date().toISOString().split('T')[0],
      record_time: record_time || new Date().toTimeString().split(' ')[0],
      is_alert,
      alert_type
    });

    if (is_alert) {
      const location = await StorageLocation.findByPk(location_id);
      const alertLevel = parseFloat(humidity) > HUMIDITY_THRESHOLD + 3 ? 'danger' : 'warning';
      
      await Alert.create({
        location_id,
        alert_type: 'humidity_high',
        alert_level: alertLevel,
        message: `${location.location_code}仓位湿度过高，已达${humidity}%`,
        value: humidity,
        threshold: HUMIDITY_THRESHOLD
      });
    }

    res.json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/alerts', async (req, res) => {
  try {
    const { page = 1, pageSize = 20, resolved, location_id } = req.query;
    const where = {};
    
    if (resolved !== undefined) where.resolved = resolved;
    if (location_id) where.location_id = location_id;

    const offset = (page - 1) * pageSize;
    const { count, rows } = await Alert.findAndCountAll({
      where,
      offset,
      limit: parseInt(pageSize),
      include: [{ model: StorageLocation, as: 'location' }],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        list: rows,
        total: count,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/alerts/:id/resolve', async (req, res) => {
  try {
    const alert = await Alert.findByPk(req.params.id);
    if (!alert) {
      return res.status(404).json({ success: false, message: '预警不存在' });
    }
    
    await alert.update({
      resolved: 1,
      resolved_at: new Date(),
      resolved_note: req.body.resolved_note
    });
    
    res.json({ success: true, data: alert });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
