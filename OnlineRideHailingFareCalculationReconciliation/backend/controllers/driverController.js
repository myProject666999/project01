const driverModel = require('../models/driverModel');

async function getDrivers(req, res) {
  try {
    const drivers = await driverModel.getAllDrivers();
    res.json({ success: true, data: drivers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '获取司机列表失败' });
  }
}

async function getDriver(req, res) {
  try {
    const { id } = req.params;
    const driver = await driverModel.getDriverById(id);
    if (!driver) {
      return res.status(404).json({ success: false, message: '司机不存在' });
    }
    res.json({ success: true, data: driver });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '获取司机信息失败' });
  }
}

async function createDriver(req, res) {
  try {
    const driverData = req.body;
    const id = await driverModel.createDriver(driverData);
    res.json({ success: true, data: { id } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '创建司机失败' });
  }
}

async function updateDriver(req, res) {
  try {
    const { id } = req.params;
    const driverData = req.body;
    const success = await driverModel.updateDriver(id, driverData);
    if (!success) {
      return res.status(404).json({ success: false, message: '司机不存在' });
    }
    res.json({ success: true, message: '更新成功' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '更新司机失败' });
  }
}

async function deleteDriver(req, res) {
  try {
    const { id } = req.params;
    const success = await driverModel.deleteDriver(id);
    if (!success) {
      return res.status(404).json({ success: false, message: '司机不存在' });
    }
    res.json({ success: true, message: '删除成功' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '删除司机失败' });
  }
}

module.exports = {
  getDrivers,
  getDriver,
  createDriver,
  updateDriver,
  deleteDriver
};
