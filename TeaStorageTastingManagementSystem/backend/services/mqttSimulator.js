const mqtt = require('mqtt');
const StorageLocation = require('../models/StorageLocation');
const EnvironmentRecord = require('../models/EnvironmentRecord');
const Alert = require('../models/Alert');

const HUMIDITY_THRESHOLD = process.env.HUMIDITY_THRESHOLD || 75;

class MqttSimulator {
  constructor() {
    this.client = null;
    this.isRunning = false;
    this.intervalId = null;
  }

  start() {
    console.log('MQTT模拟器启动...');
    this.isRunning = true;
    
    this.client = mqtt.connect(process.env.MQTT_BROKER_URL, {
      reconnectPeriod: 1000,
      connectTimeout: 30 * 1000
    });

    this.client.on('connect', () => {
      console.log('MQTT客户端已连接（模拟）');
      this.client.subscribe('tea/storage/+/sensor/data', (err) => {
        if (!err) {
          console.log('已订阅传感器主题');
        }
      });
    });

    this.client.on('message', async (topic, message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('收到MQTT消息:', topic, data);
        await this.processSensorData(data);
      } catch (error) {
        console.error('处理MQTT消息失败:', error);
      }
    });

    this.client.on('error', (err) => {
      console.error('MQTT连接错误:', err.message);
      console.log('将继续以模拟模式运行...');
    });

    this.startSimulation();
  }

  startSimulation() {
    console.log('开始模拟传感器数据采集...');
    this.intervalId = setInterval(async () => {
      if (!this.isRunning) return;
      
      try {
        const locations = await StorageLocation.findAll({ where: { status: 'active' } });
        
        for (const location of locations) {
          const temperature = (20 + Math.random() * 8).toFixed(2);
          const humidity = (60 + Math.random() * 25).toFixed(2);
          
          const mockData = {
            location_id: location.id,
            location_code: location.location_code,
            temperature: parseFloat(temperature),
            humidity: parseFloat(humidity),
            timestamp: new Date().toISOString()
          };

          const topic = `tea/storage/${location.location_code}/sensor/data`;
          
          if (this.client.connected) {
            this.client.publish(topic, JSON.stringify(mockData));
          } else {
            await this.processSensorData(mockData);
          }
        }
      } catch (error) {
        console.error('模拟数据生成失败:', error);
      }
    }, 60000);
  }

  async processSensorData(data) {
    try {
      const { location_id, temperature, humidity } = data;
      const now = new Date();
      const recordDate = now.toISOString().split('T')[0];
      const recordTime = now.toTimeString().split(' ')[0];

      const existingRecord = await EnvironmentRecord.findOne({
        where: {
          location_id,
          record_date: recordDate
        }
      });

      if (existingRecord) {
        return;
      }

      const is_alert = humidity > HUMIDITY_THRESHOLD;
      const alert_type = is_alert ? 'humidity_high' : null;

      const record = await EnvironmentRecord.create({
        location_id,
        temperature,
        humidity,
        record_date: recordDate,
        record_time: recordTime,
        is_alert,
        alert_type
      });

      console.log(`已记录环境数据: 仓位${data.location_code}, 温度${temperature}°C, 湿度${humidity}%`);

      if (is_alert) {
        const location = await StorageLocation.findByPk(location_id);
        const alertLevel = humidity > HUMIDITY_THRESHOLD + 3 ? 'danger' : 'warning';
        
        const existingAlert = await Alert.findOne({
          where: {
            location_id,
            resolved: 0
          }
        });

        if (!existingAlert) {
          await Alert.create({
            location_id,
            alert_type: 'humidity_high',
            alert_level: alertLevel,
            message: `${location.location_code}仓位湿度过高，已达${humidity}%`,
            value: humidity,
            threshold: HUMIDITY_THRESHOLD
          });
          console.log(`触发警报: ${location.location_code} 湿度 ${humidity}%`);
        }
      }
    } catch (error) {
      console.error('处理传感器数据失败:', error);
    }
  }

  stop() {
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    if (this.client) {
      this.client.end();
    }
    console.log('MQTT模拟器已停止');
  }
}

module.exports = new MqttSimulator();
