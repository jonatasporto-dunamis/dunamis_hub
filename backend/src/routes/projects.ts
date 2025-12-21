import express from 'express'
import prisma from '../prismaClient'
import { authMiddleware, requireRole } from '../auth'

const router = express.Router()
router.use(authMiddleware)

// list projects (filter by client if provided)
router.get('/', async (req, res) => {
  const { clientId } = req.query as any
  const where: any = {}
  if (clientId) where.clientId = Number(clientId)
  const projects = await prisma.project.findMany({ where, include: { tasks: true }, orderBy: { createdAt: 'desc' } })
  res.json(projects)
})

router.post('/', requireRole(['ADMIN','TRAFFIC_MANAGER']), async (req, res) => {
  const { clientId, name, status } = req.body
  if (!clientId || !name) return res.status(400).json({ error: 'Missing fields' })
  const p = await prisma.project.create({ data: { clientId: Number(clientId), name, status: status || 'planned' } })
  res.json(p)
})

// tasks
router.post('/:projectId/tasks', requireRole(['ADMIN','TRAFFIC_MANAGER']), async (req, res) => {
  const projectId = Number(req.params.projectId)
  const { title, description, assignedUserId, dueDate } = req.body
  if (!title) return res.status(400).json({ error: 'Missing title' })
  const t = await prisma.task.create({ data: { projectId, title, description, assignedUserId: assignedUserId ? Number(assignedUserId) : null, dueDate: dueDate ? new Date(dueDate) : null } })
  res.json(t)
})

router.put('/tasks/:id', requireRole(['ADMIN','TRAFFIC_MANAGER']), async (req, res) => {
  const id = Number(req.params.id)
  const data = req.body
  const t = await prisma.task.update({ where: { id }, data })
  res.json(t)
})

export default router
