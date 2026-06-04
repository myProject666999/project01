const gpsDataModel = require('../models/gpsDataModel');

async function uploadGpsData(req, res) {
  try {
    const gpsData = req.body;
    const id = await gpsDataModel.insertGpsData(gpsData);
    res.json({ success: true, data: { id } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '上传GPS数据失败' });
  }
}

async function uploadGpsBatch(req, res) {
  try {
    const { gpsDataList } = req.body;
    
    if (!gpsDataList || gpsDataList.length === 0) {
      return res.status(400).json({ success: false, message: 'GPS数据为空' });
    }
    
    const count = await gpsDataModel.insertGpsDataBatch(gpsDataList);
    res.json({ success: true, data: { count } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '批量上传GPS数据失败' });
  }
}

async function getGpsData(req, res) {
  try {
    const { gpsDeviceId, startTime, endTime } = req.query;
    
    const gpsData = await gpsDataModel.getGpsDataByDeviceAndTimeRange(
      gpsDeviceId,
      startTime,
      endTime
    );
    
    res.json({ success: true, data: gpsData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '获取GPS数据失败' });
  }
}

async function getGpsDataByTrip(req, res) {
  try {
    const { tripId } = req.params;
    
    const gpsData = await gpsDataModel.getGpsDataByTrip(tripId);
    
    res.json({ success: true, data: gpsData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '获取行程GPS数据失败' });
  }
}

module.exports = {
  uploadGpsData,
  uploadGpsBatch,
  getGpsData,
  getGpsDataByTrip
};
