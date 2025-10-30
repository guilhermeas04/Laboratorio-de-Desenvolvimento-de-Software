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

// Helper to get current user from localStorage
function getCurrentUserId(): number | null {
  const authStr = localStorage.getItem('lab03-auth')
  if (!authStr) return null
  try {
    const auth = JSON.parse(authStr)
    return auth.id || null
  } catch {
    return null
  }
}

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

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
  empresaId?: number
  empresaNome?: string
}

export type TransacaoDTO = {
  id?: number
  usuarioId: number
  usuarioNome?: string
  usuarioDestinoId?: number
  usuarioDestinoNome?: string
  data: string
  valor: number
  tipo: 'ENVIO' | 'RESGATE' | 'CREDITO' | 'TRANSFERENCIA_PROFESSOR_ALUNO'
  motivo: string
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
  documento: string
  departamento: string
  email: string
  login: string
  senha?: string
  instituicaoId: number
  saldoMoedas?: number
}

export type EnviarMoedasRequest = {
  alunoId: number
  quantidade: number
  motivo: string
}

export type EnviarMoedasResponse = {
  professorId: number
  professorNome: string
  alunoId: number
  alunoNome: string
  quantidade: number
  motivo: string
  novoSaldoProfessor: number
  novoSaldoAluno: number
  transacaoId: number
}

// ============================================================================
// AUTH API
// ============================================================================

export const authAPI = {
  async login(login: string, senha: string): Promise<LoginResponseDTO> {
    return apiCall<LoginResponseDTO>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ login, senha }),
    })
  },
}

// ============================================================================
// ALUNOS API
// ============================================================================

export const alunosAPI = {
  async listar(): Promise<AlunoDTO[]> {
    return apiCall<AlunoDTO[]>('/api/alunos')
  },

  async buscarPorId(id: number): Promise<AlunoDTO> {
    return apiCall<AlunoDTO>(`/api/alunos/${id}`)
  },

  async criar(data: Omit<AlunoDTO, 'id' | 'saldoMoedas'>): Promise<AlunoDTO> {
    return apiCall<AlunoDTO>('/api/alunos', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async atualizar(id: number, data: Partial<AlunoDTO>): Promise<AlunoDTO> {
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
    return apiCall<string>(`/api/alunos/${id}/adicionar-moedas?quantidade=${quantidade}`, {
      method: 'PATCH',
    })
  },

  async debitarMoedas(id: number, quantidade: number): Promise<string> {
    return apiCall<string>(`/api/alunos/${id}/debitar-moedas?quantidade=${quantidade}`, {
      method: 'PATCH',
    })
  },
}

// ============================================================================
// PROFESSORES API
// ============================================================================

export const professoresAPI = {
  async listar(): Promise<ProfessorDTO[]> {
    return apiCall<ProfessorDTO[]>('/api/professores')
  },

  async buscarPorId(id: number): Promise<ProfessorDTO> {
    return apiCall<ProfessorDTO>(`/api/professores/${id}`)
  },

  async criar(data: Omit<ProfessorDTO, 'id' | 'saldoMoedas'>): Promise<ProfessorDTO> {
    return apiCall<ProfessorDTO>('/api/professores', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async atualizar(id: number, data: Partial<ProfessorDTO>): Promise<ProfessorDTO> {
    return apiCall<ProfessorDTO>(`/api/professores/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  async deletar(id: number): Promise<void> {
    return apiCall<void>(`/api/professores/${id}`, {
      method: 'DELETE',
    })
  },

  async enviarMoedas(professorId: number, request: EnviarMoedasRequest): Promise<EnviarMoedasResponse> {
    return apiCall<EnviarMoedasResponse>(`/api/professores/${professorId}/enviar-moedas`, {
      method: 'POST',
      body: JSON.stringify(request),
    })
  },

  async adicionarMoedas(professorId: number, quantidade: number): Promise<string> {
    return apiCall<string>(`/api/professores/${professorId}/adicionar-moedas?quantidade=${quantidade}`, {
      method: 'PATCH',
    })
  },
}

// ============================================================================
// EMPRESAS API
// ============================================================================

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

// ============================================================================
// VANTAGENS API
// ============================================================================

export const vantagensAPI = {
  async listar(): Promise<VantagemDTO[]> {
    return apiCall<VantagemDTO[]>('/api/vantagens')
  },

  async buscarPorId(id: number): Promise<VantagemDTO> {
    return apiCall<VantagemDTO>(`/api/vantagens/${id}`)
  },

  async listarPorEmpresa(empresaId: number): Promise<VantagemDTO[]> {
    return apiCall<VantagemDTO[]>(`/api/vantagens/empresa/${empresaId}`)
  },

  async criar(data: Omit<VantagemDTO, 'id' | 'empresaNome'>): Promise<VantagemDTO> {
    return apiCall<VantagemDTO>('/api/vantagens', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async atualizar(id: number, data: Partial<VantagemDTO>): Promise<VantagemDTO> {
    return apiCall<VantagemDTO>(`/api/vantagens/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  async deletar(id: number): Promise<void> {
    return apiCall<void>(`/api/vantagens/${id}`, {
      method: 'DELETE',
    })
  },

  async resgatar(vantagemId: number, alunoId: number): Promise<any> {
    return apiCall<any>(`/api/vantagens/${vantagemId}/resgatar?alunoId=${alunoId}`, {
      method: 'POST',
    })
  },
}

// ============================================================================
// TRANSAÇÕES API
// ============================================================================

export const transacoesAPI = {
  async listar(): Promise<TransacaoDTO[]> {
    return apiCall<TransacaoDTO[]>('/api/transacoes')
  },

  async buscarPorId(id: number): Promise<TransacaoDTO> {
    return apiCall<TransacaoDTO>(`/api/transacoes/${id}`)
  },

  async listarPorAluno(alunoId: number): Promise<TransacaoDTO[]> {
    return apiCall<TransacaoDTO[]>(`/api/transacoes/aluno/${alunoId}`)
  },

  async listarPorProfessor(professorId: number): Promise<TransacaoDTO[]> {
    return apiCall<TransacaoDTO[]>(`/api/transacoes/professor/${professorId}`)
  },

  async listarPorEmpresa(empresaId: number): Promise<TransacaoDTO[]> {
    return apiCall<TransacaoDTO[]>(`/api/transacoes/empresa/${empresaId}`)
  },

  async listarPorTipo(tipo: 'ENVIO' | 'RESGATE' | 'CREDITO' | 'TRANSFERENCIA_PROFESSOR_ALUNO'): Promise<TransacaoDTO[]> {
    return apiCall<TransacaoDTO[]>(`/api/transacoes/tipo/${tipo}`)
  },
}
