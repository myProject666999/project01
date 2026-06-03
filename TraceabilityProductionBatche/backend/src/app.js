const express = require('express');
const cors = require('cors');
const path = require('path');
require('./config/db');

const traceRoutes = require('./routes/trace');
const basicRoutes = require('./routes/basic');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

app.use('/api/trace', traceRoutes);
app.use('/api', basicRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '食品厂生产批次溯源系统API运行正常' });
});

app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({ error: err.message });
});

app.use(express.static(path.join(__dirname, '../public')));

const server = app.listen(PORT, () => {
  console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
}).on('error', (err) => {
  console.error('启动错误:', err);
});

process.on('uncaughtException', (err) => {
  console.error('未捕获的异常:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason);
});

process.on('SIGTERM', () => {
  console.log('收到SIGTERM，优雅关闭');
  server.close(() => {
    console.log('服务器已关闭');
    process.exit(0);
  });
});

module.exports = server;
