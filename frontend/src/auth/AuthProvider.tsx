import React, { createContext, useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { Navigate } from 'react-router-dom'

type User = { id: number; name: string; email: string; role: string }

type AuthContextType = {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  hasRole: (roles: string[] | string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem('user')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))

  useEffect(() => {
    if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    else delete axios.defaults.headers.common['Authorization']
  }, [token])

  async function login(email: string, password: string) {
    const res = await axios.post('/api/auth/login', { email, password })
    const t = res.data.token
    const u = res.data.user
    localStorage.setItem('token', t)
    localStorage.setItem('user', JSON.stringify(u))
    setToken(t)
    setUser(u)
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
    // navigate to login handled by pages where needed
  }

  function hasRole(roles: string[] | string) {
    if (!user) return false
    if (typeof roles === 'string') return user.role === roles
    return roles.includes(user.role)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const auth = useAuth()
  if (!auth.user) return <Navigate to="/" replace />
  if (allowedRoles && !auth.hasRole(allowedRoles)) return <div className="error">Acesso negado: você não tem permissão para acessar esta página.</div>
  return <>{children}</>
}
