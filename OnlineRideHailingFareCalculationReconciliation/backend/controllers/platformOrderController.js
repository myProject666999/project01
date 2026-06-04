const fs = require('fs');
const csv = require('csv-parser');
const platformOrderModel = require('../models/platformOrderModel');
const pool = require('../config/database');

function generateBatchNo() {
  const date = new Date();
  return 'BATCH' + date.getFullYear() +
    String(date.getMonth() + 1).padStart(2, '0') +
    String(date.getDate()).padStart(2, '0') +
    String(date.getHours()).padStart(2, '0') +
    String(date.getMinutes()).padStart(2, '0');
}

async function importOrdersFromCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    const batch = generateBatchNo();
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push({ ...data, import_batch: batch }))
      .on('end', async () => {
        try {
          for (const order of results) {
            const [drivers] = await pool.query(
              'SELECT id FROM drivers WHERE driver_name = ? OR phone = ?',
              [order.driver_name || '', order.driver_phone || '']
            );
            const driverId = drivers.length > 0 ? drivers[0].id : null;
            
            await platformOrderModel.createPlatformOrder({
              order_no: order.order_no,
              platform_name: order.platform_name || '未知平台',
              driver_id: driverId,
              driver_name: order.driver_name,
              vehicle_plate: order.vehicle_plate,
              start_time: order.start_time,
              end_time: order.end_time,
              start_address: order.start_address,
              end_address: order.end_address,
              distance: parseFloat(order.distance) || 0,
              duration: parseInt(order.duration) || 0,
              total_amount: parseFloat(order.total_amount) || 0,
              driver_amount: parseFloat(order.driver_amount) || 0,
              import_batch: batch
            });
          }
          
          resolve({ count: results.length, batch });
        } catch (err) {
          reject(err);
        }
      })
      .on('error', reject);
  });
}

async function importOrders(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: '请上传CSV文件' });
    }
    
    const result = await importOrdersFromCSV(req.file.path);
    fs.unlinkSync(req.file.path);
    
    res.json({ success: true, data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '导入订单失败' });
  }
}

async function getOrders(req, res) {
  try {
    const { driverId, date, batch, unmatched } = req.query;
    
    let orders;
    if (unmatched === 'true') {
      orders = await platformOrderModel.getUnmatchedOrders();
    } else if (driverId && date) {
      orders = await platformOrderModel.getPlatformOrdersByDriverAndDate(driverId, date);
    } else if (batch) {
      orders = await platformOrderModel.getOrdersByImportBatch(batch);
    } else {
      return res.status(400).json({ success: false, message: '参数不完整' });
    }
    
    res.json({ success: true, data: orders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '获取订单列表失败' });
  }
}

async function getOrder(req, res) {
  try {
    const { id } = req.params;
    const order = await platformOrderModel.getPlatformOrderById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: '订单不存在' });
    }
    res.json({ success: true, data: order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '获取订单详情失败' });
  }
}

async function matchOrder(req, res) {
  try {
    const { id } = req.params;
    const { tripId } = req.body;
    
    const success = await platformOrderModel.matchOrderToTrip(id, tripId);
    if (!success) {
      return res.status(404).json({ success: false, message: '订单不存在' });
    }
    
    res.json({ success: true, message: '匹配成功' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '匹配失败' });
  }
}

async function autoMatch(req, res) {
  try {
    const { driverId, date } = req.body;
    
    const matchedCount = await platformOrderModel.autoMatchOrders(driverId, date);
    
    res.json({ success: true, data: { matchedCount } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '自动匹配失败' });
  }
}

async function createOrderApi(req, res) {
  try {
    const orderData = req.body;
    
    const [drivers] = await pool.query(
      'SELECT id FROM drivers WHERE driver_name = ? OR phone = ?',
      [orderData.driver_name || '', orderData.driver_phone || '']
    );
    orderData.driver_id = drivers.length > 0 ? drivers[0].id : null;
    orderData.import_batch = 'API' + Date.now();
    
    const id = await platformOrderModel.createPlatformOrder(orderData);
    
    res.json({ success: true, data: { id } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '创建订单失败' });
  }
}

module.exports = {
  importOrders,
  getOrders,
  getOrder,
  matchOrder,
  autoMatch,
  createOrderApi
};
