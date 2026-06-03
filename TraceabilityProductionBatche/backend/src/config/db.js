const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: '123456',
  database: 'traceability',
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

pool.execute('SELECT 1 as test')
  .then(() => console.log('✅ 数据库连接池初始化成功'))
  .catch(err => console.error('❌ 数据库连接失败:', err.message));

module.exports = pool;
