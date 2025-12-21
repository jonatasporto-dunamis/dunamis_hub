import express from 'express'
import prisma from '../prismaClient'
import bcrypt from 'bcryptjs'
import { authMiddleware, requireRole } from '../auth'

const router = express.Router()

router.use(authMiddleware)

router.get('/', requireRole(['ADMIN']), async (req, res) => {
  const users = await prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, active: true, createdAt: true } })
  res.json(users)
})

router.post('/', requireRole(['ADMIN']), async (req, res) => {
  const { name, email, password, role } = req.body
  if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' })
  const hashed = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({ data: { name, email, password: hashed, role } })
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role })
})

export default router
