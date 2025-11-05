export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080'

// Helper function for API calls
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(error || `API Error: ${response.status}`)
  }

  // Handle empty responses (like DELETE)
  const contentType = response.headers.get('content-type')
  if (!contentType || !contentType.includes('application/json')) {
    return null as T
  }

  return response.json()
}

export async function apiGet(path: string) {
  const res = await fetch(`${API_BASE}${path}`)
  if (!res.ok) throw new Error(`GET ${path} ${res.status}`)
  return res.json().catch(() => res.text())
}

export async function health(): Promise<string> {
  const res = await fetch(`${API_BASE}/`)
  return res.text()
}

// Types
export type AlunoDTO = {
  id?: number
  nome: string
  documento: string
  email: string
  login: string
  senha?: string
  rg: string
  endereco: string
  curso: string
  saldoMoedas: number
  instituicaoId: number
}

export type EmpresaDTO = {
  id?: number
  nome: string
  documento: string
  email: string
  login: string
  senha?: string
  nomeFantasia: string
  cnpj: string
}

export type VantagemDTO = {
  id?: number
  descricao: string
  foto?: string
  custoMoedas: number
}

export type LoginRequestDTO = {
  login: string
  senha: string
}

export type LoginResponseDTO = {
  id: number
  nome: string
  email: string
  login: string
  tipo: 'aluno' | 'professor' | 'empresa'
}

export type ProfessorDTO = {
  id?: number
  nome: string
  cpf: string
  departamento: string
  email: string
  login: string
  senha?: string
  instituicaoId: number
}

// Auth API
export const authAPI = {
  async login(login: string, senha: string): Promise<LoginResponseDTO> {
    return apiCall<LoginResponseDTO>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ login, senha }),
    })
  },
}

