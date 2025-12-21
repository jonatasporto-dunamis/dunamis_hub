import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useParams } from 'react-router-dom'

export default function UserDetail() {
  const { id } = useParams()
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const res = await axios.get(`/api/users/${id}`)
        setUser(res.data)
      } catch (err) {
        console.error('Erro ao carregar usuário:', err)
        setError('Falha ao carregar usuário.')
      }
    }
    load()
  }, [id])

  if (error) return <div className="error">{error}</div>
  if (!user) return <div>Carregando...</div>

  return (
    <div className="page">
      <h1>Usuário: {user.name}</h1>
      <section className="card">
        <div>Email: {user.email}</div>
        <div>Função: {user.role}</div>
        <div>Ativo: {user.active ? 'Sim' : 'Não'}</div>
      </section>
    </div>
  )
}
