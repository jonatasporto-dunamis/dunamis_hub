import express from 'express'
import prisma from '../prismaClient'
import { authMiddleware, requireRole } from '../auth'

const router = express.Router()
router.use(authMiddleware)

// contracts list
router.get('/contracts', requireRole(['ADMIN','FINANCIAL']), async (req, res) => {
  const contracts = await prisma.contract.findMany({ include: { client: true, receivables: true } })
  res.json(contracts)
})

router.post('/contracts', requireRole(['ADMIN','FINANCIAL']), async (req, res) => {
  const { clientId, monthlyValue, billingDay, startDate, status } = req.body
  if (!clientId || !monthlyValue || !billingDay || !startDate) return res.status(400).json({ error: 'Missing fields' })
  const c = await prisma.contract.create({ data: { clientId: Number(clientId), monthlyValue: Number(monthlyValue), billingDay: Number(billingDay), startDate: new Date(startDate), status: status || 'active' } })
  res.json(c)
})

// receivables
router.get('/receivables', requireRole(['ADMIN','FINANCIAL']), async (req, res) => {
  const receivables = await prisma.accountReceivable.findMany({ include: { client: true, contract: true } })
  res.json(receivables)
})

router.post('/receivables', requireRole(['ADMIN','FINANCIAL']), async (req, res) => {
  const { clientId, contractId, dueDate, amount } = req.body
  if (!clientId || !contractId || !dueDate || !amount) return res.status(400).json({ error: 'Missing fields' })
  const r = await prisma.accountReceivable.create({ data: { clientId: Number(clientId), contractId: Number(contractId), dueDate: new Date(dueDate), amount: Number(amount) } })
  res.json(r)
})

export default router
