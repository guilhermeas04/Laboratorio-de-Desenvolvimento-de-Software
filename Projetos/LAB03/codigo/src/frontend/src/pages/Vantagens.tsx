import PageHeader from '../components/PageHeader'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useToast } from '../hooks/use-toast'
import { vantagensAPI, VantagemDTO } from '../lib/api'

export default function Vantagens() {
  const navigate = useNavigate()
  const { error } = useToast()
  const [vantagens, setVantagens] = useState<VantagemDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')

  useEffect(() => {
    async function loadVantagens() {
      try {
        const data = await vantagensAPI.listar()
        // Garantir que sempre seja um array
        setVantagens(Array.isArray(data) ? data : [])
      } catch (err) {
        error('Erro ao carregar vantagens')
        console.error(err)
        setVantagens([]) // Define array vazio em caso de erro
      } finally {
        setLoading(false)
      }
    }
    loadVantagens()
  }, [error])

  if (loading) return <div className="text-center py-8">Carregando...</div>

  const filtered = Array.isArray(vantagens)
    ? vantagens.filter(v => v.descricao?.toLowerCase().includes(q.toLowerCase()))
    : []

  return (
    <div>
      <PageHeader title="Vantagens" action={<div className="text-sm text-slate-500">Marketplace</div>} />

      <div className="mb-4 flex items-center gap-3">
        <input className="input flex-1" placeholder="Buscar vantagens..." value={q} onChange={e => setQ(e.target.value)} />
        <button className="btn" onClick={() => setQ('')}>Limpar</button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-3 text-center text-slate-500 py-8">
            {q ? 'Nenhuma vantagem encontrada com este filtro' : 'Nenhuma vantagem disponível no momento'}
          </div>
        ) : (
          filtered.map(v => (
            <div key={v.id} className="card overflow-hidden">
              <div className="h-40 bg-gradient-to-br from-white to-slate-100 flex items-center justify-center text-slate-400">
                {v.foto ? <img src={v.foto} alt={v.descricao} className="w-full h-full object-cover" /> : 'Imagem'}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium">{v.descricao}</div>
                    <div className="text-sm text-slate-500">{v.custoMoedas} moedas</div>
                    {v.empresaNome && (
                      <div className="text-xs text-slate-400 mt-1">{v.empresaNome}</div>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button className="btn flex-1" onClick={() => navigate(`/vantagens/${v.id}`)}>Ver detalhes</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
