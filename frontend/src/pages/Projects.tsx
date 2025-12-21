import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function Projects() {
  const [projects, setProjects] = useState<any[]>([])
  const [clientId, setClientId] = useState<number | ''>('')
  const [clients, setClients] = useState<any[]>([])
  const [title, setTitle] = useState('')

  useEffect(() => {
    async function load() {
      const [p, c] = await Promise.all([axios.get('/api/projects'), axios.get('/api/clients')])
      setProjects(p.data)
      setClients(c.data)
    }
    load()
  }, [])

  async function createProject(e: React.FormEvent) {
    e.preventDefault()
    if (!clientId || !title) return
    await axios.post('/api/projects', { clientId, name: title })
    const res = await axios.get('/api/projects')
    setProjects(res.data)
    setTitle('')
  }

  return (
    <div className="page">
      <h1>Projetos</h1>
      <section>
        <h2>Criar Projeto</h2>
        <form onSubmit={createProject} className="card">
          <label>Cliente</label>
          <select value={clientId as any} onChange={e => setClientId(Number(e.target.value) || '')}>
            <option value="">Selecione</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <label>Nome do projeto</label>
          <input value={title} onChange={e => setTitle(e.target.value)} />
          <button type="submit">Criar</button>
        </form>
      </section>

      <section>
        <h2>Lista de Projetos</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Nome</th>
              <th>Status</th>
              <th>Criado em</th>
            </tr>
          </thead>
          <tbody>
            {projects.map(p => (
              <tr key={p.id}>
                <td>{p.clientId}</td>
                <td>{p.name}</td>
                <td>{p.status}</td>
                <td>{new Date(p.createdAt).toLocaleDateString('pt-BR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}
