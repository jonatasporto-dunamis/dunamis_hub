import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth'
import userRoutes from './routes/users'
import alertsRoutes from './routes/alerts'
import startAlertWorker from './alertWorker'
import clientsRoutes from './routes/clients'
import perfRoutes from './routes/performance'
import projectsRoutes from './routes/projects'
import financeRoutes from './routes/finance'
import prisma from './prismaClient'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/alerts', alertsRoutes)
app.use('/api/clients', clientsRoutes)
app.use('/api/performance', perfRoutes)
app.use('/api/projects', projectsRoutes)
app.use('/api/finance', financeRoutes)

app.get('/api/clients', async (req, res) => {
  const clients = await prisma.clientCompany.findMany({ take: 50 })
  res.json(clients)
})

app.get('/api/performance/sample', async (req, res) => {
  const perf = await prisma.campaignPerformance.findMany({ take: 200 })
  res.json(perf)
})

const port = process.env.PORT || 4000
app.listen(port, () => {
  console.log(`Dunamis Hub backend listening on port ${port}`)
  // start alerts worker in background
  startAlertWorker()
})
