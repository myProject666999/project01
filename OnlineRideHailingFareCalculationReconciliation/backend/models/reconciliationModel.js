const pool = require('../config/database');

function generateReconciliationNo() {
  const date = new Date();
  const prefix = 'REC' + date.getFullYear() +
    String(date.getMonth() + 1).padStart(2, '0') +
    String(date.getDate()).padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return prefix + random;
}

async function createReconciliation(driverId, date) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const recNo = generateReconciliationNo();

    const [orders] = await conn.query(
      `SELECT po.*, t.total_distance as local_distance, t.calculated_fare as local_fare,
              t.id as trip_id, t.trip_no
       FROM platform_orders po
       LEFT JOIN trips t ON po.matched_trip_id = t.id
       WHERE po.driver_id = ? AND DATE(po.start_time) = ?
       ORDER BY po.start_time`,
      [driverId, date]
    );

    let totalOrders = 0;
    let matchedOrders = 0;
    let diffOrders = 0;
    let platformTotal = 0;
    let localTotal = 0;

    const [existing] = await conn.query(
      'SELECT id FROM reconciliations WHERE driver_id = ? AND reconciliation_date = ?',
      [driverId, date]
    );

    let reconciliationId;
    if (existing.length > 0) {
      reconciliationId = existing[0].id;
      await conn.query('DELETE FROM reconciliation_details WHERE reconciliation_id = ?', [reconciliationId]);
    } else {
      const [recResult] = await conn.query(
        'INSERT INTO reconciliations (reconciliation_no, driver_id, reconciliation_date, status) VALUES (?, ?, ?, 0)',
        [recNo, driverId, date]
      );
      reconciliationId = recResult.insertId;
    }

    for (const order of orders) {
      totalOrders++;
      
      const platformAmount = parseFloat(order.driver_amount) || 0;
      const localAmount = parseFloat(order.local_fare) || 0;
      const platformDistance = parseFloat(order.distance) || 0;
      const localDistance = parseFloat(order.local_distance) || 0;
      
      const amountDiff = Math.abs(platformAmount - localAmount);
      const distanceDiff = Math.abs(platformDistance - localDistance);
      
      const isAmountDiff = amountDiff > 0.1;
      const isDistanceDiff = distanceDiff > 0.1;
      const isDiff = isAmountDiff || isDistanceDiff;
      
      let diffType = '';
      if (isAmountDiff && isDistanceDiff) {
        diffType = '金额和里程差异';
      } else if (isAmountDiff) {
        diffType = '金额差异';
      } else if (isDistanceDiff) {
        diffType = '里程差异';
      }

      if (order.matched_trip_id) {
        matchedOrders++;
      }
      if (isDiff) {
        diffOrders++;
      }

      platformTotal += platformAmount;
      localTotal += localAmount;

      await conn.query(
        `INSERT INTO reconciliation_details 
         (reconciliation_id, platform_order_id, trip_id, order_no, 
          platform_amount, local_amount, amount_diff, 
          platform_distance, local_distance, distance_diff, is_diff, diff_type) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          reconciliationId,
          order.id,
          order.trip_id,
          order.order_no,
          platformAmount,
          localAmount,
          Math.round(amountDiff * 100) / 100,
          platformDistance,
          localDistance,
          Math.round(distanceDiff * 100) / 100,
          isDiff ? 1 : 0,
          diffType
        ]
      );

      if (isDiff) {
        await conn.query(
          'UPDATE platform_orders SET status = 2 WHERE id = ?',
          [order.id]
        );
      }
    }

    await conn.query(
      `UPDATE reconciliations SET 
       total_orders = ?, matched_orders = ?, diff_orders = ?,
       platform_total_amount = ?, local_total_amount = ?, total_amount_diff = ?
       WHERE id = ?`,
      [
        totalOrders,
        matchedOrders,
        diffOrders,
        Math.round(platformTotal * 100) / 100,
        Math.round(localTotal * 100) / 100,
        Math.round(Math.abs(platformTotal - localTotal) * 100) / 100,
        reconciliationId
      ]
    );

    await conn.commit();

    return { reconciliationId, totalOrders, matchedOrders, diffOrders };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function getReconciliationByDriverAndDate(driverId, date) {
  const [rows] = await pool.query(
    'SELECT * FROM reconciliations WHERE driver_id = ? AND reconciliation_date = ?',
    [driverId, date]
  );
  return rows[0] || null;
}

async function getReconciliationDetails(reconciliationId) {
  const [rows] = await pool.query(
    `SELECT rd.*, po.start_time, po.end_time, po.platform_name,
            po.start_address, po.end_address
     FROM reconciliation_details rd
     LEFT JOIN platform_orders po ON rd.platform_order_id = po.id
     WHERE rd.reconciliation_id = ?
     ORDER BY po.start_time`,
    [reconciliationId]
  );
  return rows;
}

async function getReconciliationsByDateRange(startDate, endDate) {
  const [rows] = await pool.query(
    `SELECT r.*, d.driver_name 
     FROM reconciliations r 
     LEFT JOIN drivers d ON r.driver_id = d.id 
     WHERE r.reconciliation_date BETWEEN ? AND ? 
     ORDER BY r.reconciliation_date DESC`,
    [startDate, endDate]
  );
  return rows;
}

async function confirmReconciliation(reconciliationId) {
  const [result] = await pool.query(
    'UPDATE reconciliations SET status = 1 WHERE id = ?',
    [reconciliationId]
  );
  return result.affectedRows > 0;
}

async function getDriverDailyReport(driverId, date) {
  const reconciliation = await getReconciliationByDriverAndDate(driverId, date);
  if (!reconciliation) {
    return null;
  }

  const details = await getReconciliationDetails(reconciliation.id);

  return {
    reconciliation,
    details
  };
}

module.exports = {
  createReconciliation,
  getReconciliationByDriverAndDate,
  getReconciliationDetails,
  getReconciliationsByDateRange,
  confirmReconciliation,
  getDriverDailyReport
};
