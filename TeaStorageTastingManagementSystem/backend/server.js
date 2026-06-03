const express = require('express');
const cors = require('cors');
require('dotenv').config();

const sequelize = require('./config/database');
const mqttSimulator = require('./services/mqttSimulator');
const setupAssociations = require('./models/associations');

const teaProductsRouter = require('./routes/teaProducts');
const storageLocationsRouter = require('./routes/storageLocations');
const inventoryRouter = require('./routes/inventory');
const environmentRecordsRouter = require('./routes/environmentRecords');
const tastingNotesRouter = require('./routes/tastingNotes');

const app = express();
const PORT = process.env.SERVER_PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.get('/api/health', (req, res) => {
  console.log('健康检查接口被调用');
  res.json({ success: true, message: '茶叶仓储与品鉴管理系统 API 运行正常', timestamp: new Date().toISOString() });
});

app.use('/api/tea-products', teaProductsRouter);
app.use('/api/storage-locations', storageLocationsRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/environment-records', environmentRecordsRouter);
app.use('/api/tasting-notes', tastingNotesRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: '服务器内部错误', error: err.message });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: '接口不存在' });
});

const startServer = async () => {
  try {
    setupAssociations();
    console.log('模型关联配置完成');
    
    await sequelize.sync({ alter: false });
    console.log('数据库模型同步完成');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`服务器运行在 http://0.0.0.0:${PORT}`);
      console.log(`健康检查: http://127.0.0.1:${PORT}/api/health`);
    });

    mqttSimulator.start();
  } catch (error) {
    console.error('服务器启动失败:', error);
    process.exit(1);
  }
};

startServer();

process.on('SIGTERM', () => {
  console.log('收到SIGTERM信号，正在关闭服务器...');
  mqttSimulator.stop();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('收到SIGINT信号，正在关闭服务器...');
  mqttSimulator.stop();
  process.exit(0);
});
