import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useParams } from 'react-router-dom'

export default function ProjectDetail() {
  const { id } = useParams()
  const [project, setProject] = useState<any>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const res = await axios.get(`/api/projects/${id}`)
        setProject(res.data)
      } catch (err) {
        console.error('Erro ao carregar detalhe do projeto:', err)
        setError('Falha ao carregar projeto.')
      }
    }
    load()
  }, [id])

  if (error) return <div className="error">{error}</div>
  if (!project) return <div>Carregando...</div>

  return (
    <div className="page">
      <h1>Projeto: {project.name}</h1>
      <section className="card">
        <div>Cliente: {project.client?.name || project.clientId}</div>
        <div>Status: {project.status}</div>
        <div>Criado em: {new Date(project.createdAt).toLocaleDateString('pt-BR')}</div>
      </section>
      <section className="card">
        <h2>Tarefas</h2>
        <ul>
          {(project.tasks || []).map((t: any) => (
            <li key={t.id}>{t.title} - {t.status}</li>
          ))}
        </ul>
      </section>
    </div>
  )
}
