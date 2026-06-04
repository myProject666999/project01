const mysql = require('mysql2/promise');
const fs = require('fs');

async function importDatabase() {
  try {
    const sql = fs.readFileSync('./schema.sql', 'utf8');
    
    const connection = await mysql.createConnection({
      host: '127.0.0.1',
      port: 3306,
      user: 'root',
      password: '123456',
      multipleStatements: true
    });
    
    console.log('正在导入数据库...');
    await connection.query(sql);
    console.log('数据库导入成功！');
    
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('数据库导入失败:', error.message);
    process.exit(1);
  }
}

importDatabase();
