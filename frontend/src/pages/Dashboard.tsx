import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const [kpis, setKpis] = useState<any>({})
  const [clients, setClients] = useState<any[]>([])
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [selectedClient, setSelectedClient] = useState<number | 'all'>('all')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return navigate('/')
  }, [navigate])

  useEffect(() => {
    async function load() {
      try {
        const c = await axios.get('/api/clients')
        setClients(c.data)

        const p = await axios.get('/api/performance/campaigns?limit=500')
        const rows = p.data
        setCampaigns(rows)
        const totalSpend = rows.reduce((s: number, r: any) => s + (r.spend || 0), 0)
        const avgCpl = (rows.reduce((s: number, r: any) => s + (r.cpl || 0), 0) / (rows.length || 1)).toFixed(2)
        setKpis({ totalSpend, avgCpl, activeClients: c.data.length })
      } catch (err: any) {
        console.error(err)
        setError('Erro ao carregar dados. Verifique a conexão com o servidor.')
      }
    }
    load()
  }, [])

  function logout() {
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
    navigate('/')
  }

  const filteredCampaigns = selectedClient === 'all' ? campaigns : campaigns.filter(c => c.adAccount && c.adAccount.clientId === selectedClient)

  return (
    <div className="app">
      <aside className="sidebar">
        <h2>Dunamis Hub</h2>
        <nav>
          <a href="/dashboard">Dashboard</a>
          <a href="#">Clientes</a>
          <a href="#">Desempenho</a>
          <a href="#">Alertas</a>
          <a href="#">Projetos</a>
          <a href="#">Financeiro</a>
          <a href="#">Usuários</a>
        </nav>
      </aside>
      <main className="main">
        <header>
          <h1>Visão Geral</h1>
          <div style={{ marginLeft: 'auto' }}>
            <button onClick={logout}>Sair</button>
          </div>
        </header>
        {error && <div className="error">{error}</div>}
        <section className="kpis">
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

        <section>
          <h2>Desempenho de Campanhas</h2>
          <div style={{ marginBottom: 12 }}>
            <label>Filtrar por cliente: </label>
            <select value={selectedClient as any} onChange={e => setSelectedClient(e.target.value === 'all' ? 'all' : Number(e.target.value))}>
              <option value="all">Todos os clientes</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
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
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </div>
  )
}
