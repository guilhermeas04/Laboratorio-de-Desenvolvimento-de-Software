import PageHeader from '../components/PageHeader'
import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../context/Auth'
import { professoresAPI, transacoesAPI, TransacaoDTO } from '../lib/api'
import { useToast } from '../hooks/use-toast'

export default function ProfessorHistorico() {
  const { user } = useAuth()
  const { error } = useToast()
  const [transacoes, setTransacoes] = useState<TransacaoDTO[]>([])
  const [saldoAtual, setSaldoAtual] = useState(0)
  const [loading, setLoading] = useState(true)

  const [q, setQ] = useState('')
  const [de, setDe] = useState('')
  const [ate, setAte] = useState('')

  useEffect(() => {
    loadData()
  }, [user])

  async function loadData() {
    if (!user || user.role !== 'professor') return

    try {
      setLoading(true)

      // Load professor balance
      const prof = await professoresAPI.buscarPorId(user.id)
      setSaldoAtual(prof.saldoMoedas || 0)

      // Load professor's transactions
      const txs = await transacoesAPI.listarPorProfessor(user.id)
      setTransacoes(txs)
    } catch (err) {
      error('Erro ao carregar histórico')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filtradas = useMemo(() => {
    return transacoes.filter(t => {
      const searchText = `${t.usuarioNome || ''} ${t.motivo}`.toLowerCase()
      if (q && !searchText.includes(q.toLowerCase())) return false
      const dataStr = new Date(t.data).toISOString().split('T')[0]
      if (de && dataStr < de) return false
      if (ate && dataStr > ate) return false
      return true
    })
  }, [transacoes, q, de, ate])

  const totalEnviado = transacoes
    .filter(t => t.tipo === 'ENVIO')
    .reduce((a, b) => a + b.valor, 0)
  
  const alunosAtendidos = new Set(
    transacoes.filter(t => t.tipo === 'ENVIO').map(x => x.usuarioId)
  ).size

  const LIMITE_SEMESTRE = 1000

  if (loading) {
    return <div className="text-center py-8">Carregando...</div>
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Extrato do Professor" action={<span className="text-sm text-slate-500">Envios</span>} />

      <div className="grid md:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="text-xs text-slate-500">Saldo disponível</div>
          <div className="text-2xl font-semibold">{saldoAtual} moedas</div>
          <div className="text-xs text-slate-400 mt-1">Limite semestral: {LIMITE_SEMESTRE}</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-slate-500">Total Enviado</div>
          <div className="text-2xl font-semibold">{totalEnviado}</div>
          <div className="text-xs text-slate-400 mt-1">No período</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-slate-500">Alunos Reconhecidos</div>
          <div className="text-2xl font-semibold">{alunosAtendidos}</div>
          <div className="text-xs text-slate-400 mt-1">Únicos</div>
        </div>
      </div>

      <div className="card p-4">
        <div className="grid md:grid-cols-3 gap-3 mb-4">
          <input className="input" placeholder="Buscar por aluno/motivo" value={q} onChange={e => setQ(e.target.value)} />
          <input className="input" type="date" value={de} onChange={e => setDe(e.target.value)} />
          <input className="input" type="date" value={ate} onChange={e => setAte(e.target.value)} />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500">
                <th className="py-2">Data</th>
                <th>Aluno</th>
                <th>Motivo</th>
                <th className="text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtradas.length === 0 ? (
                <tr><td colSpan={4} className="py-6 text-center text-slate-500">Nenhuma transferência encontrada</td></tr>
              ) : (
                filtradas.map(t => {
                  const dataStr = new Date(t.data).toLocaleDateString('pt-BR')
                  return (
                    <tr key={t.id}>
                      <td className="py-2">{dataStr}</td>
                      <td>{t.usuarioNome || `Aluno #${t.usuarioId}`}</td>
                      <td>{t.motivo}</td>
                      <td className="text-right text-rose-600">-{t.valor}</td>
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
