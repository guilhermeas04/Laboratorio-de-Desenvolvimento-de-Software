import PageHeader from '../components/PageHeader'
import { useAuth } from '../context/Auth'
import { useEffect, useMemo, useState } from 'react'
import { transacoesAPI, alunosAPI, TransacaoDTO } from '../lib/api'
import { useToast } from '../hooks/use-toast'

export default function Transactions() {
  const { user } = useAuth()
  const { error } = useToast()
  const [transacoes, setTransacoes] = useState<TransacaoDTO[]>([])
  const [saldoAtual, setSaldoAtual] = useState(0)
  const [loading, setLoading] = useState(true)

  const [q, setQ] = useState('')
  const [tipo, setTipo] = useState<'todos' | 'ENVIO' | 'RESGATE'>('todos')
  const [de, setDe] = useState('')
  const [ate, setAte] = useState('')

  useEffect(() => {
    async function loadData() {
      if (!user?.id) return

      try {
        // Carregar transações do aluno
        const txs = await transacoesAPI.listarPorAluno(user.id)
        setTransacoes(Array.isArray(txs) ? txs : [])

        // Carregar saldo atual
        const aluno = await alunosAPI.buscarPorId(user.id)
        setSaldoAtual(aluno.saldoMoedas || 0)
      } catch (err) {
        error('Erro ao carregar transações')
        console.error(err)
        setTransacoes([])
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [user, error])

  const filtradas = useMemo(() => {
    return transacoes.filter(t => {
      if (tipo !== 'todos' && t.tipo !== tipo) return false
      if (q && !(`${t.motivo} ${t.usuarioNome || ''}`.toLowerCase().includes(q.toLowerCase()))) return false
      if (de && t.data < de) return false
      if (ate && t.data > ate) return false
      return true
    })
  }, [transacoes, q, tipo, de, ate])

  const creditos = transacoes.filter(t => t.tipo === 'ENVIO').reduce((a, b) => a + b.valor, 0)
  const debitos = transacoes.filter(t => t.tipo === 'RESGATE').reduce((a, b) => a + b.valor, 0)

  if (loading) return <div className="text-center py-8">Carregando...</div>
  if (!user) return <div className="text-center py-8">Faça login para ver seu extrato.</div>

  return (
    <div className="space-y-6">
      <PageHeader title="Extrato" action={<span className="text-sm text-slate-500">Aluno</span>} />

      <div className="grid md:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="text-xs text-slate-500">Saldo Atual</div>
          <div className="text-2xl font-semibold">{saldoAtual} moedas</div>
          <div className="text-xs text-slate-400 mt-1">Disponível para resgate</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-slate-500">Recebidas</div>
          <div className="text-2xl font-semibold">{creditos}</div>
          <div className="text-xs text-slate-400 mt-1">Total recebido</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-slate-500">Resgatadas</div>
          <div className="text-2xl font-semibold">{debitos}</div>
          <div className="text-xs text-slate-400 mt-1">Total gasto</div>
        </div>
      </div>

      <div className="card p-4">
        <div className="grid md:grid-cols-4 gap-3 mb-4">
          <input className="input" placeholder="Buscar por descrição/origem" value={q} onChange={e => setQ(e.target.value)} />
          <select className="input" value={tipo} onChange={e => setTipo(e.target.value as any)}>
            <option value="todos">Todos</option>
            <option value="ENVIO">Recebimento</option>
            <option value="RESGATE">Resgate</option>
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
                filtradas.map(t => {
                  const dataFormatada = new Date(t.data).toLocaleDateString('pt-BR')
                  const isNegative = t.tipo === 'RESGATE'
                  return (
                    <tr key={t.id}>
                      <td className="py-2">{dataFormatada}</td>
                      <td>{t.motivo}</td>
                      <td>{t.usuarioNome || t.empresaNome || '-'}</td>
                      <td className={`text-right ${isNegative ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {isNegative ? `-${t.valor}` : `+${t.valor}`}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
