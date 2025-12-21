import prisma from './prismaClient'

const INTERVAL_MIN = Number(process.env.ALERT_INTERVAL_MINUTES || '60')

function pctChange(prev: number, curr: number) {
  if (prev === 0) return curr === 0 ? 0 : 100
  return ((curr - prev) / Math.abs(prev)) * 100
}

async function aggregateMetricForClient(clientId: number, from: Date, to: Date) {
  // compute CTR and CPL as supported metrics
  const rows = await prisma.campaignPerformance.findMany({ where: { adAccount: { clientId }, date: { gte: from, lt: to } } })
  if (!rows.length) return { ctr: 0, cpl: 0 }
  const impressions = rows.reduce((s, r) => s + (r.impressions || 0), 0)
  const clicks = rows.reduce((s, r) => s + (r.clicks || 0), 0)
  const spend = rows.reduce((s, r) => s + (r.spend || 0), 0)
  const leads = rows.reduce((s, r) => s + (r.leads || 0), 0)
  const ctr = impressions === 0 ? 0 : (clicks / impressions) * 100
  const cpl = leads === 0 ? (spend === 0 ? 0 : Number.POSITIVE_INFINITY) : spend / leads
  return { ctr, cpl }
}

export async function evaluateAlertsOnce() {
  const alerts = await prisma.performanceAlert.findMany({ where: { active: true } })
  const now = new Date()
  const end = new Date(now)
  const mid = new Date(now)
  mid.setDate(now.getDate() - 1)
  const start = new Date(now)
  start.setDate(now.getDate() - 2)

  for (const a of alerts) {
    try {
      const prevAgg = await aggregateMetricForClient(a.clientId, start, mid)
      const currAgg = await aggregateMetricForClient(a.clientId, mid, end)
      let prev = 0, curr = 0
      const metric = a.metric.toLowerCase()
      if (metric.includes('ctr')) {
        prev = prevAgg.ctr
        curr = currAgg.ctr
      } else if (metric.includes('cpl')) {
        prev = prevAgg.cpl === Number.POSITIVE_INFINITY ? 0 : prevAgg.cpl
        curr = currAgg.cpl === Number.POSITIVE_INFINITY ? 0 : currAgg.cpl
      } else {
        continue
      }
      const change = pctChange(prev, curr)
      const threshold = a.thresholdValue
      const condition = a.condition.toLowerCase()
      let fired = false
      if (condition === 'drop' && change <= -Math.abs(threshold)) fired = true
      if (condition === 'rise' && change >= Math.abs(threshold)) fired = true

      if (fired) {
        await prisma.alertEvent.create({ data: { alertId: a.id, clientId: a.clientId, metric: a.metric, currentValue: curr, previousValue: prev, changePercent: change } })
        if (a.notificationChannel === 'console') {
          console.log(`ALERTA disparado para cliente ${a.clientId} métrica ${a.metric}: variação ${change.toFixed(2)}%`)
        }
      }
    } catch (err) {
      console.error('Erro ao avaliar alerta', a.id, err)
    }
  }
}

export function startAlertWorker() {
  // run immediately, then interval
  evaluateAlertsOnce().catch(err => console.error('Erro na execução inicial do worker de alertas', err))
  setInterval(() => evaluateAlertsOnce().catch(err => console.error('Erro no worker de alertas', err)), INTERVAL_MIN * 60 * 1000)
}

export default startAlertWorker
