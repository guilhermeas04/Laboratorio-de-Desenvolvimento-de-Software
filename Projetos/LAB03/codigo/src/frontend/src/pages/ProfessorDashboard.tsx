import { useMemo } from 'react'
import PageHeader from '../components/PageHeader'
import { useAuth } from '../context/Auth'
import { demoStore } from '../lib/store'
import { Link } from 'react-router-dom'
import { Send, History } from 'lucide-react'

export default function ProfessorDashboard() {
  const { user } = useAuth()

  const stats = useMemo(() => {
    const profId = user?.id ?? 0
    const envios = demoStore.listarEnviosProfessor(profId)
    const totalEnviado = envios.reduce((acc, t) => acc + (t.valor ?? 0), 0)
    const alunosUnicos = new Set(envios.map((t) => t.alunoId)).size
    const LIMITE_SEMESTRE = 1000
    const restante = Math.max(0, LIMITE_SEMESTRE - totalEnviado)
    return { totalEnviado, alunosUnicos, limite: LIMITE_SEMESTRE, restante }
  }, [user?.id])

  return (
    <div>
      <PageHeader title="Dashboard do Professor" action={<span className="text-sm text-slate-500">Resumo do semestre</span>} />
      <div className="grid md:grid-cols-3 gap-6">
        <div className="card p-4">
          <div className="text-xs text-slate-500">Saldo do semestre</div>
          <div className="text-2xl font-semibold">{stats.restante} moedas</div>
          <div className="text-xs text-slate-400 mt-1">Limite: {stats.limite} • Enviado: {stats.totalEnviado}</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-slate-500">Total enviado</div>
          <div className="text-2xl font-semibold">{stats.totalEnviado} moedas</div>
          <div className="text-xs text-slate-400 mt-1">Neste semestre</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-slate-500">Alunos reconhecidos</div>
          <div className="text-2xl font-semibold">{stats.alunosUnicos}</div>
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
