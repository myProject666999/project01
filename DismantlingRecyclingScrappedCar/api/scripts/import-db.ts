import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function importDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '123456',
    multipleStatements: true,
  });

  try {
    console.log('🔄 开始导入数据库...');

    const sqlPath = path.join(__dirname, '../../migrations/202606020001_init_schema.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    await connection.query(sqlContent);

    console.log('✅ 数据库导入成功！');
    console.log('📊 数据库名称: scrap_car_management');
    console.log('📋 已创建的表: users, vehicles, dismantling_tasks, dismantling_parts, inventory_items, hazardous_wastes, waybills, waybill_wastes, monthly_reports');
    console.log('👤 默认用户: admin / operator / hazardous_admin (密码: 123456)');

  } catch (error) {
    console.error('❌ 数据库导入失败:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

importDatabase();
