import React, { useState } from 'react'
import axios from 'axios'
import '../styles.css'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const res = await axios.post('/api/auth/login', { email, password })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`
      window.location.href = '/dashboard'
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
