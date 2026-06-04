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
import booksRoutes from './routes/books.js'
import pagesRoutes from './routes/pages.js'
import proofreadingsRoutes from './routes/proofreadings.js'
import reviewRoutes from './routes/review.js'
import dictionariesRoutes from './routes/dictionaries.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

const app: express.Application = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

const uploadDir = path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads')
app.use('/uploads', express.static(uploadDir))

app.use('/api/auth', authRoutes)
app.use('/api/books', booksRoutes)
app.use('/api/books/:bookId/pages', pagesRoutes)
app.use('/api/books/:bookId/pages/:pageId/proofreadings', proofreadingsRoutes)
app.use('/api/books/:bookId/pages/:pageId/review', reviewRoutes)
app.use('/api/dictionaries', dictionariesRoutes)

app.use(
  '/api/health',
  (req: Request, res: Response, next: NextFunction): void => {
    res.status(200).json({
      success: true,
      message: 'ok',
    })
  },
)

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Server error:', error)
  res.status(500).json({
    success: false,
    error: 'Server internal error',
  })
})

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found',
  })
})

export default app
