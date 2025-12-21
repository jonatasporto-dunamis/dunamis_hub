import express from 'express'
import prisma from '../prismaClient'
import { authMiddleware } from '../auth'

const router = express.Router()
router.use(authMiddleware)

// GET /api/performance/campaigns?clientId=&platform=&from=&to=&limit=
router.get('/campaigns', async (req, res) => {
  const { clientId, platform, from, to, limit } = req.query as any
  const where: any = {}
  if (clientId) where.adAccount = { clientId: Number(clientId) }
  if (platform) where.adAccount = { ...(where.adAccount || {}), platform: { equals: platform.toUpperCase() } }
  if (from || to) where.date = {}
  if (from) where.date.gte = new Date(String(from))
  if (to) where.date.lte = new Date(String(to))
  const rows = await prisma.campaignPerformance.findMany({ where, take: Number(limit || 500), orderBy: { date: 'desc' } })
  res.json(rows)
})

export default router
