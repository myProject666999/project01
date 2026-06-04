const appealModel = require('../models/appealModel');

async function createAppeal(req, res) {
  try {
    const appealData = req.body;
    const id = await appealModel.createAppeal(appealData);
    res.json({ success: true, data: { id } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '创建申诉失败' });
  }
}

async function getAppeal(req, res) {
  try {
    const { id } = req.params;
    const appeal = await appealModel.getAppealById(id);
    if (!appeal) {
      return res.status(404).json({ success: false, message: '申诉不存在' });
    }
    res.json({ success: true, data: appeal });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '获取申诉失败' });
  }
}

async function getDriverAppeals(req, res) {
  try {
    const { driverId } = req.params;
    const { status } = req.query;
    
    const appeals = await appealModel.getAppealsByDriver(driverId, status);
    res.json({ success: true, data: appeals });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '获取申诉列表失败' });
  }
}

async function getAllAppeals(req, res) {
  try {
    const { status } = req.query;
    const appeals = await appealModel.getAllAppeals(status);
    res.json({ success: true, data: appeals });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '获取申诉列表失败' });
  }
}

async function handleAppeal(req, res) {
  try {
    const { id } = req.params;
    const { handler, handleRemark, status } = req.body;
    
    const success = await appealModel.handleAppeal(id, handler, handleRemark, status);
    if (!success) {
      return res.status(404).json({ success: false, message: '申诉不存在' });
    }
    
    res.json({ success: true, message: '处理成功' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '处理失败' });
  }
}

async function getPendingCount(req, res) {
  try {
    const count = await appealModel.getPendingAppealsCount();
    res.json({ success: true, data: { count } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '获取待处理数量失败' });
  }
}

module.exports = {
  createAppeal,
  getAppeal,
  getDriverAppeals,
  getAllAppeals,
  handleAppeal,
  getPendingCount
};
