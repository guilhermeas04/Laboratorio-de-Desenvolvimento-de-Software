import PageHeader from '../components/PageHeader'
import { useEffect, useState } from 'react'
import { useAuth } from '../context/Auth'
import { alunosAPI } from '../lib/api'
import { useToast } from '../hooks/use-toast'

export default function Perfil() {
  const { user } = useAuth()
  const { success, error } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [documento, setDocumento] = useState('')
  const [rg, setRg] = useState('')
  const [endereco, setEndereco] = useState('')
  const [curso, setCurso] = useState('')
  const [instituicao, setInstituicao] = useState('')
  const [instituicaoId, setInstituicaoId] = useState<number>(1)
  

  useEffect(() => {
    async function load() {
      if (!user) return
      setLoading(true)
      try {
        const a = await alunosAPI.buscarPorId(user.id)
        setNome(a.nome || '')
        setEmail(a.email || '')
        setDocumento(a.documento || '')
        setRg(a.rg || '')
        setEndereco(a.endereco || '')
        setCurso(a.curso || '')
        setInstituicao(String(a.instituicaoId || ''))
        setInstituicaoId(a.instituicaoId || 1)
      } catch (err) {
        error('Erro ao carregar perfil')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user, error])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    try {
      const payload: any = {
        nome,
        documento,
        email,
        login: usuarioLoginFromEmail(email),
        rg,
        endereco,
        curso,
        saldoMoedas: 0,
        instituicaoId: instituicaoId,
      }

      await alunosAPI.atualizar(user.id, payload)
      success('Perfil atualizado com sucesso')
    } catch (err: any) {
      error(err.message || 'Falha ao atualizar perfil')
    } finally {
      setSaving(false)
    }
  }

  // Simple helper to derive a login if backend expects it
  function usuarioLoginFromEmail(e: string) {
    if (!e) return ''
    return e.split('@')[0]
  }

  if (loading) return <div className="text-center py-8">Carregando perfil...</div>

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <div className="card p-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xl font-semibold">{nome.charAt(0) || 'U'}</div>
            <div>
              <div className="text-lg font-semibold">{nome}</div>
              <div className="text-sm text-slate-500">{email}</div>
            </div>
          </div>

          <div className="mt-4">
            <div className="text-sm text-slate-500">Instituição (ID)</div>
            <div className="font-medium">{instituicaoId || 'Não informada'}</div>
          </div>

          <div className="mt-4">
            <div className="text-sm text-slate-500">Curso</div>
            <div className="font-medium">{curso || 'Não informado'}</div>
          </div>

          <div className="mt-6">
            <button className="btn w-full" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Editar Informações</button>
          </div>
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="card p-5">
          <form className="grid md:grid-cols-2 gap-4" onSubmit={handleSave}>
            <div>
              <label className="label">Nome</label>
              <input className="input" value={nome} onChange={e => setNome(e.target.value)} />
            </div>
            <div>
              <label className="label">E-mail</label>
              <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} />
            </div>

            <div>
              <label className="label">CPF</label>
              <input className="input" value={documento} onChange={e => setDocumento(e.target.value)} />
            </div>
            <div>
              <label className="label">RG</label>
              <input className="input" value={rg} onChange={e => setRg(e.target.value)} />
            </div>

            <div className="md:col-span-2">
              <label className="label">Endereço</label>
              <input className="input" value={endereco} onChange={e => setEndereco(e.target.value)} />
            </div>

            <div>
              <label className="label">Instituição (ID)</label>
              <input className="input" type="number" value={instituicaoId} onChange={e => setInstituicaoId(Number(e.target.value))} />
            </div>
            <div>
              <label className="label">Curso</label>
              <input className="input" value={curso} onChange={e => setCurso(e.target.value)} />
            </div>

            <div>
              <label className="label">Nova senha (opcional)</label>
              <input className="input" type="password" value={senhaNova} onChange={e => setSenhaNova(e.target.value)} />
            </div>

            <div className="md:col-span-2 flex justify-end">
              <button className="btn" type="submit" disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
