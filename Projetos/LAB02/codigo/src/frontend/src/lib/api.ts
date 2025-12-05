// Detect backend base (backend dev profile usa 8080). Permite override por env.
export const API_BASE = (import.meta.env.VITE_API_BASE as string) || "https://backstudentcoin.onrender.comw"; // porta ajustada para 8081

/* --------------------------------------------------
 * Helpers HTTP genéricos
 * -------------------------------------------------- */
export class ApiError extends Error {
  status: number;
  path: string;
  body?: string;
  constructor(message: string, status: number, path: string, body?: string) {
    super(message);
    this.status = status;
    this.path = path;
    this.body = body;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, init);
  if (!res.ok) {
    let raw = '';
    try { raw = await res.text(); } catch { }
    let parsed: any = undefined;
    if (raw) {
      try { parsed = JSON.parse(raw); } catch { }
    }
    const baseMsg = parsed?.erro || parsed?.message || res.statusText || 'Erro na requisição';
    const err = new ApiError(baseMsg, res.status, path, raw);
    throw err;
  }
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: any) => request<T>(path, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined
  }),
  put: <T>(path: string, body?: any) => request<T>(path, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined
  }),
  patch: <T>(path: string, body?: any) => request<T>(path, {
    method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined
  }),
  delete: (path: string) => request<void>(path, { method: 'DELETE' })
};

/* --------------------------------------------------
 * Tipos alinhados ao backend (JPA entities serializadas)
 * -------------------------------------------------- */
export type TipoUsuario = 'Cliente' | 'Agente';
export interface Usuario {
  id: number;
  nome: string;
  cpf: string;
  rg: string;
  endereco: string;
  profissao: string;
  senha?: string; // backend retorna senha (idealmente deveria omitir, mas está presente nos testes)
  tipoUsuario: TipoUsuario;
  // Campos específicos de Agente podem ou não existir
  nomeAgente?: string;
  tipoAgente?: 'Empresa' | 'Banco';
}

export interface Automovel {
  id: number;
  placa: string;
  matricula: string;
  ano?: number;
  marca?: string;
  modelo?: string;
  proprietario?: Usuario; // pode vir completo ou omitido
}

export type StatusPedido = 'PENDENTE' | 'APROVADO' | 'REJEITADO' | 'CANCELADO';
export interface PedidoRaw {
  id: number;
  cliente?: Usuario; // pode ser null
  automovel?: Automovel;
  status: StatusPedido; // backend serializa Em_analise como PENDENTE
  dataPedido?: string; // ISO date string
}

// Modelo simplificado para UI (flatten)
export interface PedidoUI {
  id: number;
  status: StatusPedido;
  data: string | undefined;
  clienteNome: string | undefined;
  automovelLabel: string | undefined;
  raw: PedidoRaw;
}

export interface Credito {
  id: number;
  valorAprovado: number;
  prazoPagamento: number;
  taxaJuros: number;
  banco?: Usuario; // Agente
}

export interface Contrato {
  id: number;
  valor?: number;
  tipoContrato?: 'Cliente' | 'Empresa' | 'Banco';
  dataInicio?: string;
  dataFim?: string;
  pedido?: { id: number } | PedidoRaw; // depende do retorno atual
  automovel?: Automovel;
}

export interface Rendimento {
  id: number;
  valor: number;
  empregador?: string;
  usuario?: Usuario;
}

/* --------------------------------------------------
 * Funções de transformação
 * -------------------------------------------------- */
export function mapPedidoToUI(p: PedidoRaw): PedidoUI {
  return {
    id: p.id,
    status: p.status,
    data: p.dataPedido,
    clienteNome: p.cliente?.nome,
    automovelLabel: p.automovel ? `${p.automovel.marca ?? ''} ${p.automovel.modelo ?? ''}`.trim() || p.automovel.placa : undefined,
    raw: p
  };
}

/* --------------------------------------------------
 * Endpoints de Alto Nível
 * -------------------------------------------------- */

// Login
export function sanitizeUsuario(u: Usuario): Usuario {
  if (!u) return u;
  const { senha, ...rest } = u as any; // remove senha
  return rest as Usuario;
}

