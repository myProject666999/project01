import { Router, type Response } from 'express'
import { query, getOne } from '../db.js'
import { authMiddleware, type AuthRequest } from '../middleware/auth.js'

const router = Router({ mergeParams: true })

router.use(authMiddleware)

router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookId } = req.params
    const userId = req.user?.id

    const pages: any = await query(
      `
      SELECT 
        p.*,
        (SELECT u.display_name 
         FROM page_claims pc 
         JOIN users u ON pc.user_id = u.id 
         WHERE pc.page_id = p.id AND pc.released_at IS NULL) as claimant_name,
        (SELECT pc.round 
         FROM page_claims pc 
         WHERE pc.page_id = p.id AND pc.released_at IS NULL) as claim_round,
        (SELECT COUNT(*) FROM proofreadings pr WHERE pr.page_id = p.id AND pr.status = 'submitted') as submitted_count
      FROM pages p
      WHERE p.book_id = ?
      ORDER BY p.page_number
    `,
      [bookId]
    )

    res.json({
      success: true,
      data: pages.map((p: any) => ({
        id: p.id,
        pageNumber: p.page_number,
        imagePath: p.image_path,
        dziPath: p.dzi_path,
        ocrText: p.ocr_text,
        status: p.status,
        claimant: p.claimant_name,
        claimRound: p.claim_round,
        submittedCount: p.submitted_count,
      })),
    })
  } catch (err) {
    console.error('Get pages error:', err)
    res.status(500).json({ success: false, error: '获取页面列表失败' })
  }
})

router.get('/:pageId', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookId, pageId } = req.params
    const userId = req.user?.id

    const page = await getOne(
      `
      SELECT 
        p.*,
        b.title as book_title,
        (SELECT u.display_name 
         FROM page_claims pc 
         JOIN users u ON pc.user_id = u.id 
         WHERE pc.page_id = p.id AND pc.released_at IS NULL) as claimant_name,
        (SELECT pc.user_id 
         FROM page_claims pc 
         WHERE pc.page_id = p.id AND pc.released_at IS NULL) as claimant_id,
        (SELECT pc.round 
         FROM page_claims pc 
         WHERE pc.page_id = p.id AND pc.released_at IS NULL) as claim_round,
        (SELECT pr.id FROM proofreadings pr 
         WHERE pr.page_id = p.id AND pr.user_id = ? AND pr.status = 'draft') as current_proofreading_id,
        (SELECT pr.text_content FROM proofreadings pr 
         WHERE pr.page_id = p.id AND pr.user_id = ? AND pr.status = 'draft') as current_text
      FROM pages p
      JOIN books b ON p.book_id = b.id
      WHERE p.book_id = ? AND p.id = ?
    `,
      [userId, userId, bookId, pageId]
    )

    if (!page) {
      res.status(404).json({ success: false, error: '页面不存在' })
      return
    }

    res.json({
      success: true,
      data: {
        id: page.id,
        bookId: page.book_id,
        bookTitle: page.book_title,
        pageNumber: page.page_number,
        imagePath: page.image_path,
        dziPath: page.dzi_path,
        ocrText: page.ocr_text,
        status: page.status,
        claimantId: page.claimant_id,
        claimant: page.claimant_name,
        claimRound: page.claim_round,
        currentProofreadingId: page.current_proofreading_id,
        currentText: page.current_text || page.ocr_text,
        isClaimedByMe: page.claimant_id === userId,
      },
    })
  } catch (err) {
    console.error('Get page error:', err)
    res.status(500).json({ success: false, error: '获取页面信息失败' })
  }
})

router.post('/:pageId/claim', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookId, pageId } = req.params
    const userId = req.user?.id

    const existingClaim: any = await getOne(
      'SELECT * FROM page_claims WHERE page_id = ? AND released_at IS NULL',
      [pageId]
    )

    if (existingClaim) {
      if (existingClaim.user_id === userId) {
        res.json({ success: true, message: '您已认领该页面' })
      } else {
        res.status(400).json({ success: false, error: '该页面已被他人认领' })
      }
      return
    }

    const page: any = await getOne('SELECT * FROM pages WHERE id = ?', [pageId])
    if (!page) {
      res.status(404).json({ success: false, error: '页面不存在' })
      return
    }

    const submittedCount: any = await getOne(
      'SELECT COUNT(*) as count FROM proofreadings WHERE page_id = ? AND status = ?',
      [pageId, 'submitted']
    )
    const round = submittedCount.count + 1

    if (round > 2) {
      res.status(400).json({ success: false, error: '该页面已完成两次校对' })
      return
    }

    await query('INSERT INTO page_claims (page_id, user_id, round) VALUES (?, ?, ?)', [
      pageId,
      userId,
      round,
    ])

    const newStatus = round === 1 ? 'proofreading' : page.status

    if (page.status === 'first_done') {
      await query('UPDATE pages SET status = ? WHERE id = ?', ['proofreading', pageId])
    }

    const existingDraft = await getOne(
      'SELECT id FROM proofreadings WHERE page_id = ? AND user_id = ? AND status = ?',
      [pageId, userId, 'draft']
    )

    if (!existingDraft) {
      await query(
        'INSERT INTO proofreadings (page_id, user_id, text_content) VALUES (?, ?, ?)',
        [pageId, userId, page.ocr_text || '']
      )
    }

    res.json({ success: true, message: '认领成功' })
  } catch (err) {
    console.error('Claim page error:', err)
    res.status(500).json({ success: false, error: '认领失败' })
  }
})

router.post('/:pageId/release', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookId, pageId } = req.params
    const userId = req.user?.id

    const existingClaim: any = await getOne(
      'SELECT * FROM page_claims WHERE page_id = ? AND user_id = ? AND released_at IS NULL',
      [pageId, userId]
    )

    if (!existingClaim) {
      res.status(400).json({ success: false, error: '您未认领该页面' })
      return
    }

    await query(
      'UPDATE page_claims SET released_at = NOW() WHERE id = ?',
      [existingClaim.id]
    )

    const page: any = await getOne('SELECT * FROM pages WHERE id = ?', [pageId])
    if (page.status === 'proofreading') {
      const submittedCount: any = await getOne(
        'SELECT COUNT(*) as count FROM proofreadings WHERE page_id = ? AND status = ?',
        [pageId, 'submitted']
      )
      const newStatus = submittedCount.count === 1 ? 'first_done' : 'unclaimed'
      await query('UPDATE pages SET status = ? WHERE id = ?', [newStatus, pageId])
    }

    res.json({ success: true, message: '已释放该页面' })
  } catch (err) {
    console.error('Release page error:', err)
    res.status(500).json({ success: false, error: '释放页面失败' })
  }
})

export default router
