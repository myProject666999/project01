const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

let pool;

async function initDb() {
  try {
    pool = mysql.createPool({
      host: '127.0.0.1',
      port: 3306,
      user: 'root',
      password: '123456',
      database: 'traceability',
      charset: 'utf8mb4',
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0
    });
    
    const [rows] = await pool.execute('SELECT 1 as test');
    console.log('✅ 数据库连接成功:', rows[0]);
    return true;
  } catch (err) {
    console.error('❌ 数据库连接失败:', err.message);
    return false;
  }
}

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API运行正常' });
});

app.get('/api/materials', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT mb.id, mb.batch_no, mb.quantity, mb.production_date,
             m.name as material_name, s.name as supplier_name
      FROM material_batches mb
      LEFT JOIN materials m ON mb.material_id = m.id
      LEFT JOIN suppliers s ON mb.supplier_id = s.id
      ORDER BY mb.created_at DESC
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('查询错误:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT pb.id, pb.batch_no, pb.quantity, pb.production_date,
             p.name as product_name
      FROM product_batches pb
      LEFT JOIN products p ON pb.product_id = p.id
      ORDER BY pb.created_at DESC
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('查询错误:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    const [mCount] = await pool.execute('SELECT COUNT(*) as count FROM material_batches');
    const [pCount] = await pool.execute('SELECT COUNT(*) as count FROM product_batches');
    const [wCount] = await pool.execute('SELECT COUNT(*) as count FROM work_orders');
    const [dCount] = await pool.execute('SELECT COUNT(*) as count FROM distributors');
    
    res.json({
      success: true,
      data: {
        materialBatches: mCount[0].count,
        productBatches: pCount[0].count,
        workOrders: wCount[0].count,
        distributors: dCount[0].count
      }
    });
  } catch (err) {
    console.error('查询错误:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

async function start() {
  const dbOk = await initDb();
  if (!dbOk) {
    console.log('数据库连接失败，退出');
    process.exit(1);
  }
  
  app.listen(PORT, () => {
    console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
  }).on('error', (err) => {
    console.error('启动错误:', err);
  });
}

process.on('uncaughtException', (err) => {
  console.error('未捕获异常:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理Promise拒绝:', reason);
});

start();
