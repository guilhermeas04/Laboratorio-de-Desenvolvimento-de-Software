import { useMemo } from 'react'
import PageHeader from '../components/PageHeader'
import { useAuth } from '../context/Auth'
import { Link } from 'react-router-dom'
import { Send, History, Coins, Users, TrendingUp } from 'lucide-react'
import { useProfessor } from '../hooks/useProfessores'
import { useTransacoesProfessor } from '../hooks/useTransacoes'

export default function ProfessorDashboard() {
  const { user } = useAuth()
  const { data: professor, isLoading: loadingProfessor } = useProfessor(user?.id)
  const { data: transacoes = [], isLoading: loadingTransacoes } = useTransacoesProfessor(user?.id)

  const stats = useMemo(() => {
    // Calcular total enviado (soma de todas as transações do professor)
    const totalEnviado = transacoes.reduce((acc, t) => acc + (t.valor ?? 0), 0)
    
    // Contar alunos únicos que receberam moedas
    const alunosUnicos = new Set(
      transacoes
        .filter(t => t.tipo === 'TRANSFERENCIA_PROFESSOR_ALUNO')
        .map(t => t.usuarioNome)
        .filter(Boolean)
    ).size
    
    // Saldo atual do professor
    const saldoAtual = professor?.saldoMoedas ?? 0
    
    return { 
      saldoAtual, 
      totalEnviado, 
      alunosReconhecidos: alunosUnicos,
      ultimasTransacoes: transacoes.slice(0, 5)
    }
  }, [professor, transacoes])

  const isLoading = loadingProfessor || loadingTransacoes

  return (
    <div>
      <PageHeader 
        title="Dashboard do Professor" 
        action={
          <span className="text-sm text-slate-500">
            {professor?.departamento && `${professor.departamento}`}
          </span>
        } 
      />

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-slate-600 mt-2">Carregando dados...</p>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="card p-6 bg-gradient-to-br from-blue-50 to-white border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-medium text-blue-600 uppercase tracking-wide">Saldo Atual</div>
                <Coins className="text-blue-600" size={20} />
              </div>
              <div className="text-3xl font-bold text-blue-900">{stats.saldoAtual.toFixed(0)}</div>
              <div className="text-xs text-blue-600 mt-1">moedas disponíveis</div>
            </div>

            <div className="card p-6 bg-gradient-to-br from-green-50 to-white border-green-200">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-medium text-green-600 uppercase tracking-wide">Total Enviado</div>
                <TrendingUp className="text-green-600" size={20} />
              </div>
              <div className="text-3xl font-bold text-green-900">{stats.totalEnviado.toFixed(0)}</div>
              <div className="text-xs text-green-600 mt-1">moedas distribuídas</div>
            </div>

            <div className="card p-6 bg-gradient-to-br from-purple-50 to-white border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-medium text-purple-600 uppercase tracking-wide">Alunos Reconhecidos</div>
                <Users className="text-purple-600" size={20} />
              </div>
              <div className="text-3xl font-bold text-purple-900">{stats.alunosReconhecidos}</div>
              <div className="text-xs text-purple-600 mt-1">alunos únicos</div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <div className="card p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Send size={18} className="text-blue-600" />
                Ações Rápidas
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <Link 
                  to="/prof/enviar" 
                  className="btn bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 py-3"
                >
                  <Send size={16} /> Enviar Moedas
                </Link>
                <Link 
                  to="/prof/historico" 
                  className="btn border-2 border-slate-300 hover:border-blue-600 hover:bg-blue-50 flex items-center justify-center gap-2 py-3"
                >
                  <History size={16} /> Ver Histórico
                </Link>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="font-semibold text-lg mb-4">📋 Últimas Transações</h3>
              {stats.ultimasTransacoes.length === 0 ? (
                <p className="text-sm text-slate-500 italic">Nenhuma transação realizada ainda.</p>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {stats.ultimasTransacoes.map((t) => (
                    <div key={t.id} className="flex items-center justify-between text-sm py-2 border-b border-slate-100 last:border-0">
                      <div className="flex-1">
                        <div className="font-medium text-slate-700">{t.motivo || 'Sem motivo'}</div>
                        <div className="text-xs text-slate-500">
                          {new Date(t.data).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                      <div className="text-green-600 font-semibold">
                        {t.valor} moedas
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="card p-6 mt-6 bg-blue-50 border-blue-200">
            <h3 className="font-semibold text-lg mb-3 text-blue-900">💡 Dicas para Reconhecimento</h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Use o campo <strong>Motivo</strong> para contextualizar o reconhecimento e incentivar o aluno.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Acompanhe seu saldo regularmente para planejar distribuições estratégicas.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Reconheça comportamentos positivos, participação ativa e bom desempenho.</span>
              </li>
            </ul>
          </div>
        </>
      )}
    </div>
  )
}
