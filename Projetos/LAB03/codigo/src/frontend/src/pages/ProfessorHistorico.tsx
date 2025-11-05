import PageHeader from '../components/PageHeader'
import { useMemo, useState } from 'react'

type TxProf = { id: number; data: string; aluno: string; valor: number; motivo: string }

export default function ProfessorHistorico() {
  // Mock até integração com backend
  const data: TxProf[] = [
    { id: 1, data: '2025-10-01', aluno: 'Ana', valor: 100, motivo: 'Participação em aula' },
    { id: 2, data: '2025-10-04', aluno: 'Bruno', valor: 150, motivo: 'Projeto de pesquisa' },
    { id: 3, data: '2025-10-10', aluno: 'Carla', valor: 200, motivo: 'Monitoria' },
  ]

  const [q, setQ] = useState('')
  const [de, setDe] = useState('')
  const [ate, setAte] = useState('')

  const filtradas = useMemo(() => {
    return data.filter(t => {
      if (q && !(`${t.aluno} ${t.motivo}`.toLowerCase().includes(q.toLowerCase()))) return false
      if (de && t.data < de) return false
      if (ate && t.data > ate) return false
      return true
    })
  }, [data, q, de, ate])

  const totalEnviado = data.reduce((a, b) => a + b.valor, 0)
  const alunosAtendidos = new Set(data.map(x => x.aluno)).size

  return (
    <div className="space-y-6">
      <PageHeader title="Extrato do Professor" action={<span className="text-sm text-slate-500">Envios</span>} />

      <div className="grid md:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="text-xs text-slate-500">Saldo do Semestre</div>
          <div className="text-2xl font-semibold">{1000 - totalEnviado} moedas</div>
          <div className="text-xs text-slate-400 mt-1">Disponível para enviar</div>
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
                filtradas.map(t => (
                  <tr key={t.id}>
                    <td className="py-2">{t.data}</td>
                    <td>{t.aluno}</td>
                    <td>{t.motivo}</td>
                    <td className="text-right text-emerald-600">+{t.valor}</td>
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
