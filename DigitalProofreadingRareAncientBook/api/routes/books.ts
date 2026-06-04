import { Router, type Response } from 'express'
import { query, getOne } from '../db.js'
import { authMiddleware, type AuthRequest } from '../middleware/auth.js'

const router = Router()

router.use(authMiddleware)

router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const books: any = await query(`
      SELECT 
        b.*,
        COUNT(DISTINCT p.id) as total_pages,
        SUM(CASE WHEN p.status = 'finalized' THEN 1 ELSE 0 END) as finalized_pages
      FROM books b
      LEFT JOIN pages p ON b.id = p.book_id
      GROUP BY b.id
      ORDER BY b.created_at DESC
    `)

    res.json({
      success: true,
      data: books.map((b: any) => ({
        id: b.id,
        title: b.title,
        author: b.author,
        dynasty: b.dynasty,
        description: b.description,
        totalPages: b.total_pages || 0,
        completedPages: b.finalized_pages || 0,
        status: b.status,
        createdAt: b.created_at,
      })),
    })
  } catch (err) {
    console.error('Get books error:', err)
    res.status(500).json({ success: false, error: '获取书籍列表失败' })
  }
})

router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const book = await getOne(
      `
      SELECT 
        b.*,
        COUNT(DISTINCT p.id) as total_pages,
        SUM(CASE WHEN p.status = 'finalized' THEN 1 ELSE 0 END) as finalized_pages
      FROM books b
      LEFT JOIN pages p ON b.id = p.book_id
      WHERE b.id = ?
      GROUP BY b.id
    `,
      [req.params.id]
    )

    if (!book) {
      res.status(404).json({ success: false, error: '书籍不存在' })
      return
    }

    res.json({
      success: true,
      data: {
        id: book.id,
        title: book.title,
        author: book.author,
        dynasty: book.dynasty,
        description: book.description,
        totalPages: book.total_pages || 0,
        completedPages: book.finalized_pages || 0,
        status: book.status,
      },
    })
  } catch (err) {
    console.error('Get book error:', err)
    res.status(500).json({ success: false, error: '获取书籍信息失败' })
  }
})

router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, author, dynasty, description } = req.body

    if (!title) {
      res.status(400).json({ success: false, error: '书名不能为空' })
      return
    }

    const result: any = await query(
      'INSERT INTO books (title, author, dynasty, description) VALUES (?, ?, ?, ?)',
      [title, author || null, dynasty || null, description || null]
    )

    res.json({
      success: true,
      data: { id: result.insertId, title },
    })
  } catch (err) {
    console.error('Create book error:', err)
    res.status(500).json({ success: false, error: '创建书籍失败' })
  }
})

export default router
