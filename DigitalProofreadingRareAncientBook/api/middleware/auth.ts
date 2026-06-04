import { type Request, type Response, type NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { getOne } from '../db.js'

export interface AuthRequest extends Request {
  user?: {
    id: number
    username: string
    role: string
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'ancient_book_proofread_jwt_secret_2024'

export function signToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const token = req.headers.authorization?.replace('Bearer ', '')
  
  if (!token) {
    res.status(401).json({ success: false, error: '未提供认证令牌' })
    return
  }

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET)
    const user = await getOne(
      'SELECT id, username, role, display_name FROM users WHERE id = ?',
      [decoded.id]
    )
    
    if (!user) {
      res.status(401).json({ success: false, error: '用户不存在' })
      return
    }

    req.user = user
    next()
  } catch (err) {
    res.status(401).json({ success: false, error: '无效的认证令牌' })
  }
}

export function roleMiddleware(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: '未登录' })
      return
    }
    
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ success: false, error: '权限不足' })
      return
    }
    
    next()
  }
}
