import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function Users() {
  const [users, setUsers] = useState<any[]>([])
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'VIEWER' })

  useEffect(() => {
    async function load() {
      try {
        const res = await axios.get('/api/users')
        setUsers(res.data)
      } catch (err) {
        console.error(err)
      }
    }
    load()
  }, [])

  async function createUser(e: React.FormEvent) {
    e.preventDefault()
    try {
      await axios.post('/api/users', form)
      setForm({ name: '', email: '', password: '', role: 'VIEWER' })
      const res = await axios.get('/api/users')
      setUsers(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="page">
      <h1>Usuários</h1>
      <section>
        <h2>Criar Usuário</h2>
        <form onSubmit={createUser} className="card">
          <label>Nome</label>
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <label>Email</label>
          <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          <label>Senha</label>
          <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
          <label>Função</label>
          <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
            <option value="ADMIN">Admin</option>
            <option value="TRAFFIC_MANAGER">Traffic Manager</option>
            <option value="FINANCIAL">Financial</option>
            <option value="VIEWER">Viewer</option>
          </select>
          <button type="submit">Criar</button>
        </form>
      </section>

      <section>
        <h2>Lista de Usuários</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Função</th>
              <th>Ativo</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>{u.active ? 'Sim' : 'Não'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}
