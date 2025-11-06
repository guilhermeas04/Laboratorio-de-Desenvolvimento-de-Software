import { useParams, Link, useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import { useState, useEffect } from 'react'
import { vantagensAPI, VantagemDTO } from '../lib/api'
import { useAuth } from '../context/Auth'
import { useToast } from '../hooks/use-toast'

export default function VantagemDetalhe() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { success, error, warning } = useToast()
  const [vantagem, setVantagem] = useState<VantagemDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [resgatando, setResgatando] = useState(false)

  useEffect(() => {
    async function loadVantagem() {
      if (!id) return
      
      try {
        const data = await vantagensAPI.buscarPorId(parseInt(id))
        setVantagem(data)
      } catch (err) {
        error('Erro ao carregar detalhes da vantagem')
      } finally {
        setLoading(false)
      }
    }
    loadVantagem()
  }, [id, error])

  async function handleRedeem() {
    if (!vantagem || !user?.id) return

    // Verificar se é aluno
    if (user.role !== 'aluno') {
      warning('Apenas alunos podem resgatar vantagens')
      return
    }

    setResgatando(true)
    try {
      await vantagensAPI.resgatar(vantagem.id!, user.id)
      success('Vantagem resgatada com sucesso! Você receberá instruções por e-mail.')
      navigate('/transacoes')
    } catch (err: any) {
      const mensagem = err?.message || 'Erro ao resgatar vantagem. Verifique seu saldo.'
      error(mensagem)
    } finally {
      setResgatando(false)
    }
  }

  if (loading) return <div className="text-center py-8">Carregando...</div>

  if (!vantagem) {
    return (
      <div className="text-center py-8">
        <div className="text-slate-500 mb-4">Vantagem não encontrada</div>
        <Link to="/vantagens" className="btn">Voltar para Vantagens</Link>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Detalhe da Vantagem" action={<Link to="/vantagens" className="text-sm text-slate-500">Voltar ao Marketplace</Link>} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card p-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="aspect-video bg-slate-100 rounded-md flex items-center justify-center text-slate-400">
                {vantagem.foto ? (
                  <img src={vantagem.foto} alt={vantagem.descricao} className="w-full h-full object-cover rounded-md" />
                ) : (
                  'Imagem'
                )}
              </div>
              <div>
                <h3 className="text-2xl font-semibold mb-2">{vantagem.descricao}</h3>
                <div className="text-slate-700 mb-2 text-lg">{vantagem.custoMoedas} moedas</div>
                {vantagem.empresaNome && (
                  <div className="text-sm text-slate-500 mb-4">Oferecido por: {vantagem.empresaNome}</div>
                )}
                <div className="flex gap-2 mb-6">
                  {user?.role === 'aluno' ? (
                    <button 
                      className="btn btn-lg" 
                      onClick={handleRedeem}
                      disabled={resgatando}
                    >
                      {resgatando ? 'Resgatando...' : 'Resgatar'}
                    </button>
                  ) : (
                    <div className="text-sm text-slate-500 italic">Apenas alunos podem resgatar vantagens</div>
                  )}
                  <Link to="/vantagens" className="btn bg-slate-200 text-slate-800 hover:bg-slate-300">Voltar</Link>
                </div>
                <div className="text-sm text-orange-700 bg-orange-100 p-3 rounded-md">
                  Após o resgate, você receberá instruções por e-mail para utilizar a vantagem.
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-medium mb-2">Descrição Completa</h4>
              <p className="text-sm text-slate-700">{vantagem.descricao || 'Descrição não informada.'}</p>
            </div>
          </div>
        </div>

        <div>
          <div className="card p-4">
            <div className="text-sm text-slate-500 mb-2">Resumo</div>
            <div className="font-medium mb-3">{vantagem.descricao}</div>
            <div className="text-sm text-slate-600">Custo: <span className="font-semibold">{vantagem.custoMoedas} moedas</span></div>
            <div className="mt-4">
              <div className="text-sm text-slate-500">Regras</div>
              <ul className="list-disc list-inside text-sm text-slate-600 mt-2">
                <li>Válido por 30 dias após resgate</li>
                <li>Uso pessoal, intransferível</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