export async function login(cpf: string, senha: string) {
  const cleanCpf = (cpf || '').replace(/\D/g, '');
  try {
    const resp = await api.post<{ usuario: Usuario; tipo: TipoUsuario }>(`/usuarios/login`, { cpf: cleanCpf, senha });
    return { ...resp, usuario: sanitizeUsuario(resp.usuario) };
  } catch (e: any) {
    if (e instanceof ApiError) {
      if (e.status === 400) {
        throw new ApiError('Dados inválidos: verifique CPF e senha', e.status, e.path, e.body);
      }
      if (e.status === 401) {
        throw new ApiError('CPF ou senha incorretos', e.status, e.path, e.body);
      }
    }
    throw e;
  }
}

// Cadastro (Cliente ou Agente)
export async function registerCliente(data: {
  nome: string; cpf: string; rg: string; endereco: string; profissao: string; senha: string;
  rendaMensal?: number; empregador?: string;
}) {
  const payload: any = {
    nome: data.nome,
    cpf: (data.cpf || '').replace(/\D/g, ''),
    rg: data.rg,
    endereco: data.endereco,
    profissao: data.profissao,
    senha: data.senha,
    tipoUsuario: 'Cliente'
  };
  const usuario = await UsuariosApi.criar(payload);
  // Se o backend retornar conflito de CPF
  // Se houver renda, criar rendimento vinculado
  if (data.rendaMensal) {
    try { await UsuariosApi.adicionarRendimento(usuario.id, { valor: data.rendaMensal, empregador: data.empregador }); } catch { }
  }
  return sanitizeUsuario(usuario);
}

export async function registerAgente(data: {
  nomeAgente: string; tipoAgente: 'Empresa' | 'Banco';
  cpfResponsavel: string; senha: string; endereco?: string;
}) {
  const payload: any = {
    nome: data.nomeAgente, // mapeando para nome base de Usuario
    cpf: (data.cpfResponsavel || '').replace(/\D/g, ''),
    rg: '',
    endereco: data.endereco || '',
    profissao: '',
    senha: data.senha,
    tipoUsuario: 'Agente',
    nomeAgente: data.nomeAgente,
    tipoAgente: data.tipoAgente
  };
  const agente = await AgentesApi.criar(payload as any);
  return sanitizeUsuario(agente as any);
}

// Usuarios / Clientes / Agentes
export const UsuariosApi = {
  listar: () => api.get<Usuario[]>(`/usuarios`),
  criar: (u: Partial<Usuario>) => api.post<Usuario>(`/usuarios`, u),
  obter: (id: number) => api.get<Usuario>(`/usuarios/${id}`),
  atualizar: (id: number, u: Partial<Usuario>) => api.put<Usuario>(`/usuarios/${id}`, u),
  deletar: (id: number) => api.delete(`/usuarios/${id}`),
  adicionarRendimento: (usuarioId: number, r: { empregador?: string; valor: number }) => api.post<Usuario>(`/usuarios/${usuarioId}/rendimentos`, r)
};

// Alias específicos caso queira separar no front (mesma estrutura de dados herdada)
export const ClientesApi = {
  listar: () => api.get<Usuario[]>(`/clientes`),
  criar: (c: Partial<Usuario>) => api.post<Usuario>(`/clientes`, c),
  obter: (id: number) => api.get<Usuario>(`/clientes/${id}`),
  atualizar: (id: number, c: Partial<Usuario>) => api.put<Usuario>(`/clientes/${id}`, c),
  deletar: (id: number) => api.delete(`/clientes/${id}`)
};

export const AgentesApi = {
  listar: () => api.get<Usuario[]>(`/agentes`),
  criar: (a: Partial<Usuario>) => api.post<Usuario>(`/agentes`, a),
  obter: (id: number) => api.get<Usuario>(`/agentes/${id}`),
  atualizar: (id: number, a: Partial<Usuario>) => api.put<Usuario>(`/agentes/${id}`, a),
  deletar: (id: number) => api.delete(`/agentes/${id}`)
};

export const RendimentosApi = {
  criar: (r: Partial<Rendimento>) => api.post<Rendimento>(`/rendimentos`, r),
  listar: () => api.get<Rendimento[]>(`/rendimentos`),
  obter: (id: number) => api.get<Rendimento>(`/rendimentos/${id}`),
  atualizar: (id: number, r: Partial<Rendimento>) => api.put<Rendimento>(`/rendimentos/${id}`, r),
  deletar: (id: number) => api.delete(`/rendimentos/${id}`)
};

