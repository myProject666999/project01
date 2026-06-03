const pool = require('./src/config/db');

async function test() {
  try {
    const [rows] = await pool.execute('SELECT 1 as test');
    console.log('数据库连接成功:', rows);
    
    const [materials] = await pool.execute('SELECT * FROM material_batches LIMIT 3');
    console.log('原料批次:', materials);
    
    process.exit(0);
  } catch (err) {
    console.error('错误:', err);
    process.exit(1);
  }
}

test();
