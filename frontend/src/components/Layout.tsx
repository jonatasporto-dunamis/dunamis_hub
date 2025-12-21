import React from 'react'
import { Link, Outlet } from 'react-router-dom'

export default function Layout() {
  const userRaw = localStorage.getItem('user')
  const user = userRaw ? JSON.parse(userRaw) : null

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ width: 220, padding: 16, background: '#f5f7fb' }}>
        <h3>Dunamis Hub</h3>
        <nav>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li><Link to="/dashboard">Visão Geral</Link></li>
            <li><Link to="/clients">Clientes</Link></li>
            <li><Link to="/alerts">Alertas</Link></li>
            <li><Link to="/projects">Projetos</Link></li>
            <li><Link to="/finance">Financeiro</Link></li>
            {user && user.role === 'ADMIN' && <li><Link to="/users">Usuários</Link></li>}
          </ul>
        </nav>
      </aside>
      <main style={{ flex: 1, padding: 20 }}>
        <Outlet />
      </main>
    </div>
  )
}
