const tripModel = require('../models/tripModel');
const gpsDataModel = require('../models/gpsDataModel');

async function getTrips(req, res) {
  try {
    const { driverId, date, startDate, endDate } = req.query;
    
    let trips;
    if (driverId && date) {
      trips = await tripModel.getTripsByDriverAndDate(driverId, date);
    } else if (startDate && endDate) {
      trips = await tripModel.getTripsByDateRange(startDate, endDate);
    } else {
      return res.status(400).json({ success: false, message: '参数不完整' });
    }
    
    res.json({ success: true, data: trips });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '获取行程列表失败' });
  }
}

async function getTrip(req, res) {
  try {
    const { id } = req.params;
    const trip = await tripModel.getTripById(id);
    if (!trip) {
      return res.status(404).json({ success: false, message: '行程不存在' });
    }
    
    const gpsData = await gpsDataModel.getGpsDataByTrip(id);
    
    res.json({ success: true, data: { ...trip, gpsData } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '获取行程详情失败' });
  }
}

async function createTrip(req, res) {
  try {
    const { vehicleId, driverId, startTime } = req.body;
    const id = await tripModel.createTrip(vehicleId, driverId, startTime || new Date());
    res.json({ success: true, data: { id } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '创建行程失败' });
  }
}

async function completeTrip(req, res) {
  try {
    const { id } = req.params;
    const { gpsDataList } = req.body;
    
    if (!gpsDataList || gpsDataList.length < 2) {
      return res.status(400).json({ success: false, message: 'GPS数据不完整' });
    }
    
    const result = await tripModel.completeTrip(id, gpsDataList);
    res.json({ success: true, data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message || '结束行程失败' });
  }
}

async function getDriverDailySummary(req, res) {
  try {
    const { driverId, date } = req.params;
    const summary = await tripModel.getDriverDailySummary(driverId, date);
    res.json({ success: true, data: summary });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '获取每日汇总失败' });
  }
}

module.exports = {
  getTrips,
  getTrip,
  createTrip,
  completeTrip,
  getDriverDailySummary
};
