import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function fixPasswords() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '123456',
    database: process.env.DB_NAME || 'scrap_car_management',
  });

  try {
    console.log('🔄 正在更新用户密码...');

    const password = '123456';
    const hashedPassword = await bcrypt.hash(password, 10);

    const usernames = ['admin', 'operator', 'hazardous_admin'];
    
    for (const username of usernames) {
      await connection.execute(
        'UPDATE users SET password = ? WHERE username = ?',
        [hashedPassword, username]
      );
      console.log(`✅ 用户 ${username} 密码已更新`);
    }

    console.log('\n✅ 所有用户密码更新完成！');
    console.log('👤 登录账号: admin / operator / hazardous_admin');
    console.log('🔐 密码: 123456');

  } catch (error) {
    console.error('❌ 密码更新失败:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

fixPasswords();
