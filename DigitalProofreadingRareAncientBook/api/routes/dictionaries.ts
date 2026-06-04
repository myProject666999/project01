import { Router, type Response } from 'express'
import { query, getOne } from '../db.js'
import { authMiddleware, roleMiddleware, type AuthRequest } from '../middleware/auth.js'

const router = Router()

router.use(authMiddleware)

router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const dictionaries: any = await query(`
      SELECT 
        d.*,
        (SELECT COUNT(*) FROM dictionary_entries e WHERE e.dictionary_id = d.id) as entry_count
      FROM dictionaries d
      ORDER BY d.created_at DESC
    `)

    res.json({
      success: true,
      data: dictionaries.map((d: any) => ({
        id: d.id,
        name: d.name,
        type: d.type,
        description: d.description,
        entryCount: d.entry_count,
      })),
    })
  } catch (err) {
    console.error('Get dictionaries error:', err)
    res.status(500).json({ success: false, error: '获取字典列表失败' })
  }
})

router.get('/lookup', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { char } = req.query

    if (!char || typeof char !== 'string') {
      res.status(400).json({ success: false, error: '请提供查询字符' })
      return
    }

    const standardEntries: any = await query(
      `
      SELECT 
        de.*,
        d.name as dictionary_name,
        d.type as dictionary_type
      FROM dictionary_entries de
      JOIN dictionaries d ON de.dictionary_id = d.id
      WHERE de.standard_char = ?
    `,
      [char]
    )

    const variantEntries: any = await query(
      `
      SELECT 
        de.*,
        d.name as dictionary_name,
        d.type as dictionary_type
      FROM dictionary_entries de
      JOIN dictionaries d ON de.dictionary_id = d.id
      WHERE de.variant_char = ?
    `,
      [char]
    )

    const standardChars = variantEntries.map((e: any) => e.standard_char)
    const relatedVariants: any = standardChars.length
      ? await query(
          `
        SELECT 
          de.*,
          d.name as dictionary_name,
          d.type as dictionary_type
        FROM dictionary_entries de
        JOIN dictionaries d ON de.dictionary_id = d.id
        WHERE de.standard_char IN (?)
      `,
          [standardChars]
        )
      : []

    const allVariants = [
      ...standardEntries,
      ...relatedVariants.filter(
        (e: any) => !standardEntries.some((s: any) => s.id === e.id)
      ),
    ]

    const variants = allVariants
      .filter((e: any) => e.variant_char !== char)
      .map((e: any) => ({
        char: e.variant_char,
        type: e.dictionary_type === 'variant' ? '异体字' : '繁简字',
        note: e.note,
        dictionaryName: e.dictionary_name,
      }))

    res.json({
      success: true,
      data: {
        char,
        variants,
      },
    })
  } catch (err) {
    console.error('Lookup error:', err)
    res.status(500).json({ success: false, error: '查询失败' })
  }
})

router.get('/:id/entries', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { search, standardChar } = req.query

    let sql = 'SELECT * FROM dictionary_entries WHERE dictionary_id = ?'
    let params: any[] = [id]

    if (standardChar) {
      sql += ' AND standard_char = ?'
      params.push(standardChar)
    } else if (search) {
      sql += ' AND (standard_char LIKE ? OR variant_char LIKE ?)'
      params.push(`%${search}%`, `%${search}%`)
    }

    sql += ' ORDER BY standard_char, variant_char'

    const entries: any = await query(sql, params)

    res.json({
      success: true,
      data: entries.map((e: any) => ({
        id: e.id,
        standardChar: e.standard_char,
        variantChar: e.variant_char,
        note: e.note,
      })),
    })
  } catch (err) {
    console.error('Get entries error:', err)
    res.status(500).json({ success: false, error: '获取词条失败' })
  }
})

router.post('/:id/entries', roleMiddleware('admin'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { standardChar, variantChar, note } = req.body

    if (!standardChar || !variantChar) {
      res.status(400).json({ success: false, error: '标准字和异体字不能为空' })
      return
    }

    const result: any = await query(
      'INSERT INTO dictionary_entries (dictionary_id, standard_char, variant_char, note) VALUES (?, ?, ?, ?)',
      [id, standardChar, variantChar, note || null]
    )

    res.json({
      success: true,
      data: { id: result.insertId },
    })
  } catch (err) {
    console.error('Create entry error:', err)
    res.status(500).json({ success: false, error: '创建词条失败' })
  }
})

router.put('/:id/entries/:entryId', roleMiddleware('admin'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id, entryId } = req.params
    const { standardChar, variantChar, note } = req.body

    await query(
      'UPDATE dictionary_entries SET standard_char = ?, variant_char = ?, note = ? WHERE id = ? AND dictionary_id = ?',
      [standardChar, variantChar, note || null, entryId, id]
    )

    res.json({ success: true, message: '更新成功' })
  } catch (err) {
    console.error('Update entry error:', err)
    res.status(500).json({ success: false, error: '更新失败' })
  }
})

router.delete('/:id/entries/:entryId', roleMiddleware('admin'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id, entryId } = req.params

    await query('DELETE FROM dictionary_entries WHERE id = ? AND dictionary_id = ?', [entryId, id])

    res.json({ success: true, message: '删除成功' })
  } catch (err) {
    console.error('Delete entry error:', err)
    res.status(500).json({ success: false, error: '删除失败' })
  }
})

export default router
