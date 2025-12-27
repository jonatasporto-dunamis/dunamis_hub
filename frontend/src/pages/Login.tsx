import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles.css'
import { useAuth } from '../auth/AuthProvider'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const auth = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      await auth.login(email, password)
      navigate('/dashboard')
    } catch (err: any) {
      setError('Falha ao autenticar. Verifique suas credenciais e tente novamente.')
    }
  }

  return (
    <div className="auth-page">
      <h1>Dunamis Hub</h1>
      <form onSubmit={handleSubmit} className="card">
        <label>Usuário (email)</label>
        <input value={email} onChange={e => setEmail(e.target.value)} />
        <label>Senha</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
        {error && <div className="error">{error}</div>}
        <button type="submit">Entrar</button>
      </form>
    </div>
  )
}
