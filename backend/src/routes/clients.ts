import express from 'express'
import prisma from '../prismaClient'
import { authMiddleware, requireRole } from '../auth'

const router = express.Router()
router.use(authMiddleware)

async function allowedClientIds(user: any) {
  if (!user) return []
  if (user.role === 'ADMIN') {
    const all = await prisma.clientCompany.findMany({ select: { id: true } })
    return all.map(a => a.id)
  }
  const accesses = await prisma.userClientAccess.findMany({ where: { userId: user.id }, select: { clientId: true } })
  return accesses.map(a => a.clientId)
}

// list clients (respect access)
router.get('/', async (req, res) => {
  const user = (req as any).user
  const ids = await allowedClientIds(user)
  const clients = await prisma.clientCompany.findMany({ where: { id: { in: ids } }, take: 200 })
  res.json(clients)
})

// client detail
router.get('/:id', async (req, res) => {
  const user = (req as any).user
  const id = Number(req.params.id)
  const ids = await allowedClientIds(user)
  if (!ids.includes(id)) return res.status(403).json({ error: 'Forbidden' })
  const client = await prisma.clientCompany.findUnique({ where: { id }, include: { adAccounts: true, contracts: true, projects: true, alerts: true } })
  if (!client) return res.status(404).json({ error: 'Not found' })
  res.json(client)
})

// create client (admin)
router.post('/', requireRole(['ADMIN']), async (req, res) => {
  const { name, legalName, document, status } = req.body
  if (!name) return res.status(400).json({ error: 'Missing name' })
  const c = await prisma.clientCompany.create({ data: { name, legalName, document, status: status || 'active' } })
  res.json(c)
})

// update client (admin)
router.put('/:id', requireRole(['ADMIN']), async (req, res) => {
  const id = Number(req.params.id)
  const data = req.body
  const c = await prisma.clientCompany.update({ where: { id }, data })
  res.json(c)
})

export default router
