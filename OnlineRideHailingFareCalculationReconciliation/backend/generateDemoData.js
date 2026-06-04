const pool = require('./config/database');

function generateTripNo() {
  const date = new Date();
  const prefix = 'TRIP' + date.getFullYear() +
    String(date.getMonth() + 1).padStart(2, '0') +
    String(date.getDate()).padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return prefix + random;
}

function generateGpsPoints(startLat, startLng, endLat, endLng, count) {
  const points = [];
  for (let i = 0; i < count; i++) {
    const ratio = i / (count - 1);
    points.push({
      latitude: startLat + (endLat - startLat) * ratio + (Math.random() - 0.5) * 0.001,
      longitude: startLng + (endLng - startLng) * ratio + (Math.random() - 0.5) * 0.001,
      speed: Math.random() * 40 + 20
    });
  }
  return points;
}

async function generateDemoData() {
  try {
    console.log('开始生成演示数据...');

    const baseDate = '2024-06-04';
    const driverId = 1;
    const vehicleId = 1;
    const gpsDeviceId = 'GPS001';

    const trips = [
      { start: '08:30:00', end: '08:50:00', startLat: 39.9978, startLng: 116.4782, endLat: 39.9186, endLng: 116.4603, distance: 8.5, duration: 1200 },
      { start: '09:15:00', end: '09:35:00', startLat: 39.9186, startLng: 116.4603, endLat: 39.9139, endLng: 116.4103, distance: 5.2, duration: 1200 },
      { start: '10:00:00', end: '10:25:00', startLat: 39.9139, startLng: 116.4103, endLat: 39.9842, endLng: 116.3161, distance: 12.3, duration: 1500 },
      { start: '14:00:00', end: '14:30:00', startLat: 39.9842, startLng: 116.3161, endLat: 39.9406, endLng: 116.3453, distance: 6.8, duration: 1800 },
      { start: '15:20:00', end: '15:45:00', startLat: 39.9406, startLng: 116.3453, endLat: 39.8651, endLng: 116.3783, distance: 10.5, duration: 1500 },
      { start: '16:30:00', end: '16:55:00', startLat: 39.8651, startLng: 116.3783, endLat: 39.9342, endLng: 116.4517, distance: 8.2, duration: 1500 },
      { start: '17:30:00', end: '17:55:00', startLat: 39.9342, startLng: 116.4517, endLat: 39.9978, endLng: 116.4782, distance: 5.6, duration: 1500 },
      { start: '18:30:00', end: '18:50:00', startLat: 39.9978, startLng: 116.4782, endLat: 39.9823, endLng: 116.4935, distance: 4.2, duration: 1200 },
      { start: '19:15:00', end: '19:40:00', startLat: 39.9823, startLng: 116.4935, endLat: 39.9417, endLng: 116.4341, distance: 7.5, duration: 1500 },
      { start: '20:10:00', end: '20:35:00', startLat: 39.9417, startLng: 116.4341, endLat: 39.9186, endLng: 116.4603, distance: 6.3, duration: 1500 },
      { start: '21:00:00', end: '21:20:00', startLat: 39.9186, startLng: 116.4603, endLat: 39.9012, endLng: 116.4812, distance: 3.8, duration: 1200 },
      { start: '23:15:00', end: '23:45:00', startLat: 39.9012, startLng: 116.4812, endLat: 40.0799, endLng: 116.6031, distance: 25.6, duration: 1800 }
    ];

    const pricingRule = {
      base_fare: 14.00,
      base_km: 3.00,
      per_km_fare: 2.50,
      free_wait_minutes: 5,
      per_minute_wait_fare: 0.50,
      night_surcharge_rate: 0.30,
      night_start_hour: 23,
      night_end_hour: 5
    };

    for (let i = 0; i < trips.length; i++) {
      const trip = trips[i];
      const tripNo = generateTripNo();
      const startTime = `${baseDate} ${trip.start}`;
      const endTime = `${baseDate} ${trip.end}`;
      
      const startHour = parseInt(trip.start.split(':')[0]);
      const isNightTime = startHour >= pricingRule.night_start_hour || startHour < pricingRule.night_end_hour;
      
      let fare = pricingRule.base_fare;
      if (trip.distance > pricingRule.base_km) {
        fare += (trip.distance - pricingRule.base_km) * pricingRule.per_km_fare;
      }
      if (isNightTime) {
        fare = fare * (1 + pricingRule.night_surcharge_rate);
      }
      fare = Math.round(fare * 100) / 100;

      const [tripResult] = await pool.query(
        `INSERT INTO trips (trip_no, vehicle_id, driver_id, start_time, end_time, 
          start_latitude, start_longitude, end_latitude, end_longitude,
          total_distance, total_duration, wait_duration, calculated_fare, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [tripNo, vehicleId, driverId, startTime, endTime,
          trip.startLat, trip.startLng, trip.endLat, trip.endLng,
          trip.distance, trip.duration, 120, fare]
      );

      const tripId = tripResult.insertId;
      
      const gpsPoints = generateGpsPoints(
        trip.startLat, trip.startLng,
        trip.endLat, trip.endLng,
        Math.floor(trip.duration)
      );

      const gpsValues = gpsPoints.map((point, idx) => {
        const pointTime = new Date(startTime);
        pointTime.setSeconds(pointTime.getSeconds() + idx);
        return [gpsDeviceId, point.latitude, point.longitude, point.speed, pointTime];
      });

      await pool.query(
        'INSERT INTO gps_data (gps_device_id, latitude, longitude, speed, gps_time) VALUES ?',
        [gpsValues]
      );

      console.log(`生成行程 ${i + 1}/${trips.length}: ${tripNo}, 金额: ¥${fare}`);
    }

    const platformOrders = [
      { order_no: 'DD202406040001', platform_name: '滴滴出行', driver_name: '张三', vehicle_plate: '京B12345', start_time: `${baseDate} 08:30:00`, end_time: `${baseDate} 08:50:00`, start_address: '朝阳区望京SOHO', end_address: '朝阳区国贸中心', distance: 8.5, duration: 1200, total_amount: 35.00, driver_amount: 28.00 },
      { order_no: 'DD202406040002', platform_name: '滴滴出行', driver_name: '张三', vehicle_plate: '京B12345', start_time: `${baseDate} 09:15:00`, end_time: `${baseDate} 09:35:00`, start_address: '朝阳区国贸中心', end_address: '东城区王府井', distance: 5.2, duration: 1200, total_amount: 22.00, driver_amount: 17.60 },
      { order_no: 'DD202406040003', platform_name: '滴滴出行', driver_name: '张三', vehicle_plate: '京B12345', start_time: `${baseDate} 10:00:00`, end_time: `${baseDate} 10:25:00`, start_address: '东城区王府井', end_address: '海淀区中关村', distance: 12.3, duration: 1500, total_amount: 48.00, driver_amount: 38.40 },
      { order_no: 'DD202406040004', platform_name: '滴滴出行', driver_name: '张三', vehicle_plate: '京B12345', start_time: `${baseDate} 14:00:00`, end_time: `${baseDate} 14:30:00`, start_address: '海淀区中关村', end_address: '西直门地铁站', distance: 6.8, duration: 1800, total_amount: 28.00, driver_amount: 22.40 },
      { order_no: 'DD202406040005', platform_name: '滴滴出行', driver_name: '张三', vehicle_plate: '京B12345', start_time: `${baseDate} 15:20:00`, end_time: `${baseDate} 15:45:00`, start_address: '西直门地铁站', end_address: '北京南站', distance: 10.5, duration: 1500, total_amount: 42.00, driver_amount: 33.60 },
      { order_no: 'DD202406040006', platform_name: '滴滴出行', driver_name: '张三', vehicle_plate: '京B12345', start_time: `${baseDate} 16:30:00`, end_time: `${baseDate} 16:55:00`, start_address: '北京南站', end_address: '朝阳区三里屯', distance: 8.2, duration: 1500, total_amount: 34.00, driver_amount: 27.20 },
      { order_no: 'DD202406040007', platform_name: '滴滴出行', driver_name: '张三', vehicle_plate: '京B12345', start_time: `${baseDate} 17:30:00`, end_time: `${baseDate} 17:55:00`, start_address: '朝阳区三里屯', end_address: '朝阳区望京', distance: 5.6, duration: 1500, total_amount: 24.00, driver_amount: 19.20 },
      { order_no: 'DD202406040008', platform_name: '滴滴出行', driver_name: '张三', vehicle_plate: '京B12345', start_time: `${baseDate} 18:30:00`, end_time: `${baseDate} 18:50:00`, start_address: '朝阳区望京', end_address: '朝阳区酒仙桥', distance: 4.2, duration: 1200, total_amount: 19.00, driver_amount: 15.20 },
      { order_no: 'DD202406040009', platform_name: '滴滴出行', driver_name: '张三', vehicle_plate: '京B12345', start_time: `${baseDate} 19:15:00`, end_time: `${baseDate} 19:40:00`, start_address: '朝阳区酒仙桥', end_address: '东直门', distance: 7.5, duration: 1500, total_amount: 31.00, driver_amount: 24.80 },
      { order_no: 'DD202406040010', platform_name: '滴滴出行', driver_name: '张三', vehicle_plate: '京B12345', start_time: `${baseDate} 20:10:00`, end_time: `${baseDate} 20:35:00`, start_address: '东直门', end_address: '朝阳区国贸', distance: 6.3, duration: 1500, total_amount: 26.00, driver_amount: 20.80 },
      { order_no: 'DD202406040011', platform_name: '滴滴出行', driver_name: '张三', vehicle_plate: '京B12345', start_time: `${baseDate} 21:00:00`, end_time: `${baseDate} 21:20:00`, start_address: '朝阳区国贸', end_address: '朝阳区双井', distance: 3.8, duration: 1200, total_amount: 16.00, driver_amount: 12.80 },
      { order_no: 'DD202406040012', platform_name: '滴滴出行', driver_name: '张三', vehicle_plate: '京B12345', start_time: `${baseDate} 23:15:00`, end_time: `${baseDate} 23:45:00`, start_address: '朝阳区双井', end_address: '首都机场T3', distance: 25.6, duration: 1800, total_amount: 120.00, driver_amount: 96.00 }
    ];

    for (let i = 0; i < platformOrders.length; i++) {
      const order = platformOrders[i];
      await pool.query(
        `INSERT INTO platform_orders 
         (order_no, platform_name, driver_id, driver_name, vehicle_plate, 
          start_time, end_time, start_address, end_address, 
          distance, duration, total_amount, driver_amount, status, import_batch, matched_trip_id) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [order.order_no, order.platform_name, driverId, order.driver_name, order.vehicle_plate,
          order.start_time, order.end_time, order.start_address, order.end_address,
          order.distance, order.duration, order.total_amount, order.driver_amount,
          1, 'DEMO20240604', i + 1]
      );
      console.log(`生成平台订单 ${i + 1}/${platformOrders.length}: ${order.order_no}`);
    }

    console.log('');
    console.log('演示数据生成完成！');
    console.log('生成了 12 条行程记录和对应的 GPS 数据');
    console.log('生成了 12 条平台订单记录（已自动匹配）');
    console.log('');
    console.log('下一步操作：');
    console.log('1. 启动后端: cd backend && npm start');
    console.log('2. 启动前端: cd frontend && npm run dev');
    console.log('3. 访问 http://localhost:5173');
    console.log('4. 在管理端 -> 对账管理 中生成对账');
    console.log('5. 在司机端 -> 流水清单 中查看对账结果');

    process.exit(0);
  } catch (error) {
    console.error('生成演示数据失败:', error);
    process.exit(1);
  }
}

generateDemoData();
