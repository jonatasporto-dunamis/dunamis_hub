import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'

export default function Clients() {
  const [clients, setClients] = useState<any[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const res = await axios.get('/api/clients')
        setClients(res.data)
      } catch (e) {
        setError('Erro ao carregar clientes.')
      }
    }
    load()
  }, [])

  return (
    <div className="page">
      <h1>Clientes</h1>
      {error && <div className="error">{error}</div>}
      <table className="table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Razão Social</th>
            <th>Documento</th>
            <th>Status</th>
            <th>Criado em</th>
          </tr>
        </thead>
        <tbody>
          {clients.map(c => (
            <tr key={c.id}>
              <td><Link to={`/clients/${c.id}`}>{c.name}</Link></td>
              <td>{c.legalName || '-'}</td>
              <td>{c.document || '-'}</td>
              <td>{c.status}</td>
              <td>{new Date(c.createdAt).toLocaleDateString('pt-BR')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
