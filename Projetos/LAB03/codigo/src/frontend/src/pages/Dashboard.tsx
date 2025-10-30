import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { alunosAPI, transacoesAPI, TransacaoDTO, vantagensAPI, VantagemDTO } from '../lib/api'
import { useAuth } from '../context/Auth'
import { useToast } from '../hooks/use-toast'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { error } = useToast()
  const [aluno, setAluno] = useState<any>(null)
  const [transacoes, setTransacoes] = useState<TransacaoDTO[]>([])
  const [vantagens, setVantagens] = useState<VantagemDTO[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        // Prefer authenticated user if available
        if (user && user.id) {
          const a = await alunosAPI.buscarPorId(user.id)
          setAluno(a)

          // Load real transactions
          const txs = await transacoesAPI.listarPorAluno(user.id)
          // Get last 5 transactions ordered by date
          const recentTxs = txs
            .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
            .slice(0, 5)
          setTransacoes(recentTxs)

          // Load real advantages
          const vants = await vantagensAPI.listar()
          // Get first 3 advantages
          setVantagens(vants.slice(0, 3))
        } else {
          const alunos = await alunosAPI.listar()
          if (alunos.length > 0) setAluno(alunos[0])
        }
      } catch (err) {
        error('Erro ao carregar dados do dashboard')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [error, user])

  if (loading) return <div className="text-center py-8">Carregando...</div>
  if (!aluno) return <div className="text-center py-8">Nenhum aluno encontrado</div>

  const saldoTotal = aluno.saldoMoedas || 0
  
  // Calculate received: when user is the DESTINATION (usuarioDestinoId)
  const recebidas = transacoes
    .filter(t => user?.id === t.usuarioDestinoId)
    .reduce((a, b) => a + Math.abs(b.valor), 0)
  
  // Calculate spent: when user is the SENDER (usuarioId)
  const resgatadas = transacoes
    .filter(t => user?.id === t.usuarioId)
    .reduce((a, b) => a + Math.abs(b.valor), 0)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: profile summary */}
      <div className="lg:col-span-1">
        <div className="card p-5 sticky top-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xl font-semibold">{(aluno.nome || 'U').charAt(0)}</div>
            <div>
              <div className="text-lg font-semibold">{aluno.nome}</div>
              <div className="text-sm text-slate-500">{aluno.email}</div>
            </div>
          </div>

          <div className="mt-5">
            <div className="text-sm text-slate-500">Saldo atual</div>
            <div className="text-3xl font-bold mt-1">{saldoTotal} <span className="text-sm font-medium">moedas</span></div>
            <div className="mt-4">
              <div className="text-sm text-slate-600 mb-2">Progresso para próxima vantagem</div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div className="bg-sky-600 h-3 rounded-full" style={{ width: `${Math.min(100, (saldoTotal / 1000) * 100)}%` }} />
              </div>
              <div className="text-xs text-slate-500 mt-2">{Math.min(100, Math.round((saldoTotal / 1000) * 100))}%</div>
            </div>

            <div className="mt-4 flex gap-2">
              <button className="btn w-full" onClick={() => navigate('/vantagens')}>Ver Vantagens</button>
              <button className="btn bg-slate-200 text-slate-800 hover:bg-slate-300" onClick={() => navigate('/perfil')}>Editar</button>
            </div>
          </div>
        </div>
      </div>

      {/* Right: stats, transactions and featured advantages */}
      <div className="lg:col-span-2 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card p-5">
            <div className="text-sm text-slate-500">Saldo Total</div>
            <div className="text-2xl font-semibold mt-1">{saldoTotal} moedas</div>
            <div className="text-xs text-slate-400 mt-2">Disponível para resgate</div>
          </div>
          <div className="card p-5">
            <div className="text-sm text-slate-500">Recebidas (30d)</div>
            <div className="text-2xl font-semibold mt-1">{recebidas}</div>
            <div className="text-xs text-slate-400 mt-2">Nos últimos 30 dias</div>
          </div>
          <div className="card p-5">
            <div className="text-sm text-slate-500">Resgatadas (30d)</div>
            <div className="text-2xl font-semibold mt-1">{resgatadas}</div>
            <div className="text-xs text-slate-400 mt-2">Nos últimos 30 dias</div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="font-medium">Histórico de Transações</div>
            <button className="text-sm text-sky-600 hover:underline" onClick={() => navigate('/transactions')}>Ver tudo</button>
          </div>
          <div className="divide-y">
            {transacoes.length === 0 ? (
              <div className="py-6 text-center text-slate-500">Nenhuma transação encontrada</div>
            ) : (
              transacoes.map((t) => {
                // Se o aluno logado é o destinatário, ele RECEBEU (positivo/verde)
                // Se o aluno logado é o remetente, ele GASTOU (negativo/vermelho)
                const isDestinario = user?.id === t.usuarioDestinoId
                const isPositive = isDestinario
                const displayValue = isPositive ? Math.abs(t.valor) : -Math.abs(t.valor)
                const titulo = isPositive
                  ? `Recebido de ${t.usuarioNome || 'Professor'}` 
                  : 'Resgate de vantagem'
                const subtitulo = t.motivo || new Date(t.data).toLocaleDateString('pt-BR')
                
                return (
                  <div key={t.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-md flex items-center justify-center text-white ${
                        isPositive ? 'bg-green-500' : 'bg-red-500'
                      }`}>
                        {isPositive ? '+' : '-'}
                      </div>
                      <div>
                        <div className="font-medium">{titulo}</div>
                        <div className="text-sm text-slate-500">{subtitulo}</div>
                      </div>
                    </div>
                    <div className={`font-medium ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {displayValue >= 0 ? `+${displayValue}` : displayValue}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="font-medium">Vantagens em Destaque</div>
            <button className="text-sm text-sky-600 hover:underline" onClick={() => navigate('/vantagens')}>Marketplace</button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {vantagens.length === 0 ? (
              <div className="col-span-3 text-center text-slate-500 py-8">Nenhuma vantagem disponível</div>
            ) : (
              vantagens.map((v) => (
                <div className="card overflow-hidden" key={v.id}>
                  <div className="h-36 bg-gradient-to-br from-slate-100 to-white flex items-center justify-center text-slate-400">{v.foto ? <img src={v.foto} alt={v.descricao} className="w-full h-full object-cover" /> : 'Imagem'}</div>
                  <div className="p-4">
                    <div className="font-medium">{v.descricao}</div>
                    <div className="text-sm text-slate-500 mb-3">{v.custoMoedas} moedas</div>
                    <div className="flex gap-2">
                      <button className="btn" onClick={() => navigate(`/vantagens/${v.id}`)}>Ver detalhes</button>
                      <button className="btn bg-sky-600 text-white" onClick={() => {/* quick redeem could be added */}}>Resgatar</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
