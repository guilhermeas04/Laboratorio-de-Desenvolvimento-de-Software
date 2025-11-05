import PageHeader from '../components/PageHeader'
import { useAuth } from '../context/Auth'
import { useMemo, useState } from 'react'

type TxAluno = { id: number; data: string; descricao: string; origem?: string; valor: number; tipo: 'recebimento' | 'resgate' }

export default function Transactions() {
  const { user } = useAuth()

  // Dados de exemplo até integrar com backend
  const data: TxAluno[] = [
    { id: 1, data: '2025-10-02', descricao: 'Reconhecimento: Projeto X', origem: 'Prof. João', valor: 250, tipo: 'recebimento' },
    { id: 2, data: '2025-10-05', descricao: 'Resgate: Curso Online', valor: -300, tipo: 'resgate' },
    { id: 3, data: '2025-10-10', descricao: 'Reconhecimento: Monitoria', origem: 'Prof. Carla', valor: 150, tipo: 'recebimento' },
  ]

  const [q, setQ] = useState('')
  const [tipo, setTipo] = useState<'todos' | 'recebimento' | 'resgate'>('todos')
  const [de, setDe] = useState('')
  const [ate, setAte] = useState('')

  const filtradas = useMemo(() => {
    return data.filter(t => {
      if (tipo !== 'todos' && t.tipo !== tipo) return false
      if (q && !(`${t.descricao} ${t.origem || ''}`.toLowerCase().includes(q.toLowerCase()))) return false
      if (de && t.data < de) return false
      if (ate && t.data > ate) return false
      return true
    })
  }, [data, q, tipo, de, ate])

  const saldo = data.reduce((acc, t) => acc + t.valor, 0)
  const creditos30 = data.filter(t => t.tipo === 'recebimento').reduce((a, b) => a + b.valor, 0)
  const debitos30 = data.filter(t => t.tipo === 'resgate').reduce((a, b) => a + Math.abs(b.valor), 0)

  if (!user) return <div className="text-center py-8">Faça login para ver seu extrato.</div>

  return (
    <div className="space-y-6">
      <PageHeader title="Extrato" action={<span className="text-sm text-slate-500">Aluno</span>} />

      <div className="grid md:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="text-xs text-slate-500">Saldo Atual</div>
          <div className="text-2xl font-semibold">{saldo} moedas</div>
          <div className="text-xs text-slate-400 mt-1">Disponível para resgate</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-slate-500">Recebidas</div>
          <div className="text-2xl font-semibold">{creditos30}</div>
          <div className="text-xs text-slate-400 mt-1">Últimos lançamentos</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-slate-500">Resgatadas</div>
          <div className="text-2xl font-semibold">{debitos30}</div>
          <div className="text-xs text-slate-400 mt-1">Últimos lançamentos</div>
        </div>
      </div>

      <div className="card p-4">
        <div className="grid md:grid-cols-4 gap-3 mb-4">
          <input className="input" placeholder="Buscar por descrição/origem" value={q} onChange={e => setQ(e.target.value)} />
          <select className="input" value={tipo} onChange={e => setTipo(e.target.value as any)}>
            <option value="todos">Todos</option>
            <option value="recebimento">Recebimento</option>
            <option value="resgate">Resgate</option>
          </select>
          <input className="input" type="date" value={de} onChange={e => setDe(e.target.value)} />
          <input className="input" type="date" value={ate} onChange={e => setAte(e.target.value)} />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500">
                <th className="py-2">Data</th>
                <th>Descrição</th>
                <th>Origem</th>
                <th className="text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtradas.length === 0 ? (
                <tr><td colSpan={4} className="py-6 text-center text-slate-500">Nenhuma transação encontrada</td></tr>
              ) : (
                filtradas.map(t => (
                  <tr key={t.id}>
                    <td className="py-2">{t.data}</td>
                    <td>{t.descricao}</td>
                    <td>{t.origem || '-'}</td>
                    <td className={`text-right ${t.valor >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{t.valor >= 0 ? `+${t.valor}` : t.valor}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
