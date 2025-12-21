import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret'

export function signToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' })
}

export function authMiddleware(req: Request & { user?: any }, res: Response, next: NextFunction) {
  const auth = req.headers.authorization
  if (!auth) return res.status(401).json({ error: 'Unauthorized' })
  const parts = auth.split(' ')
  if (parts.length !== 2) return res.status(401).json({ error: 'Unauthorized' })
  const token = parts[1]
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any
    req.user = payload
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

export function requireRole(roles: string[]) {
  return (req: Request & { user?: any }, res: Response, next: NextFunction) => {
    const user = req.user
    if (!user) return res.status(401).json({ error: 'Unauthorized' })
    if (!roles.includes(user.role)) return res.status(403).json({ error: 'Forbidden' })
    next()
  }
}
