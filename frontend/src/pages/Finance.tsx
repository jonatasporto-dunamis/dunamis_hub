import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function Finance() {
  const [contracts, setContracts] = useState<any[]>([])
  const [receivables, setReceivables] = useState<any[]>([])

  useEffect(() => {
    async function load() {
      try {
        const [c, r] = await Promise.all([axios.get('/api/finance/contracts'), axios.get('/api/finance/receivables')])
        setContracts(c.data)
        setReceivables(r.data)
      } catch (err) {
        console.error(err)
      }
    }
    load()
  }, [])

  return (
    <div className="page">
      <h1>Financeiro</h1>
      <section>
        <h2>Contratos</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Valor mensal</th>
              <th>Dia de faturamento</th>
              <th>Início</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {contracts.map(c => (
              <tr key={c.id}>
                <td>{c.client?.name || c.clientId}</td>
                <td>R$ {Number(c.monthlyValue).toFixed(2)}</td>
                <td>{c.billingDay}</td>
                <td>{new Date(c.startDate).toLocaleDateString('pt-BR')}</td>
                <td>{c.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2>Contas a Receber</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Contrato</th>
              <th>Vencimento</th>
              <th>Valor</th>
              <th>Pago</th>
            </tr>
          </thead>
          <tbody>
            {receivables.map(r => (
              <tr key={r.id}>
                <td>{r.client?.name || r.clientId}</td>
                <td>{r.contract?.id || r.contractId}</td>
                <td>{new Date(r.dueDate).toLocaleDateString('pt-BR')}</td>
                <td>R$ {Number(r.amount).toFixed(2)}</td>
                <td>{r.paid ? 'Sim' : 'Não'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}
