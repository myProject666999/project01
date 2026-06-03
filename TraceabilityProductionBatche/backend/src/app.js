const express = require('express');
const cors = require('cors');
const path = require('path');

const traceRoutes = require('./routes/trace');
const basicRoutes = require('./routes/basic');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/trace', traceRoutes);
app.use('/api', basicRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '食品厂生产批次溯源系统API运行正常' });
});

app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({ error: err.message, stack: err.stack });
});

app.use(express.static(path.join(__dirname, '../public')));

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
}).on('error', (err) => {
  console.error('启动错误:', err);
});

process.on('uncaughtException', (err) => {
  console.error('未捕获的异常:', err);
});
