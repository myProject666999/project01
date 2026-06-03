const mysql = require('mysql2/promise');
require('dotenv').config();

const verifyData = async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('=== 验证茶品数据 ===');
    const [rows] = await connection.query('SELECT id, product_name, origin, production_year FROM tea_products ORDER BY id');
    console.log(`共 ${rows.length} 条茶品记录:`);
    rows.forEach(row => {
      console.log(`  ID: ${row.id}, 名称: ${row.product_name}, 产区: ${row.origin}, 年份: ${row.production_year}`);
    });

    console.log('\n=== 验证最新环境记录 ===');
    const [envRows] = await connection.query('SELECT id, location_id, temperature, humidity, record_time, is_alert FROM environment_records ORDER BY id DESC LIMIT 5');
    envRows.forEach(row => {
      console.log(`  ID: ${row.id}, 仓位: ${row.location_id}, 温度: ${row.temperature}°C, 湿度: ${row.humidity}%, 预警: ${row.is_alert ? '是' : '否'}`);
    });

    await connection.end();
    console.log('\n验证完成！');
  } catch (error) {
    console.error('验证失败:', error);
    process.exit(1);
  }
};

verifyData();
