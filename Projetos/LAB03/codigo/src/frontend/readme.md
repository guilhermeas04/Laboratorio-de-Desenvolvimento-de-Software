# LAB03 Frontend (React + Vite)

Protótipo inicial do front-end do Sistema de Moeda Estudantil (Release 1).

## Requisitos
- Node.js 18+

## Instalação

1. Instale as dependências
```powershell
npm install
```

2. Rode em desenvolvimento
```powershell
npm run dev
```

3. Variáveis de ambiente (opcional)
Crie `.env` com a base da API se necessário:
```
VITE_API_BASE=https://backstudentcoin.onrender.comw
```

## Scripts
- `npm run dev`: inicia o servidor de desenvolvimento
- `npm run build`: build de produção
- `npm run preview`: pré-visualiza o build

## Logins de demonstração (memória local)
- Alunos (acesse `/login/aluno`):
	- ana@uni.br
	- bruno@uni.br
	- clara@uni.br
- Professores (acesse `/login/professor`):
	- carlos@uni.br
	- maria@uni.br
	- joao@uni.br
- Empresas (acesse `/login/empresa`):
	- contato@empresa.com
	- contato@acme.com
	- contato@techstore.com

Observações:
- Senha é livre (não validada nesta demo).
- Os dados ficam salvos em localStorage; para resetar, limpe o storage do navegador ou use `store.reset()` no console.