export const AutomoveisApi = {
  listar: () => api.get<Automovel[]>(`/automoveis`),
  criar: (a: Partial<Automovel> & { proprietario?: { id: number } }) => api.post<Automovel>(`/automoveis`, a),
  obter: (id: number) => api.get<Automovel>(`/automoveis/${id}`),
  atualizar: (id: number, a: Partial<Automovel>) => api.put<Automovel>(`/automoveis/${id}`, a),
  deletar: (id: number) => api.delete(`/automoveis/${id}`)
};

export const PedidosApi = {
  listar: async () => (await api.get<PedidoRaw[]>(`/pedidos`)).map(mapPedidoToUI),
  listarPorCliente: async (clienteId: number) => (await api.get<PedidoRaw[]>(`/pedidos/cliente/${clienteId}`)).map(mapPedidoToUI),
  obter: async (id: number) => mapPedidoToUI(await api.get<PedidoRaw>(`/pedidos/${id}`)),
  criar: async (payload: { clienteId: number; automovelId: number; status?: StatusPedido }) => {
    const body = {
      status: payload.status ?? 'PENDENTE',
      cliente: { id: payload.clienteId },
      automovel: { id: payload.automovelId }
    };
    const created = await api.post<PedidoRaw>(`/pedidos`, body);
    return mapPedidoToUI(created);
  },
  atualizar: async (id: number, p: Partial<PedidoRaw>) => mapPedidoToUI(await api.put<PedidoRaw>(`/pedidos/${id}`, p)),
  atualizarStatus: async (id: number, status: StatusPedido) => mapPedidoToUI(await api.patch<PedidoRaw>(`/pedidos/${id}/status`, { status })),
  deletar: (id: number) => api.delete(`/pedidos/${id}`)
};

export const ContratosApi = {
  listar: () => api.get<Contrato[]>(`/contratos`),
  criar: (c: Partial<Contrato>) => api.post<Contrato>(`/contratos`, c),
  obter: (id: number) => api.get<Contrato>(`/contratos/${id}`),
  atualizar: (id: number, c: Partial<Contrato>) => api.put<Contrato>(`/contratos/${id}`, c),
  deletar: (id: number) => api.delete(`/contratos/${id}`)
};

export const CreditosApi = {
  listar: () => api.get<Credito[]>(`/creditos`),
  criar: (c: Partial<Credito> & { banco?: { id: number } }) => api.post<Credito>(`/creditos`, c),
  obter: (id: number) => api.get<Credito>(`/creditos/${id}`),
  atualizar: (id: number, c: Partial<Credito>) => api.put<Credito>(`/creditos/${id}`, c),
  deletar: (id: number) => api.delete(`/creditos/${id}`)
};

export const EntidadesEmpregadorasApi = {
  listar: () => api.get<{ id: number; nome: string }[]>(`/entidades-empregadoras`),
  criar: (e: { nome: string }) => api.post<{ id: number; nome: string }>(`/entidades-empregadoras`, e),
  obter: (id: number) => api.get<{ id: number; nome: string }>(`/entidades-empregadoras/${id}`),
  atualizar: (id: number, e: { nome: string }) => api.put<{ id: number; nome: string }>(`/entidades-empregadoras/${id}`, e),
  deletar: (id: number) => api.delete(`/entidades-empregadoras/${id}`)
};

/* --------------------------------------------------
 * Utilidades para React Query (chaves padronizadas)
 * -------------------------------------------------- */
export const QueryKeys = {
  usuarios: ['usuarios'] as const,
  automoveis: ['automoveis'] as const,
  pedidos: ['pedidos'] as const,
  pedido: (id: number) => ['pedidos', id] as const,
  pedidosCliente: (id: number) => ['pedidos', 'cliente', id] as const,
  contratos: ['contratos'] as const,
  creditos: ['creditos'] as const,
  rendimentos: ['rendimentos'] as const,
  entidades: ['entidades-empregadoras'] as const
};

// Export básico para retrocompatibilidade (se algum código antigo ainda usa apiGet etc.)
export const apiGet = api.get;
export const apiPost = api.post;
export const apiPut = api.put;
export const apiDelete = api.delete;

// Nota: Recomenda-se criar um arquivo .env.local com VITE_API_BASE=https://backstudentcoin.onrender.comw
// para evitar divergência de portas entre ambientes.
