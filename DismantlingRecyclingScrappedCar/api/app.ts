/**
 * 报废汽车拆解回收管理系统 - API服务器
 */

import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import authRoutes from './routes/auth.js'
import vehicleRoutes from './routes/vehicles.js'
import dismantlingRoutes from './routes/dismantling.js'
import inventoryRoutes from './routes/inventory.js'
import hazardousRoutes from './routes/hazardous.js'
import reportRoutes from './routes/reports.js'
import { dashboardController } from './controllers/DashboardController.js'
import { authMiddleware } from './middleware/auth.js'
import { testConnection } from './config/database.js'

// for esm mode
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// load env
dotenv.config()

const app: express.Application = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// 测试数据库连接
testConnection()

/**
 * API Routes
 */
app.use('/api/auth', authRoutes)
app.use('/api/vehicles', vehicleRoutes)
app.use('/api/dismantling', dismantlingRoutes)
app.use('/api/inventory', inventoryRoutes)
app.use('/api/hazardous', hazardousRoutes)
app.use('/api/reports', reportRoutes)

// 首页统计
app.get('/api/dashboard/stats', authMiddleware, dashboardController.getStats)

/**
 * health
 */
app.use(
  '/api/health',
  (req: Request, res: Response, next: NextFunction): void => {
    res.status(200).json({
      success: true,
      message: 'ok',
    })
  },
)

/**
 * error handler middleware
 */
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('服务器错误:', error)
  res.status(500).json({
    success: false,
    error: 'Server internal error',
  })
})

/**
 * 404 handler
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found',
  })
})

export default app
