import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function Dashboard() {
  const [kpis, setKpis] = useState<any>({})
  const [clients, setClients] = useState<any[]>([])

  useEffect(() => {
    async function load() {
      try {
        const c = await axios.get('/api/clients')
        setClients(c.data)
        const p = await axios.get('/api/performance/sample')
        const totalSpend = p.data.reduce((s: number, r: any) => s + (r.spend || 0), 0)
        const avgCpl = (p.data.reduce((s: number, r: any) => s + (r.cpl || 0), 0) / (p.data.length || 1)).toFixed(2)
        setKpis({ totalSpend, avgCpl, activeClients: c.data.length })
      } catch (err) {
        console.error(err)
      }
    }
    load()
  }, [])

  return (
    <div className="app">
      <aside className="sidebar">
        <h2>Dunamis Hub</h2>
        <nav>
          <a href="#">Dashboard</a>
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
        </header>
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
          <h2>Clientes</h2>
          <ul>
            {clients.map(c => (
              <li key={c.id}>{c.name} — {c.status}</li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  )
}
