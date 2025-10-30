import PageHeader from '../components/PageHeader'
import { useMemo, useState } from 'react'
import { useAuth } from '../context/Auth'
import { useProfessor } from '../hooks/useProfessores'
import { useTransacoesProfessor } from '../hooks/useTransacoes'
import { ArrowUpRight, Calendar, User, FileText } from 'lucide-react'

export default function ProfessorHistorico() {
  const { user } = useAuth()
  const { data: professor, isLoading: loadingProfessor } = useProfessor(user?.id)
  const { data: transacoes = [], isLoading: loadingTransacoes } = useTransacoesProfessor(user?.id)

  const [q, setQ] = useState('')
  const [de, setDe] = useState('')
  const [ate, setAte] = useState('')

  const filtradas = useMemo(() => {
    return transacoes.filter(t => {
      const searchText = `${t.usuarioDestinoNome || ''} ${t.motivo || ''}`.toLowerCase()
      if (q && !searchText.includes(q.toLowerCase())) return false
      
      const dataTransacao = new Date(t.data).toISOString().split('T')[0]
      if (de && dataTransacao < de) return false
      if (ate && dataTransacao > ate) return false
      
      return true
    })
  }, [transacoes, q, de, ate])

  const totalEnviado = transacoes.reduce((acc, t) => acc + t.valor, 0)
  const alunosAtendidos = new Set(
    transacoes
      .filter(t => t.usuarioDestinoNome)
      .map(t => t.usuarioDestinoNome)
  ).size

  const isLoading = loadingProfessor || loadingTransacoes

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Histórico de Envios" 
        action={
          <span className="text-sm text-slate-500">
            {transacoes.length} {transacoes.length === 1 ? 'transação' : 'transações'}
          </span>
        } 
      />

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-slate-600 mt-2">Carregando histórico...</p>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="card p-4 bg-gradient-to-br from-blue-50 to-white border-blue-200">
              <div className="flex items-center gap-2 text-xs text-blue-600 uppercase tracking-wide mb-2">
                <ArrowUpRight size={16} />
                <span>Saldo Atual</span>
              </div>
              <div className="text-2xl font-bold text-blue-900">
                {professor?.saldoMoedas?.toFixed(0) || 0}
              </div>
              <div className="text-xs text-blue-600 mt-1">moedas disponíveis</div>
            </div>

            <div className="card p-4 bg-gradient-to-br from-green-50 to-white border-green-200">
              <div className="flex items-center gap-2 text-xs text-green-600 uppercase tracking-wide mb-2">
                <FileText size={16} />
                <span>Total Enviado</span>
              </div>
              <div className="text-2xl font-bold text-green-900">{totalEnviado.toFixed(0)}</div>
              <div className="text-xs text-green-600 mt-1">moedas distribuídas</div>
            </div>

            <div className="card p-4 bg-gradient-to-br from-purple-50 to-white border-purple-200">
              <div className="flex items-center gap-2 text-xs text-purple-600 uppercase tracking-wide mb-2">
                <User size={16} />
                <span>Alunos Reconhecidos</span>
              </div>
              <div className="text-2xl font-bold text-purple-900">{alunosAtendidos}</div>
              <div className="text-xs text-purple-600 mt-1">alunos únicos</div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Calendar size={18} className="text-blue-600" />
              Filtros
            </h3>
            <div className="grid md:grid-cols-3 gap-3 mb-6">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Buscar por aluno ou motivo
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
                    <th className="py-3 px-4 font-semibold">Aluno</th>
                    <th className="py-3 px-4 font-semibold">Motivo</th>
                    <th className="py-3 px-4 text-right font-semibold">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtradas.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center">
                        <div className="text-slate-400">
                          <FileText size={48} className="mx-auto mb-2 opacity-30" />
                          <p className="font-medium">Nenhuma transação encontrada</p>
                          <p className="text-xs mt-1">
                            {transacoes.length === 0 
                              ? 'Você ainda não enviou moedas para nenhum aluno' 
                              : 'Tente ajustar os filtros de busca'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtradas.map(t => (
                      <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4">
                          <span className="text-slate-700">
                            {new Date(t.data).toLocaleDateString('pt-BR')}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-slate-900">
                            {t.usuarioDestinoNome || '-'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-slate-600">
                            {t.motivo || 'Sem motivo informado'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="inline-flex items-center gap-1 font-semibold text-green-600">
                            <ArrowUpRight size={14} />
                            {t.valor.toFixed(0)} moedas
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {filtradas.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-center text-sm text-slate-600">
                <span>
                  Mostrando {filtradas.length} de {transacoes.length} {transacoes.length === 1 ? 'transação' : 'transações'}
                </span>
                <span className="font-semibold">
                  Total filtrado: {filtradas.reduce((acc, t) => acc + t.valor, 0).toFixed(0)} moedas
                </span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
