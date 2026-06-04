import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_NAME || 'ancient_book_proofread',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
})

export async function query(sql: string, params?: any[]) {
  const [rows] = await pool.execute(sql, params)
  return rows
}

export async function getOne(sql: string, params?: any[]) {
  const rows: any = await query(sql, params)
  return rows.length > 0 ? rows[0] : null
}

export default pool
