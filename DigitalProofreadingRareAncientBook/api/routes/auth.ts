import { Router, type Request, type Response } from 'express'
import bcrypt from 'bcryptjs'
import { getOne } from '../db.js'
import { signToken } from '../middleware/auth.js'

const router = Router()

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      res.status(400).json({ success: false, error: '用户名和密码不能为空' })
      return
    }

    const user = await getOne(
      'SELECT id, username, password, role, display_name FROM users WHERE username = ?',
      [username]
    )

    if (!user) {
      res.status(401).json({ success: false, error: '用户名或密码错误' })
      return
    }

    let passwordMatch = false
    if (user.password === password) {
      passwordMatch = true
    } else {
      try {
        passwordMatch = bcrypt.compareSync(password, user.password)
      } catch {
        passwordMatch = false
      }
    }

    if (passwordMatch) {
      const token = signToken({ id: user.id, username: user.username, role: user.role })
      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          username: user.username,
          displayName: user.display_name,
          role: user.role,
        },
      })
    } else {
      res.status(401).json({ success: false, error: '用户名或密码错误' })
    }
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ success: false, error: '登录失败' })
  }
})

router.post('/logout', (req: Request, res: Response): void => {
  res.json({ success: true, message: '已退出登录' })
})

export default router
