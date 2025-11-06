import { useState, useEffect } from 'react'
import PageHeader from '../components/PageHeader'
import { useAuth } from '../context/Auth'
import { Link } from 'react-router-dom'
import { Send, History } from 'lucide-react'
import { professoresAPI, transacoesAPI } from '../lib/api'
import { useToast } from '../hooks/use-toast'

export default function ProfessorDashboard() {
  const { user } = useAuth()
  const { error } = useToast()
  const [loading, setLoading] = useState(true)
  const [saldoAtual, setSaldoAtual] = useState(0)
  const [totalEnviado, setTotalEnviado] = useState(0)
  const [alunosUnicos, setAlunosUnicos] = useState(0)

  useEffect(() => {
    loadDashboardData()
  }, [user])

  async function loadDashboardData() {
    if (!user || user.role !== 'professor') return
    
    try {
      setLoading(true)
      
      // Load professor data to get current balance
      const prof = await professoresAPI.buscarPorId(user.id)
      setSaldoAtual(prof.saldoMoedas || 0)

      // Load professor's transactions
      const transacoes = await transacoesAPI.listarPorProfessor(user.id)
      
      // Calculate total sent (only ENVIO type)
      const envios = transacoes.filter(t => t.tipo === 'ENVIO')
      const total = envios.reduce((acc, t) => acc + t.valor, 0)
      setTotalEnviado(total)

      // Calculate unique students
      const alunosSet = new Set(envios.map(t => t.usuarioId))
      setAlunosUnicos(alunosSet.size)
    } catch (err) {
      error('Erro ao carregar dados do dashboard')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Carregando...</div>
  }

  const LIMITE_SEMESTRE = 1000

  return (
    <div>
      <PageHeader title="Dashboard do Professor" action={<span className="text-sm text-slate-500">Resumo do semestre</span>} />
      <div className="grid md:grid-cols-3 gap-6">
        <div className="card p-4">
          <div className="text-xs text-slate-500">Saldo disponível</div>
          <div className="text-2xl font-semibold">{saldoAtual} moedas</div>
          <div className="text-xs text-slate-400 mt-1">Limite semestral: {LIMITE_SEMESTRE}</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-slate-500">Total enviado</div>
          <div className="text-2xl font-semibold">{totalEnviado} moedas</div>
          <div className="text-xs text-slate-400 mt-1">Neste semestre</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-slate-500">Alunos reconhecidos</div>
          <div className="text-2xl font-semibold">{alunosUnicos}</div>
          <div className="text-xs text-slate-400 mt-1">Únicos</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <div className="card p-4">
          <h3 className="font-medium mb-3">Ações rápidas</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <Link to="/prof/enviar" className="btn">
              <Send size={16} className="mr-2" /> Enviar moedas
            </Link>
            <Link to="/prof/historico" className="btn">
              <History size={16} className="mr-2" /> Ver histórico
            </Link>
          </div>
        </div>
        <div className="card p-4">
          <h3 className="font-medium mb-3">Dicas</h3>
          <ul className="text-sm text-slate-600 list-disc pl-5 space-y-1">
            <li>Use o campo Motivo para contextualizar o reconhecimento.</li>
            <li>Acompanhe o saldo restante para planejar seus envios.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
