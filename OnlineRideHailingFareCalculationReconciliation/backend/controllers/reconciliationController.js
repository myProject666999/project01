const reconciliationModel = require('../models/reconciliationModel');

async function createReconciliation(req, res) {
  try {
    const { driverId, date } = req.body;
    
    const result = await reconciliationModel.createReconciliation(driverId, date);
    
    res.json({ success: true, data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '生成对账失败' });
  }
}

async function getReconciliation(req, res) {
  try {
    const { driverId, date } = req.query;
    
    const reconciliation = await reconciliationModel.getReconciliationByDriverAndDate(driverId, date);
    
    if (!reconciliation) {
      return res.status(404).json({ success: false, message: '对账记录不存在' });
    }
    
    const details = await reconciliationModel.getReconciliationDetails(reconciliation.id);
    
    res.json({ success: true, data: { reconciliation, details } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '获取对账信息失败' });
  }
}

async function getReconciliationDetails(req, res) {
  try {
    const { id } = req.params;
    
    const details = await reconciliationModel.getReconciliationDetails(id);
    
    res.json({ success: true, data: details });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '获取对账详情失败' });
  }
}

async function getReconciliations(req, res) {
  try {
    const { startDate, endDate } = req.query;
    
    const reconciliations = await reconciliationModel.getReconciliationsByDateRange(startDate, endDate);
    
    res.json({ success: true, data: reconciliations });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '获取对账列表失败' });
  }
}

async function confirmReconciliation(req, res) {
  try {
    const { id } = req.params;
    
    const success = await reconciliationModel.confirmReconciliation(id);
    
    if (!success) {
      return res.status(404).json({ success: false, message: '对账记录不存在' });
    }
    
    res.json({ success: true, message: '确认成功' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '确认失败' });
  }
}

async function getDriverDailyReport(req, res) {
  try {
    const { driverId, date } = req.params;
    
    const report = await reconciliationModel.getDriverDailyReport(driverId, date);
    
    if (!report) {
      return res.status(404).json({ success: false, message: '日报表不存在' });
    }
    
    res.json({ success: true, data: report });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '获取日报表失败' });
  }
}

module.exports = {
  createReconciliation,
  getReconciliation,
  getReconciliationDetails,
  getReconciliations,
  confirmReconciliation,
  getDriverDailyReport
};
