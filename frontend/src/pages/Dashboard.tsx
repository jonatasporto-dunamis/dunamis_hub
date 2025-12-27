import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function SimpleLineChart({ points, labels, width = 760, height = 180 }: { points: number[]; labels?: string[]; width?: number; height?: number }) {
  if (!points || points.length === 0) return <div>Sem dados para gráfico.</div>
  const max = Math.max(...points)
  const min = Math.min(...points)
  const len = points.length
  const pad = 26
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

export default function Dashboard() {
  const [kpis, setKpis] = useState<any>({})
  const [clients, setClients] = useState<any[]>([])
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [selectedClient, setSelectedClient] = useState<number | 'all'>('all')
  const [platform, setPlatform] = useState<string>('all')
  const [fromDate, setFromDate] = useState<string>(() => {
    const d = new Date()
    d.setDate(d.getDate() - 14)
    return d.toISOString().slice(0, 10)
  })
  const [toDate, setToDate] = useState<string>(() => new Date().toISOString().slice(0, 10))
  const [alertsByClient, setAlertsByClient] = useState<Record<number, number>>({})
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return navigate('/')
  }, [navigate])

  async function loadData() {
    try {
      const [cRes, pRes, aRes] = await Promise.all([
        axios.get('/api/clients'),
        axios.get(`/api/performance/campaigns?limit=1000&from=${fromDate}&to=${toDate}${platform !== 'all' ? `&platform=${platform}` : ''}${selectedClient !== 'all' ? `&clientId=${selectedClient}` : ''}`),
        axios.get('/api/alerts')
      ])
      const clients = cRes.data
      const rows = pRes.data
      const alerts = aRes.data

      setClients(clients)
      setCampaigns(rows)

      const totalSpend = rows.reduce((s: number, r: any) => s + (r.spend || 0), 0)
      const avgCpl = (rows.reduce((s: number, r: any) => s + (r.cpl || 0), 0) / (rows.length || 1)).toFixed(2)
      setKpis({ totalSpend, avgCpl, activeClients: clients.length })

      // map alerts by clientId (count active alerts)
      const byClient: Record<number, number> = {}
      for (const al of alerts) {
        if (!al.clientId) continue
        if (!al.active) continue
        byClient[al.clientId] = (byClient[al.clientId] || 0) + 1
      }
      setAlertsByClient(byClient)
    } catch (err: any) {
      console.error('Erro ao carregar dados do dashboard:', err)
      setError('Erro ao carregar dados. Verifique a conexão com o servidor.')
    }
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromDate, toDate, platform, selectedClient])

  function logout() {
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
    navigate('/')
  }

  const filteredCampaigns = campaigns

  // build CPL series by date
  const byDate: Record<string, { sum: number; count: number }> = {}
  for (const r of filteredCampaigns) {
    const d = new Date(r.date).toISOString().slice(0, 10)
    if (!byDate[d]) byDate[d] = { sum: 0, count: 0 }
    byDate[d].sum += Number(r.cpl || 0)
    byDate[d].count += 1
  }
  const dates = Object.keys(byDate).sort()
  const series = dates.map(d => byDate[d].count ? byDate[d].sum / byDate[d].count : 0)

  return (
    <div className="page">
      <header style={{ display: 'flex', alignItems: 'center' }}>
        <h1>Visão Geral</h1>
        <div style={{ marginLeft: 'auto' }}>
          <button onClick={logout}>Sair</button>
        </div>
      </header>
      {error && <div className="error">{error}</div>}

      <section className="kpis" style={{ display: 'flex', gap: 12 }}>
        <div className="card">
          <strong>Gasto Total</strong>
          <div>R$ {kpis.totalSpend?.toFixed ? kpis.totalSpend.toFixed(2) : kpis.totalSpend}</div>
        </div>
        <div className="card">
          <strong>CPL Médio</strong>
          <div>R$ {kpis.avgCpl}</div>
        </div>
        <div className="card">
          <strong>Clientes Ativos</strong>
          <div>{kpis.activeClients}</div>
        </div>
      </section>

      <section style={{ marginTop: 16 }}>
        <h2>Desempenho de Campanhas</h2>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
          <div>
            <label>Cliente: </label>
            <select value={selectedClient as any} onChange={e => setSelectedClient(e.target.value === 'all' ? 'all' : Number(e.target.value))}>
              <option value="all">Todos os clientes</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Plataforma: </label>
            <select value={platform} onChange={e => setPlatform(e.target.value)}>
              <option value="all">Todas</option>
              <option value="META">Meta</option>
              <option value="GOOGLE">Google</option>
              <option value="TIKTOK">TikTok</option>
            </select>
          </div>
          <div>
            <label>De: </label>
            <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} />
          </div>
          <div>
            <label>Até: </label>
            <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} />
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <h3>CPL ao longo do tempo</h3>
          <SimpleLineChart points={series} labels={dates} />
        </div>

        {filteredCampaigns.length === 0 ? (
          <div>Sem dados de campanhas para o período selecionado.</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Conta</th>
                <th>Campanha</th>
                <th>Data</th>
                <th>Impressões</th>
                <th>Cliques</th>
                <th>Gasto</th>
                <th>Leads</th>
                <th>CPL</th>
                <th>CTR (%)</th>
                <th>Alertas</th>
              </tr>
            </thead>
            <tbody>
              {filteredCampaigns.map((r: any) => (
                <tr key={r.id}>
                  <td>{r.adAccount?.clientId}</td>
                  <td>{r.adAccount?.name || r.adAccount?.externalAccountId}</td>
                  <td>{r.campaignName}</td>
                  <td>{new Date(r.date).toLocaleDateString('pt-BR')}</td>
                  <td>{r.impressions}</td>
                  <td>{r.clicks}</td>
                  <td>R$ {Number(r.spend || 0).toFixed(2)}</td>
                  <td>{r.leads}</td>
                  <td>{r.cpl ? `R$ ${Number(r.cpl).toFixed(2)}` : '-'}</td>
                  <td>{r.ctr ? Number(r.ctr).toFixed(2) : '-'}</td>
                  <td>{alertsByClient[r.adAccount?.clientId] ? <span style={{ color: 'darkred' }}>Alerta ativo ({alertsByClient[r.adAccount?.clientId]})</span> : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}
