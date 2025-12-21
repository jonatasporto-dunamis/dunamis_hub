import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function Alerts() {
  const [alerts, setAlerts] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [form, setForm] = useState({ clientId: '', metric: 'cpl', thresholdValue: '', condition: 'less_than', notificationChannel: 'in_app' })
  const [msg, setMsg] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const [a, e, c] = await Promise.all([
          axios.get('/api/alerts'),
          axios.get('/api/alerts/events'),
          axios.get('/api/clients')
        ])
        setAlerts(a.data)
        setEvents(e.data)
        setClients(c.data)
      } catch (err) {
        console.error(err)
      }
    }
    load()
  }, [])

  async function createAlert(e: React.FormEvent) {
    e.preventDefault()
    try {
      await axios.post('/api/alerts', { ...form })
      setMsg('Alerta criado com sucesso.')
    } catch (err: any) {
      setMsg('Falha ao criar alerta.')
    }
  }

  async function evaluateNow() {
    try {
      await axios.post('/api/alerts/evaluate')
      setMsg('Avaliação disparada.')
    } catch (err) {
      setMsg('Falha ao avaliar alertas.')
    }
  }

  return (
    <div className="page">
      <h1>Alertas</h1>
      {msg && <div className="info">{msg}</div>}

      <section>
        <h2>Definições de Alertas</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Métrica</th>
              <th>Condição</th>
              <th>Valor</th>
              <th>Canal</th>
              <th>Ativo</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map(a => (
              <tr key={a.id}>
                <td>{a.clientId}</td>
                <td>{a.metric}</td>
                <td>{a.condition}</td>
                <td>{a.thresholdValue}</td>
                <td>{a.notificationChannel}</td>
                <td>{a.active ? 'Sim' : 'Não'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2>Criar Alerta</h2>
        <form onSubmit={createAlert} className="card">
          <label>Cliente</label>
          <select value={form.clientId} onChange={e => setForm({ ...form, clientId: e.target.value })}>
            <option value="">Selecione</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          <label>Métrica</label>
          <select value={form.metric} onChange={e => setForm({ ...form, metric: e.target.value })}>
            <option value="cpl">CPL</option>
            <option value="cpa">CPA</option>
            <option value="spend">Gasto</option>
          </select>

          <label>Condição</label>
          <select value={form.condition} onChange={e => setForm({ ...form, condition: e.target.value })}>
            <option value="less_than">Menor que</option>
            <option value="greater_than">Maior que</option>
          </select>

          <label>Valor de limite</label>
          <input value={form.thresholdValue} onChange={e => setForm({ ...form, thresholdValue: e.target.value })} />

          <label>Canal de notificação</label>
          <select value={form.notificationChannel} onChange={e => setForm({ ...form, notificationChannel: e.target.value })}>
            <option value="in_app">No app</option>
            <option value="email">Email</option>
          </select>

          <button type="submit">Criar alerta</button>
          <button type="button" onClick={evaluateNow} style={{ marginLeft: 8 }}>Avaliar agora</button>
        </form>
      </section>

      <section>
        <h2>Eventos de Alertas</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Métrica</th>
              <th>Valor atual</th>
              <th>Valor anterior</th>
              <th>Variação (%)</th>
              <th>Data</th>
            </tr>
          </thead>
          <tbody>
            {events.map(ev => (
              <tr key={ev.id}>
                <td>{ev.clientId}</td>
                <td>{ev.metric}</td>
                <td>{ev.currentValue}</td>
                <td>{ev.previousValue}</td>
                <td>{ev.changePercent?.toFixed ? ev.changePercent.toFixed(2) : ev.changePercent}</td>
                <td>{new Date(ev.createdAt).toLocaleString('pt-BR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}
