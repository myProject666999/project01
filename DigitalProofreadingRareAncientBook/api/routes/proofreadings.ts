import { Router, type Response } from 'express'
import { query, getOne } from '../db.js'
import { authMiddleware, type AuthRequest } from '../middleware/auth.js'

const router = Router({ mergeParams: true })

router.use(authMiddleware)

router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookId, pageId } = req.params

    const proofreadings: any = await query(
      `
      SELECT 
        pr.*,
        u.display_name as username
      FROM proofreadings pr
      JOIN users u ON pr.user_id = u.id
      WHERE pr.page_id = ?
      ORDER BY pr.submitted_at DESC
    `,
      [pageId]
    )

    res.json({
      success: true,
      data: proofreadings.map((pr: any) => ({
        id: pr.id,
        pageId: pr.page_id,
        userId: pr.user_id,
        username: pr.username,
        textContent: pr.text_content,
        status: pr.status,
        submittedAt: pr.submitted_at,
      })),
    })
  } catch (err) {
    console.error('Get proofreadings error:', err)
    res.status(500).json({ success: false, error: '获取校对记录失败' })
  }
})

router.put('/:proofreadingId', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookId, pageId, proofreadingId } = req.params
    const { textContent } = req.body
    const userId = req.user?.id

    const proofreading: any = await getOne(
      'SELECT * FROM proofreadings WHERE id = ? AND user_id = ?',
      [proofreadingId, userId]
    )

    if (!proofreading) {
      res.status(404).json({ success: false, error: '校对记录不存在' })
      return
    }

    if (proofreading.status === 'submitted') {
      res.status(400).json({ success: false, error: '已提交的校对记录不能修改' })
      return
    }

    await query('UPDATE proofreadings SET text_content = ? WHERE id = ?', [
      textContent,
      proofreadingId,
    ])

    res.json({ success: true, message: '保存成功' })
  } catch (err) {
    console.error('Update proofreading error:', err)
    res.status(500).json({ success: false, error: '保存失败' })
  }
})

router.post('/:proofreadingId/submit', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookId, pageId, proofreadingId } = req.params
    const { textContent } = req.body
    const userId = req.user?.id

    const proofreading: any = await getOne(
      'SELECT * FROM proofreadings WHERE id = ? AND user_id = ?',
      [proofreadingId, userId]
    )

    if (!proofreading) {
      res.status(404).json({ success: false, error: '校对记录不存在' })
      return
    }

    if (proofreading.status === 'submitted') {
      res.status(400).json({ success: false, error: '该校对记录已提交' })
      return
    }

    await query(
      'UPDATE proofreadings SET text_content = ?, status = ?, submitted_at = NOW() WHERE id = ?',
      [textContent, 'submitted', proofreadingId]
    )

    await query('UPDATE page_claims SET released_at = NOW() WHERE page_id = ? AND user_id = ? AND released_at IS NULL', [pageId, userId])

    const submittedCount: any = await getOne(
      'SELECT COUNT(*) as count FROM proofreadings WHERE page_id = ? AND status = ?',
      [pageId, 'submitted']
    )

    let newStatus = 'first_done'
    if (submittedCount.count >= 2) {
      newStatus = 'pending_review'
    }

    await query('UPDATE pages SET status = ? WHERE id = ?', [newStatus, pageId])

    res.json({ success: true, message: '提交成功' })
  } catch (err) {
    console.error('Submit proofreading error:', err)
    res.status(500).json({ success: false, error: '提交失败' })
  }
})

export default router
