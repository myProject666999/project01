import { Router, type Response } from 'express'
import { query, getOne } from '../db.js'
import { authMiddleware, roleMiddleware, type AuthRequest } from '../middleware/auth.js'

const router = Router({ mergeParams: true })

router.use(authMiddleware)
router.use(roleMiddleware('reviewer', 'admin'))

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
      WHERE pr.page_id = ? AND pr.status = ?
      ORDER BY pr.submitted_at
    `,
      [pageId, 'submitted']
    )

    if (proofreadings.length < 2) {
      res.status(400).json({ success: false, error: '该页面尚未完成两次校对' })
      return
    }

    const lines1 = (proofreadings[0].text_content || '').split('\n')
    const lines2 = (proofreadings[1].text_content || '').split('\n')

    const maxLines = Math.max(lines1.length, lines2.length)
    const differences = []

    for (let i = 0; i < maxLines; i++) {
      const text1 = lines1[i] || ''
      const text2 = lines2[i] || ''
      if (text1 !== text2) {
        differences.push({ lineIndex: i, text1, text2 })
      }
    }

    const review = await getOne(
      `
      SELECT r.*, u.display_name as reviewer_name
      FROM reviews r
      JOIN users u ON r.reviewer_id = u.id
      WHERE r.page_id = ?
    `,
      [pageId]
    )

    res.json({
      success: true,
      data: {
        proofreading1: {
          id: proofreadings[0].id,
          userId: proofreadings[0].user_id,
          username: proofreadings[0].username,
          textContent: proofreadings[0].text_content,
          submittedAt: proofreadings[0].submitted_at,
        },
        proofreading2: {
          id: proofreadings[1].id,
          userId: proofreadings[1].user_id,
          username: proofreadings[1].username,
          textContent: proofreadings[1].text_content,
          submittedAt: proofreadings[1].submitted_at,
        },
        differences,
        review: review
          ? {
              id: review.id,
              reviewerName: review.reviewer_name,
              finalText: review.final_text,
              finalizedAt: review.finalized_at,
            }
          : null,
      },
    })
  } catch (err) {
    console.error('Get review error:', err)
    res.status(500).json({ success: false, error: '获取审稿数据失败' })
  }
})

router.post('/finalize', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookId, pageId } = req.params
    const { finalText } = req.body
    const reviewerId = req.user?.id

    const proofreadings: any = await query(
      'SELECT id FROM proofreadings WHERE page_id = ? AND status = ? ORDER BY submitted_at',
      [pageId, 'submitted']
    )

    if (proofreadings.length < 2) {
      res.status(400).json({ success: false, error: '该页面尚未完成两次校对' })
      return
    }

    const existingReview = await getOne('SELECT id FROM reviews WHERE page_id = ?', [pageId])

    if (existingReview) {
      await query(
        'UPDATE reviews SET final_text = ?, finalized_at = NOW() WHERE id = ?',
        [finalText, existingReview.id]
      )
    } else {
      await query(
        'INSERT INTO reviews (page_id, reviewer_id, proofreading_1_id, proofreading_2_id, final_text) VALUES (?, ?, ?, ?, ?)',
        [pageId, reviewerId, proofreadings[0].id, proofreadings[1].id, finalText]
      )
    }

    await query("UPDATE pages SET status = 'finalized' WHERE id = ?", [pageId])

    res.json({ success: true, message: '定稿成功，页面已冻结' })
  } catch (err) {
    console.error('Finalize error:', err)
    res.status(500).json({ success: false, error: '定稿失败' })
  }
})

export default router