// Alunos API
export const alunosAPI = {
  async listar(): Promise<AlunoDTO[]> {
    try {
      return await apiCall<AlunoDTO[]>('/api/alunos')
    } catch {
      // Fallback demo: map demoStore students to AlunoDTO
      const { demoStore } = await import('./store')
      const alunos = demoStore.listarAlunos()
      return alunos.map((s: any, idx: number) => ({
        id: s.id ?? idx + 1,
        nome: s.nome,
        documento: s.cpf || '000.000.000-00',
        email: s.email,
        login: s.email,
        rg: s.rg || '00.000.000-0',
        endereco: s.endereco || 'Endereço não informado',
        curso: s.curso || 'Curso',
        saldoMoedas: s.saldo ?? 0,
        instituicaoId: 1,
      }))
    }
  },

  async buscarPorId(id: number): Promise<AlunoDTO> {
    try {
      return await apiCall<AlunoDTO>(`/api/alunos/${id}`)
    } catch {
      const { demoStore } = await import('./store')
      const alunos = demoStore.listarAlunos() as any[]
      const s = alunos.find((a) => (a.id ?? 0) === id) || alunos[0]
      if (!s) throw new Error('Aluno demo não encontrado')
      return {
        id: s.id ?? 1,
        nome: s.nome,
        documento: s.cpf || '000.000.000-00',
        email: s.email,
        login: s.email,
        rg: s.rg || '00.000.000-0',
        endereco: s.endereco || 'Endereço não informado',
        curso: s.curso || 'Curso',
        saldoMoedas: s.saldo ?? 0,
        instituicaoId: 1,
      }
    }
  },

  async criar(data: Omit<AlunoDTO, 'id'>): Promise<AlunoDTO> {
    return apiCall<AlunoDTO>('/api/alunos', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async atualizar(id: number, data: Omit<AlunoDTO, 'id'>): Promise<AlunoDTO> {
    return apiCall<AlunoDTO>(`/api/alunos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  async deletar(id: number): Promise<void> {
    return apiCall<void>(`/api/alunos/${id}`, {
      method: 'DELETE',
    })
  },

  async adicionarMoedas(id: number, quantidade: number): Promise<string> {
    try {
      return await apiCall<string>(`/api/alunos/${id}/adicionar-moedas?quantidade=${quantidade}`, { method: 'PATCH' })
    } catch {
      const { demoStore } = await import('./store')
      // Find current user as professor (best-effort using auth in localStorage)
      const authRaw = localStorage.getItem('lab03-auth')
      const auth = authRaw ? JSON.parse(authRaw) : undefined
      const profId = auth?.id || 2
      demoStore.sendCoins({ professorId: profId, alunoId: id, valor: quantidade, motivo: 'Reconhecimento (demo)' })
      try {
        // attempt to send emails via EmailJS helper (non-blocking)
        const { sendCoinTransferEmails } = await import('./emailJs')
        const db = demoStore.getDB()
        const prof = db.users.find((u: any) => u.id === profId)
        const aluno = db.students.find((s: any) => s.id === id)
        sendCoinTransferEmails({
          professorName: prof?.name || 'Professor',
          professorEmail: prof?.email,
          studentName: aluno?.nome || aluno?.email || 'Aluno',
          studentEmail: aluno?.email || '',
          valor: quantidade,
          motivo: 'Reconhecimento (demo)'
        }).catch((e: any) => console.debug('Email send failed (demo):', e))
      } catch (e) {
        console.debug('Email helper import failed or not configured', e)
      }
      return 'OK'
    }
  },

  async debitarMoedas(id: number, quantidade: number): Promise<string> {
    try {
      return await apiCall<string>(`/api/alunos/${id}/debitar-moedas?quantidade=${quantidade}`, { method: 'PATCH' })
    } catch {
      const { demoStore } = await import('./store')
      const db = demoStore.getDB()
      const aluno = db.students.find((s: any) => s.id === id)
      if (aluno) {
        aluno.saldo = (aluno.saldo ?? 0) - Math.max(0, quantidade)
        // Record resgate
        const idBase = Math.max(0, ...db.transactions.map((t: any) => t.id)) + 1
        const today = new Date().toISOString().slice(0, 10)
        db.transactions.push({ id: idBase, tipo: 'aluno_resgate', data: today, alunoId: id, valor: Math.max(0, quantidade), descricao: 'Resgate (demo)' })
        localStorage.setItem('lab03-demo-db', JSON.stringify(db))
      }
      return 'OK'
    }
  },
}

// Empresas API
export const empresasAPI = {
  async listar(): Promise<EmpresaDTO[]> {
    return apiCall<EmpresaDTO[]>('/api/empresas')
  },

  async buscarPorId(id: number): Promise<EmpresaDTO> {
    return apiCall<EmpresaDTO>(`/api/empresas/${id}`)
  },

  async criar(data: Omit<EmpresaDTO, 'id'>): Promise<EmpresaDTO> {
    return apiCall<EmpresaDTO>('/api/empresas', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async atualizar(id: number, data: Partial<EmpresaDTO>): Promise<EmpresaDTO> {
    return apiCall<EmpresaDTO>(`/api/empresas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  async deletar(id: number): Promise<void> {
    return apiCall<void>(`/api/empresas/${id}`, {
      method: 'DELETE',
    })
  },
}

// Professores API (stub)
export const professoresAPI = {
  async criar(data: Omit<ProfessorDTO, 'id'>): Promise<ProfessorDTO> {
    try {
      return await apiCall<ProfessorDTO>('/api/professores', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    } catch {
      // Fallback: create user in demo store
      const { demoStore } = await import('./store')
      const created = demoStore.criarProfessor({
        nome: data.nome,
        cpf: data.cpf,
        departamento: data.departamento,
        email: data.email,
        login: data.login,
        senha: data.senha,
        instituicaoId: data.instituicaoId,
      })
      return {
        id: created.id,
        nome: created.name,
        cpf: data.cpf,
        departamento: data.departamento,
        email: created.email,
        login: created.login,
        instituicaoId: data.instituicaoId,
      }
    }
  },
}

// Vantagens API (empresa) - fallback to demoStore when backend is unavailable
export const vantagensAPI = {
  async listarPorEmpresa(empresaId: number): Promise<VantagemDTO[]> {
    try {
      return await apiCall<VantagemDTO[]>(`/api/empresas/${empresaId}/vantagens`)
    } catch {
      const { demoStore } = await import('./store')
      const db = demoStore.getDB()
      // demo advantages shape is arbitrary; filter by empresaId if present
      const all = db.advantages || []
      return all.filter((v: any) => !v.empresaId || v.empresaId === empresaId).map((v: any, idx: number) => ({
        id: v.id ?? idx + 1,
        descricao: v.descricao || v.titulo || 'Vantagem',
        foto: v.foto,
        custoMoedas: v.custoMoedas ?? v.preco ?? 0,
      }))
    }
  },

  async criar(empresaId: number, data: Omit<VantagemDTO, 'id'>): Promise<VantagemDTO> {
    try {
      return await apiCall<VantagemDTO>(`/api/empresas/${empresaId}/vantagens`, { method: 'POST', body: JSON.stringify(data) })
    } catch {
      const { demoStore } = await import('./store')
      const db = demoStore.getDB()
      const nextId = Math.max(0, ...((db.advantages || []).map((a: any) => a.id || 0))) + 1
      const rec = { id: nextId, empresaId, descricao: data.descricao, foto: data.foto, custoMoedas: data.custoMoedas }
      db.advantages = db.advantages || []
      db.advantages.push(rec)
      localStorage.setItem('lab03-demo-db', JSON.stringify(db))
      return rec
    }
  },

  async deletar(id: number): Promise<void> {
    try {
      return await apiCall<void>(`/api/vantagens/${id}`, { method: 'DELETE' })
    } catch {
      const { demoStore } = await import('./store')
      const db = demoStore.getDB()
      db.advantages = (db.advantages || []).filter((a: any) => a.id !== id)
      localStorage.setItem('lab03-demo-db', JSON.stringify(db))
      return
    }
  }
}
