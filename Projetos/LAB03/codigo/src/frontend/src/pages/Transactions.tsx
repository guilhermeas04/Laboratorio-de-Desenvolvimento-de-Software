import PageHeader from '../components/PageHeader'
import { useAuth } from '../context/Auth'
import { useMemo, useState, useEffect } from 'react'
import { transacoesAPI, TransacaoDTO, alunosAPI } from '../lib/api'
import { useToast } from '../hooks/use-toast'
import { ArrowDownLeft, ArrowUpRight, Coins, ShoppingBag, User } from 'lucide-react'

export default function Transactions() {
  const { user } = useAuth()
  const { error } = useToast()
  const [transacoes, setTransacoes] = useState<TransacaoDTO[]>([])
  const [saldoAtual, setSaldoAtual] = useState(0)
  const [loading, setLoading] = useState(true)

  const [q, setQ] = useState('')
  const [tipo, setTipo] = useState<'todos' | 'ENVIO' | 'RESGATE' | 'CREDITO'>('todos')
  const [de, setDe] = useState('')
  const [ate, setAte] = useState('')

  useEffect(() => {
    if (user && user.role === 'aluno') {
      loadData()
    }
  }, [user])

  async function loadData() {
    try {
      setLoading(true)
      if (user && user.role === 'aluno') {
        // Load transactions
        const txs = await transacoesAPI.listarPorAluno(user.id)
        setTransacoes(txs)

        // Load current balance
        const aluno = await alunosAPI.buscarPorId(user.id)
        setSaldoAtual(aluno.saldoMoedas)
      }
    } catch (err) {
      error('Erro ao carregar transações')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filtradas = useMemo(() => {
    return transacoes.filter(t => {
      if (tipo !== 'todos' && t.tipo !== tipo) return false
      const searchText = `${t.motivo} ${t.usuarioNome || ''}`.toLowerCase()
      if (q && !searchText.includes(q.toLowerCase())) return false
      const dataStr = new Date(t.data).toISOString().split('T')[0]
      if (de && dataStr < de) return false
      if (ate && dataStr > ate) return false
      return true
    })
  }, [transacoes, q, tipo, de, ate])

  const creditos30 = transacoes
    .filter(t => user?.id === t.usuarioDestinoId) // Aluno é o destinatário = recebeu
    .reduce((a, b) => a + Math.abs(b.valor), 0)

  const debitos30 = transacoes
    .filter(t => user?.id === t.usuarioId) // Aluno é o remetente = gastou/resgatou
    .reduce((a, b) => a + Math.abs(b.valor), 0)

  if (!user) return <div className="text-center py-8">Faça login para ver seu extrato.</div>
  if (loading) return <div className="text-center py-8">Carregando...</div>

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Extrato de Moedas" 
        action={
          <span className="text-sm text-slate-500">
            {transacoes.length} {transacoes.length === 1 ? 'transação' : 'transações'}
          </span>
        } 
      />

      <div className="grid md:grid-cols-3 gap-4">
        <div className="card p-4 bg-gradient-to-br from-blue-50 to-white border-blue-200">
          <div className="flex items-center gap-2 text-xs text-blue-600 uppercase tracking-wide mb-2">
            <Coins size={16} />
            <span>Saldo Atual</span>
          </div>
          <div className="text-2xl font-bold text-blue-900">{saldoAtual}</div>
          <div className="text-xs text-blue-600 mt-1">moedas disponíveis</div>
        </div>

        <div className="card p-4 bg-gradient-to-br from-green-50 to-white border-green-200">
          <div className="flex items-center gap-2 text-xs text-green-600 uppercase tracking-wide mb-2">
            <ArrowDownLeft size={16} />
            <span>Total Recebido</span>
          </div>
          <div className="text-2xl font-bold text-green-900">{creditos30}</div>
          <div className="text-xs text-green-600 mt-1">moedas recebidas</div>
        </div>

        <div className="card p-4 bg-gradient-to-br from-red-50 to-white border-red-200">
          <div className="flex items-center gap-2 text-xs text-red-600 uppercase tracking-wide mb-2">
            <ShoppingBag size={16} />
            <span>Total Resgatado</span>
          </div>
          <div className="text-2xl font-bold text-red-900">{debitos30}</div>
          <div className="text-xs text-red-600 mt-1">moedas utilizadas</div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="font-semibold text-lg mb-4">Filtros</h3>
        <div className="grid md:grid-cols-4 gap-3 mb-6">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Buscar por descrição
            </label>
            <input 
              className="input w-full" 
              placeholder="Digite para buscar..." 
              value={q} 
              onChange={e => setQ(e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Tipo de transação
            </label>
            <select 
              className="input w-full" 
              value={tipo} 
              onChange={e => setTipo(e.target.value as any)}
            >
              <option value="todos">Todas</option>
              <option value="ENVIO">Recebimento</option>
              <option value="RESGATE">Resgate</option>
              <option value="CREDITO">Crédito</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Data inicial
            </label>
            <input 
              className="input w-full" 
              type="date" 
              value={de} 
              onChange={e => setDe(e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Data final
            </label>
            <input 
              className="input w-full" 
              type="date" 
              value={ate} 
              onChange={e => setAte(e.target.value)} 
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-600 bg-slate-50 border-b-2 border-slate-200">
                <th className="py-3 px-4 font-semibold">Data</th>
                <th className="py-3 px-4 font-semibold">De</th>
                <th className="py-3 px-4 font-semibold">Descrição</th>
                <th className="py-3 px-4 font-semibold">Tipo</th>
                <th className="py-3 px-4 text-right font-semibold">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtradas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <div className="text-slate-400">
                      <Coins size={48} className="mx-auto mb-2 opacity-30" />
                      <p className="font-medium">Nenhuma transação encontrada</p>
                      <p className="text-xs mt-1">
                        {transacoes.length === 0 
                          ? 'Você ainda não possui transações' 
                          : 'Tente ajustar os filtros de busca'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtradas.map(t => {
                  const dataStr = new Date(t.data).toLocaleDateString('pt-BR')
                  
                  // Se o aluno logado é o destinatário (usuarioDestinoId), ele RECEBEU moedas (positivo/verde)
                  // Se o aluno logado é o remetente (usuarioId), ele ENVIOU/RESGATOU moedas (negativo/vermelho)
                  const isDestinario = user?.id === t.usuarioDestinoId
                  const isReceived = isDestinario // Se é destinatário, recebeu
                  const valorDisplay = isReceived ? Math.abs(t.valor) : -Math.abs(t.valor)
                  const isPositive = valorDisplay >= 0
                  
                  return (
                    <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <span className="text-slate-700">{dataStr}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                            <User size={16} className="text-slate-600" />
                          </div>
                          <span className="font-medium text-slate-900">
                            {t.usuarioNome || 'Sistema'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-slate-600">{t.motivo || 'Sem descrição'}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          isReceived ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {isReceived ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
                          {isReceived ? 'Recebido' : 'Resgatado'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={`inline-flex items-center gap-1 font-semibold ${
                          isPositive ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {isPositive ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                          {isPositive ? `+${valorDisplay}` : valorDisplay} moedas
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {filtradas.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-center text-sm text-slate-600">
            <span>
              Mostrando {filtradas.length} de {transacoes.length} {transacoes.length === 1 ? 'transação' : 'transações'}
            </span>
            <div className="flex gap-4">
              <span>
                Recebidas: <span className="font-semibold text-green-600">
                  +{filtradas.filter(t => user?.id === t.usuarioDestinoId).reduce((acc, t) => acc + Math.abs(t.valor), 0)} moedas
                </span>
              </span>
              <span>
                Resgatadas: <span className="font-semibold text-red-600">
                  -{filtradas.filter(t => user?.id === t.usuarioId).reduce((acc, t) => acc + Math.abs(t.valor), 0)} moedas
                </span>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
