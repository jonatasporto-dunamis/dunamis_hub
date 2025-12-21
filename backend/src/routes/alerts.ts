import express from 'express'
import prisma from '../prismaClient'
import { authMiddleware, requireRole } from '../auth'
import { evaluateAlertsOnce } from '../alertWorker'

const router = express.Router()

router.use(authMiddleware)

// List alert definitions (all authenticated can view)
router.get('/', async (req, res) => {
  const alerts = await prisma.performanceAlert.findMany({ where: {}, take: 200 })
  res.json(alerts)
})

// Create a new alert definition (admin only)
router.post('/', requireRole(['ADMIN']), async (req, res) => {
  const { clientId, metric, thresholdValue, condition, notificationChannel } = req.body
  if (!clientId || !metric || !thresholdValue || !condition) return res.status(400).json({ error: 'Missing fields' })
  const a = await prisma.performanceAlert.create({ data: { clientId, metric, thresholdValue: Number(thresholdValue), condition, notificationChannel: notificationChannel || 'console' } })
  res.json(a)
})

// Force-evaluate alerts now (admin only)
router.post('/evaluate', requireRole(['ADMIN']), async (req, res) => {
  try {
    await evaluateAlertsOnce()
    res.json({ ok: true, message: 'Alert evaluation triggered' })
  } catch (err) {
    console.error('evaluate endpoint error', err)
    res.status(500).json({ error: 'Evaluation failed' })
  }
})

// List alert events (admin)
router.get('/events', requireRole(['ADMIN']), async (req, res) => {
  const events = await prisma.alertEvent.findMany({ orderBy: { createdAt: 'desc' }, take: 200 })
  res.json(events)
})

export default router
