import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useParams, useNavigate } from 'react-router-dom'

function SimpleLineChart({ points, width = 700, height = 160 }: { points: number[]; width?: number; height?: number }) {
  if (!points || points.length === 0) return <div>Nenhum dado para gráfico.</div>
  const max = Math.max(...points)
  const min = Math.min(...points)
  const len = points.length
  const pad = 20
  const scaleX = (i: number) => pad + (i / (len - 1)) * (width - pad * 2)
  const scaleY = (v: number) => {
    if (max === min) return height / 2
    return pad + ((max - v) / (max - min)) * (height - pad * 2)
  }
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(i)} ${scaleY(p)}`).join(' ')
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <rect x={0} y={0} width={width} height={height} fill="#fff" rx={6} />
      <path d={path} stroke="#2b6cb0" strokeWidth={2} fill="none" />
    </svg>
  )
}

export default function ClientDetail() {
  const { id } = useParams()
  const [client, setClient] = useState<any>(null)
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [cplSeries, setCplSeries] = useState<{ date: string; value: number }[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    async function load() {
      try {
        const [cRes, pRes, evRes] = await Promise.all([
          axios.get(`/api/clients/${id}`),
          axios.get(`/api/performance/campaigns?clientId=${id}&limit=1000`),
          axios.get('/api/alerts/events')
        ])
        setClient(cRes.data)
        setCampaigns(pRes.data)
        setEvents((evRes.data || []).filter((e: any) => String(e.clientId) === String(id)))

        // aggregate CPL by date
        const byDate: Record<string, { sum: number; count: number }> = {}
        for (const r of pRes.data) {
          const d = new Date(r.date).toISOString().slice(0, 10)
          if (!byDate[d]) byDate[d] = { sum: 0, count: 0 }
          const cpl = r.cpl || 0
          byDate[d].sum += cpl
          byDate[d].count += 1
        }
        const series = Object.keys(byDate).sort().map(d => ({ date: d, value: byDate[d].count ? byDate[d].sum / byDate[d].count : 0 }))
        setCplSeries(series)
      } catch (err) {
        console.error('Erro ao carregar detalhe do cliente:', err)
        setError('Falha ao carregar detalhe do cliente.')
      }
    }
    load()
  }, [id])

  if (error) return <div className="error">{error}</div>
  if (!client) return <div>Carregando...</div>

  return (
    <div className="page">
      <header style={{ display: 'flex', alignItems: 'center' }}>
        <h1>Cliente: {client.name}</h1>
        <div style={{ marginLeft: 'auto' }}>
          <BackButton />
        </div>
      </header>

      <section className="card">
        <h2>Visão geral</h2>
        <div>Razão social: {client.legalName || '-'}</div>
        <div>Documento: {client.document || '-'}</div>
        <div>Status: {client.status}</div>
      </section>

      <section className="card">
        <h2>CPL ao longo do tempo</h2>
        {cplSeries.length === 0 ? (
          <div>Sem dados de CPL.</div>
        ) : (
          <div>
            <SimpleLineChart points={cplSeries.map(s => Number(s.value || 0))} width={780} height={180} />
            <div style={{ marginTop: 8 }}>
              <small>Últimos {cplSeries.length} dias</small>
            </div>
          </div>
        )}
      </section>

      <section className="card">
        <h2>Alertas e eventos</h2>
        {events.length === 0 ? (
          <div>Sem eventos de alerta recentes.</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Métrica</th>
                <th>Valor atual</th>
                <th>Variação (%)</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {events.map(ev => (
                <tr key={ev.id}>
                  <td>{ev.metric}</td>
                  <td>{ev.currentValue}</td>
                  <td>{ev.changePercent?.toFixed ? ev.changePercent.toFixed(2) : ev.changePercent}</td>
                  <td>{new Date(ev.createdAt).toLocaleString('pt-BR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}

function BackButton() {
  const navigate = useNavigate()
  return (
    <button onClick={() => navigate(-1)} style={{ padding: '6px 10px', cursor: 'pointer' }}>
      Voltar
    </button>
  )
}
