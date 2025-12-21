import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useParams } from 'react-router-dom'

export default function FinanceDetail() {
  const { id } = useParams()
  const [item, setItem] = useState<any>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const res = await axios.get(`/api/finance/receivables/${id}`)
        setItem(res.data)
      } catch (err) {
        console.error('Erro ao carregar item financeiro:', err)
        setError('Falha ao carregar item financeiro.')
      }
    }
    load()
  }, [id])

  if (error) return <div className="error">{error}</div>
  if (!item) return <div>Carregando...</div>

  return (
    <div className="page">
      <h1>Recebível: {item.id}</h1>
      <section className="card">
        <div>Cliente: {item.client?.name || item.clientId}</div>
        <div>Contrato: {item.contractId}</div>
        <div>Vencimento: {new Date(item.dueDate).toLocaleDateString('pt-BR')}</div>
        <div>Valor: R$ {Number(item.amount).toFixed(2)}</div>
        <div>Pago: {item.paid ? 'Sim' : 'Não'}</div>
      </section>
    </div>
  )
}
