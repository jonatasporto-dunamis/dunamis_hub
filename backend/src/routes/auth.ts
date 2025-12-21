import express from 'express'
import prisma from '../prismaClient'
import bcrypt from 'bcryptjs'
import { signToken } from '../auth'

const router = express.Router()

router.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' })
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return res.status(401).json({ error: 'Invalid credentials' })
  const ok = await bcrypt.compare(password, user.password)
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' })
  const token = signToken({ id: user.id, role: user.role, email: user.email })
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } })
})

export default router
