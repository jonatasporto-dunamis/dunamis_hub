import React from 'react'
import { Link, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'

export default function Layout() {
  const auth = useAuth()
  const user = auth.user

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ width: 220, padding: 16, background: '#f5f7fb' }}>
        <h3>Dunamis Hub</h3>
        <div style={{ marginBottom: 12 }}>
          {user ? (
            <div>
              <div><strong>{user.name}</strong></div>
              <div style={{ fontSize: 12 }}>{user.role}</div>
            </div>
          ) : null}
        </div>
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
        <div style={{ marginTop: 16 }}>
          {user ? (
            <button onClick={() => auth.logout()} style={{ padding: '6px 8px', cursor: 'pointer' }}>Sair</button>
          ) : null}
        </div>
      </aside>
      <main style={{ flex: 1, padding: 20 }}>
        <Outlet />
      </main>
    </div>
  )
}
