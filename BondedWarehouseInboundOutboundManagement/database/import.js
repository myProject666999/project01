const fs = require('fs');
const mysql = require('mysql2/promise');

async function importDatabase() {
  try {
    console.log('正在连接MySQL服务器...');
    
    const connection = await mysql.createConnection({
      host: '127.0.0.1',
      port: 3306,
      user: 'root',
      password: '123456',
      multipleStatements: true
    });
    
    console.log('MySQL连接成功！');
    
    const sql = fs.readFileSync('./database/init.sql', 'utf8');
    
    console.log('正在执行SQL脚本...');
    await connection.query(sql);
    
    console.log('数据库导入成功！');
    console.log('数据库名称: bonded_warehouse');
    
    await connection.end();
    console.log('连接已关闭。');
    
  } catch (error) {
    console.error('导入失败:', error.message);
    process.exit(1);
  }
}

importDatabase();
