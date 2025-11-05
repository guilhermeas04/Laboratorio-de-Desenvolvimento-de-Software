import PageHeader from '../components/PageHeader'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useToast } from '../hooks/use-toast'

type Vantagem = {
  id: number
  descricao: string
  custoMoedas: number
  foto?: string
}

export default function Vantagens() {
  const navigate = useNavigate()
  const { error } = useToast()
  const [vantagens, setVantagens] = useState<Vantagem[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')

  useEffect(() => {
    async function loadVantagens() {
      try {
        // Placeholder sample data until backend is available
        setVantagens([
          { id: 1, descricao: 'Curso Online - 20% off', custoMoedas: 500, foto: '' },
          { id: 2, descricao: 'Vale-livro R$50', custoMoedas: 150, foto: '' },
          { id: 3, descricao: 'Assinatura Premium 1 mês', custoMoedas: 1200, foto: '' },
        ])
      } catch (err) {
        error('Erro ao carregar vantagens')
      } finally {
        setLoading(false)
      }
    }
    loadVantagens()
  }, [error])

  if (loading) return <div className="text-center py-8">Carregando...</div>

  const filtered = vantagens.filter(v => v.descricao.toLowerCase().includes(q.toLowerCase()))

  return (
    <div>
      <PageHeader title="Vantagens" action={<div className="text-sm text-slate-500">Marketplace</div>} />

      <div className="mb-4 flex items-center gap-3">
        <input className="input flex-1" placeholder="Buscar vantagens..." value={q} onChange={e => setQ(e.target.value)} />
        <button className="btn" onClick={() => setQ('')}>Limpar</button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-3 text-center text-slate-500 py-8">Nenhuma vantagem disponível no momento</div>
        ) : (
          filtered.map(v => (
            <div key={v.id} className="card overflow-hidden">
              <div className="h-40 bg-gradient-to-br from-white to-slate-100 flex items-center justify-center text-slate-400">{v.foto ? <img src={v.foto} alt={v.descricao} className="w-full h-full object-cover" /> : 'Imagem'}</div>
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium">{v.descricao}</div>
                    <div className="text-sm text-slate-500">{v.custoMoedas} moedas</div>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button className="btn" onClick={() => navigate(`/vantagens/${v.id}`)}>Ver detalhes</button>
                  <button className="btn bg-sky-600 text-white" onClick={() => {/* redeem flow */}}>Resgatar</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
