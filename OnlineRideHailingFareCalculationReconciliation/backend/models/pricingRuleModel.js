const pool = require('../config/database');

async function getActivePricingRule() {
  const [rows] = await pool.query(
    'SELECT * FROM pricing_rules WHERE is_active = 1 LIMIT 1'
  );
  return rows[0] || null;
}

async function getAllPricingRules() {
  const [rows] = await pool.query('SELECT * FROM pricing_rules ORDER BY created_at DESC');
  return rows;
}

async function createPricingRule(ruleData) {
  const [result] = await pool.query(
    `INSERT INTO pricing_rules 
     (rule_name, base_fare, base_km, per_km_fare, free_wait_minutes, 
      per_minute_wait_fare, night_surcharge_rate, night_start_hour, night_end_hour, is_active) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      ruleData.rule_name,
      ruleData.base_fare,
      ruleData.base_km,
      ruleData.per_km_fare,
      ruleData.free_wait_minutes,
      ruleData.per_minute_wait_fare,
      ruleData.night_surcharge_rate,
      ruleData.night_start_hour,
      ruleData.night_end_hour,
      ruleData.is_active || 0
    ]
  );
  return result.insertId;
}

async function updatePricingRule(id, ruleData) {
  const [result] = await pool.query(
    `UPDATE pricing_rules SET 
     rule_name = ?, base_fare = ?, base_km = ?, per_km_fare = ?, 
     free_wait_minutes = ?, per_minute_wait_fare = ?, night_surcharge_rate = ?, 
     night_start_hour = ?, night_end_hour = ? 
     WHERE id = ?`,
    [
      ruleData.rule_name,
      ruleData.base_fare,
      ruleData.base_km,
      ruleData.per_km_fare,
      ruleData.free_wait_minutes,
      ruleData.per_minute_wait_fare,
      ruleData.night_surcharge_rate,
      ruleData.night_start_hour,
      ruleData.night_end_hour,
      id
    ]
  );
  return result.affectedRows > 0;
}

async function setActiveRule(id) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('UPDATE pricing_rules SET is_active = 0');
    await conn.query('UPDATE pricing_rules SET is_active = 1 WHERE id = ?', [id]);
    await conn.commit();
    return true;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

module.exports = {
  getActivePricingRule,
  getAllPricingRules,
  createPricingRule,
  updatePricingRule,
  setActiveRule
};
