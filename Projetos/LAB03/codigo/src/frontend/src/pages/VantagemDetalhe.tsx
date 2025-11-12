import { useParams, Link, useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import { useState, useEffect } from 'react'
import { alunosAPI, VantagemDTO, vantagensAPI } from '../lib/api'
import { useAuth } from '../context/Auth'
import { useToast } from '../hooks/use-toast'
import { Check, Copy } from 'lucide-react'

interface ResgatoInfo {
  vantagemId: number
  vantagemDescricao: string
  custoMoedas: number
  codigoCupom: string
  dataResgate: Date
  novoSaldo: number
  emailAluno: string
  nomeAluno: string
  empresaNome: string
  emailEmpresa: string
  emailEnviado: boolean
}

export default function VantagemDetalhe() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { success, error, warning } = useToast()
  const [vantagem, setVantagem] = useState<VantagemDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [aluno, setAluno] = useState<any>(null)
  const [resgateInfo, setResgateInfo] = useState<ResgatoInfo | null>(null)
  const [copiado, setCopiado] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        // Carregar aluno atual
        if (user && user.id) {
          const a = await alunosAPI.buscarPorId(user.id)
          setAluno(a)
        } else {
          const alunos = await alunosAPI.listar()
          if (alunos.length > 0) setAluno(alunos[0])
        }

        // Carregar vantagem
        if (id) {
          const v = await vantagensAPI.buscarPorId(Number(id))
          setVantagem(v)
        }
      } catch (err) {
        error('Erro ao carregar detalhes da vantagem')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [id, error, user])

  async function handleRedeem() {
    if (!vantagem || !aluno) return

    try {
      if (aluno.saldoMoedas < vantagem.custoMoedas) {
        warning('Saldo insuficiente para resgatar esta vantagem')
        return
      }

      // Resgatar vantagem via API
      const resultado = await vantagensAPI.resgatar(vantagem.id!, aluno.id!)
      
      setResgateInfo(resultado)
      success('Vantagem resgatada com sucesso!')
      
      // Atualizar saldo do aluno
      setAluno({...aluno, saldoMoedas: resultado.novoSaldo})
    } catch (err) {
      error('Erro ao resgatar vantagem. Tente novamente.')
    }
  }

  function copiarCodigo() {
    if (resgateInfo) {
      navigator.clipboard.writeText(resgateInfo.codigoCupom)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
      success('Código copiado para a área de transferência')
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

  // Mostrar cupom de resgate após sucesso
  if (resgateInfo) {
    return (
      <div>
        <PageHeader title="Cupom de Resgate" action={<Link to="/vantagens" className="text-sm text-slate-500">Voltar às Vantagens</Link>} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="card p-6 border-2 border-emerald-600">
              <div className="flex items-center gap-2 mb-4 text-emerald-600">
                <Check size={24} />
                <span className="text-lg font-semibold">Resgate realizado com sucesso!</span>
              </div>

              <div className="bg-emerald-50 p-4 rounded-lg mb-6">
                <div className="text-sm text-slate-600 mb-2">Sua vantagem foi resgatada</div>
                <div className="text-xl font-semibold text-slate-900">{resgateInfo.vantagemDescricao}</div>
              </div>

              <div className="border-2 border-dashed border-slate-300 p-6 rounded-lg mb-6 bg-slate-50">
                <div className="text-center">
                  <div className="text-sm text-slate-600 mb-2">Código do Cupom</div>
                  <div className="text-3xl font-mono font-bold text-slate-900 mb-3 break-all">{resgateInfo.codigoCupom}</div>
                  <button 
                    onClick={copiarCodigo}
                    className="btn btn-sm gap-2 inline-flex items-center"
                  >
                    <Copy size={16} />
                    {copiado ? 'Copiado!' : 'Copiar Código'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-50 p-3 rounded-lg">
                  <div className="text-xs text-slate-600">Custo em Moedas</div>
                  <div className="text-lg font-semibold">{resgateInfo.custoMoedas}</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                  <div className="text-xs text-slate-600">Novo Saldo</div>
                  <div className="text-lg font-semibold text-emerald-600">{resgateInfo.novoSaldo}</div>
                </div>
              </div>

              <div className="border-t pt-4 mb-6">
                <div className="text-sm font-semibold mb-3">Informações Importantes</div>
                <ul className="list-disc list-inside text-sm text-slate-600 space-y-2">
                  <li>Um email com este código foi enviado para <strong>{resgateInfo.emailAluno}</strong></li>
                  <li>A empresa também recebeu uma notificação em <strong>{resgateInfo.emailEmpresa}</strong></li>
                  <li>Válido por 30 dias a partir de hoje</li>
                  <li>Apresente este código presencialmente para utilizar a vantagem</li>
                  <li>Este cupom é pessoal e intransferível</li>
                </ul>
              </div>

              <div className="flex gap-2">
                <button 
                  className="btn bg-emerald-600 text-white hover:bg-emerald-700 flex-1" 
                  onClick={() => navigate('/dashboard')}
                >
                  Ir para Dashboard
                </button>
                <button 
                  className="btn bg-slate-200 text-slate-800 hover:bg-slate-300 flex-1" 
                  onClick={() => navigate('/vantagens')}
                >
                  Explorar Mais Vantagens
                </button>
              </div>
            </div>
          </div>

          <div>
            <div className="card p-4">
              <div className="text-sm text-slate-500 mb-2">Empresa Parceira</div>
              <div className="font-semibold mb-3">{resgateInfo.empresaNome}</div>
              <div className="text-xs text-slate-600 mb-4">
                <p className="mb-2"><strong>Próximos passos:</strong></p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Verifique seu email</li>
                  <li>Dirija-se à empresa</li>
                  <li>Apresente o código</li>
                  <li>Aproveite sua vantagem!</li>
                </ol>
              </div>
            </div>

            <div className="card p-4 mt-4 bg-blue-50">
              <div className="text-sm text-blue-900">
                <strong>Dúvidas?</strong>
                <p className="mt-2 text-xs">Entre em contato conosco pelo email de suporte.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Mostrar página de detalhes de vantagem antes do resgate
  return (
    <div>
      <PageHeader title="Detalhe da Vantagem" action={<Link to="/vantagens" className="text-sm text-slate-500">Voltar ao Marketplace</Link>} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card p-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="aspect-video bg-slate-100 rounded-md flex items-center justify-center text-slate-400">
                {vantagem.foto ? (
                  <img 
                    src={`data:image/jpeg;base64,${vantagem.foto}`} 
                    alt={vantagem.descricao} 
                    className="w-full h-full object-cover rounded-md" 
                  />
                ) : (
                  'Imagem'
                )}
              </div>
              <div>
                <h3 className="text-2xl font-semibold mb-2">{vantagem.descricao}</h3>
                {vantagem.empresaNome && (
                  <div className="text-sm text-slate-500 mb-2">
                    Empresa: {vantagem.empresaNome}
                  </div>
                )}
                <div className="text-slate-700 mb-4 text-lg">{vantagem.custoMoedas} moedas</div>
                {aluno && (
                  <div className="text-sm text-slate-600 mb-4">
                    Seu saldo: <span className={`font-semibold ${aluno.saldoMoedas >= vantagem.custoMoedas ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {aluno.saldoMoedas} moedas
                    </span>
                  </div>
                )}
                <div className="flex gap-2 mb-6">
                  <button 
                    className="btn btn-lg bg-sky-600 text-white hover:bg-sky-700" 
                    onClick={handleRedeem}
                    disabled={!aluno || aluno.saldoMoedas < vantagem.custoMoedas}
                  >
                    Resgatar
                  </button>
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
                <li>Apresentar código na utilização</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
