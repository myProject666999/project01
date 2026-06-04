const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./config/database');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

async function testDbConnection() {
  try {
    const [rows] = await db.query('SELECT 1');
    console.log('数据库连接成功');
  } catch (err) {
    console.error('数据库连接失败:', err.message);
  }
}
testDbConnection();

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '保税仓管理系统API运行正常' });
});

const productRoutes = require('./routes/products');
const locationRoutes = require('./routes/locations');
const inboundRoutes = require('./routes/inbound');
const orderRoutes = require('./routes/orders');
const waveRoutes = require('./routes/waves');
const reviewRoutes = require('./routes/review');
const outboundRoutes = require('./routes/outbound');
const inventoryRoutes = require('./routes/inventory');

app.use('/api/products', productRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/inbound', inboundRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/waves', waveRoutes);
app.use('/api/review', reviewRoutes);
app.use('/api/outbound', outboundRoutes);
app.use('/api/inventory', inventoryRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: '服务器内部错误' });
});

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
