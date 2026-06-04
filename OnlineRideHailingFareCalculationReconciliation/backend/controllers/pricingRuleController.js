const pricingRuleModel = require('../models/pricingRuleModel');
const { calculateFare } = require('../utils/fareCalculator');

async function getActiveRule(req, res) {
  try {
    const rule = await pricingRuleModel.getActivePricingRule();
    res.json({ success: true, data: rule });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '获取计价规则失败' });
  }
}

async function getAllRules(req, res) {
  try {
    const rules = await pricingRuleModel.getAllPricingRules();
    res.json({ success: true, data: rules });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '获取计价规则列表失败' });
  }
}

async function createRule(req, res) {
  try {
    const ruleData = req.body;
    const id = await pricingRuleModel.createPricingRule(ruleData);
    res.json({ success: true, data: { id } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '创建计价规则失败' });
  }
}

async function updateRule(req, res) {
  try {
    const { id } = req.params;
    const ruleData = req.body;
    
    const success = await pricingRuleModel.updatePricingRule(id, ruleData);
    if (!success) {
      return res.status(404).json({ success: false, message: '计价规则不存在' });
    }
    
    res.json({ success: true, message: '更新成功' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '更新计价规则失败' });
  }
}

async function setActiveRule(req, res) {
  try {
    const { id } = req.params;
    
    const success = await pricingRuleModel.setActiveRule(id);
    if (!success) {
      return res.status(404).json({ success: false, message: '计价规则不存在' });
    }
    
    res.json({ success: true, message: '设置成功' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '设置失败' });
  }
}

async function calculateTestFare(req, res) {
  try {
    const { distance, waitMinutes, startTime } = req.body;
    
    const rule = await pricingRuleModel.getActivePricingRule();
    const fare = calculateFare(distance, waitMinutes, startTime, rule);
    
    res.json({ success: true, data: { fare } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '计算失败' });
  }
}

module.exports = {
  getActiveRule,
  getAllRules,
  createRule,
  updateRule,
  setActiveRule,
  calculateTestFare
};
