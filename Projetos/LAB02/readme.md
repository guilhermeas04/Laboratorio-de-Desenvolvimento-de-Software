
# Laboratório de Desenvolvimento de Software — CarOn

Aplicação web de aluguel de carros (MVP) composta por um frontend SPA em React/Vite e um backend REST em Spring Boot. O projeto está organizado por laboratórios (LAB02, LAB03), sendo o LAB02 o foco principal com código funcional e artefatos.

## Visão geral

- Frontend: React 18 + Vite + TypeScript, Tailwind/shadcn, React Router, integração REST simples e um componente 3D de carro com React Three Fiber.
- Backend: Spring Boot 3 (Java 17), endpoints REST, persistência em memória (MVP) com opção de Postgres via profile.
- Deploy: orientado para Render (frontend) e Koyeb (backend), com variáveis de ambiente para configurar a API base.

## Arquitetura

- Client–Server (SPA + API REST)
	- Frontend SPA consome a API por HTTP/JSON.
	- CORS habilitado no backend para permitir o domínio do frontend.
	- Rotas separadas para perfis Cliente e Agente no frontend.
- Autenticação (MVP): login via CPF (roteamento por tipo de usuário), sem sessão/token persistidos.
- Persistência (MVP): armazenamento em memória no backend; profile alternativo para Postgres.

## Tecnologias

- Frontend
	- React 18, Vite, TypeScript
	- Tailwind CSS, PostCSS, Autoprefixer, shadcn/ui (Radix UI)
	- React Router v6
	- Sonner (toasts), Lucide-react (ícones)
	- @react-three/fiber, three (componente 3D `Car3D`)
- Backend
	- Spring Boot 3 (starter web, data-jpa)
	- Java 17, Maven
	- H2 (runtime para dev) e opção Postgres (profile `postgres`)

## Estrutura do repositório

```
Laboratorio-de-Desenvolvimento-de-Software/
├─ README.md  ← este arquivo
└─ Projetos/
	 ├─ LAB02/
	 │  ├─ Artefatos/ (diagramas, histórias, slides)
	 │  ├─ codigo/
	 │  │  ├─ backend/ (Spring Boot)
	 │  │  │  ├─ pom.xml
	 │  │  │  └─ src/main/java|resources
	 │  │  └─ frontend/ (React/Vite)
	 │  │     ├─ package.json
	 │  │     └─ src/ (App.tsx, pages, components, lib, context, hooks)
	 │  └─ readme.md
	 └─ LAB03/ (estrutura inicial)
```

## Como rodar localmente

Pré-requisitos
- Node.js 18+ e npm (para o frontend)
- Java 17 e Maven (para o backend)

Backend (Spring Boot)
1. Abra um terminal na pasta do backend:
	 - `Projetos/LAB02/codigo/src/backend`
2. Compile e rode:
	 - Windows PowerShell:
		 - `mvn -DskipTests spring-boot:run`
	 - ou empacote e rode o JAR:
		 - `mvn -DskipTests package`
		 - `java -jar target/demo-0.0.1-SNAPSHOT.jar`
3. A API subirá em `https://backstudentcoin.onrender.comw` (porta configurável via `server.port`).

Frontend (Vite)
1. Abra outro terminal na pasta do frontend:
	 - `Projetos/LAB02/codigo/src/frontend`
2. Instale dependências e rode:
	 - `npm install`
	 - Defina a URL da API (ex.: backend local):
		 - PowerShell: `$env:VITE_API_BASE = "https://backstudentcoin.onrender.comw"`
	 - `npm run dev`
3. Acesse `http://localhost:5173`.

Variáveis de ambiente úteis
- Frontend
	- `VITE_API_BASE` → URL base da API (ex.: `https://backstudentcoin.onrender.comw` ou URL do backend no Koyeb)
- Backend
	- `PORT` → porta que o servidor usa (Koyeb injeta automaticamente)
	- Perfil Postgres (opcional): `SPRING_PROFILES_ACTIVE=postgres`
		- `DATABASE_URL`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`

## Deploy

Frontend no Render (Static Site)
- Root Directory: `Projetos/LAB02/codigo/src/frontend`
- Build Command: `npm ci && npm run build`
- Publish Directory: `dist`
- Env Var: `VITE_API_BASE=https://<sua-api>.koyeb.app`
- Rewrites: `/* → /index.html` (Rewrite)

Backend no Koyeb (Web service)
- Root Directory (monorepo): `Projetos/LAB02/codigo/src/backend`
- Buildpacks (auto-detect)
- Procfile já presente:
	- `web: java -Dserver.port=$PORT -jar target/*.jar`
- Variáveis de ambiente conforme seção acima.

## Rotas relevantes (exemplos)
- Cliente: `/api/client/pedidos`, `/api/client/pedidos/:id`
- Agente: `/api/agent/pedidos` (MVP)
- Veículos: `/api/veiculos`

## Padrões e arquitetura (resumo)
- SPA + API REST
- Backend MVC (Controllers + Models; Services/Repositories reduzidos no MVP)
- Inversão de Controle do Spring (DI)
- Componentização no front, hooks para dados, roteamento por contexto (cliente/agente)

## Scripts úteis
- Backend
	- `mvn clean package`
	- `mvn spring-boot:run`
- Frontend
	- `npm run dev` (dev server)
	- `npm run build` (produção)
	- `npm run preview` (servir build local)

## Notas
- O componente `Car3D` usa primitivas do Three.js via React Three Fiber (sem asset GLB), somente para fins de apresentação.
- Alguns campos foram simplificados para alinhar o front e o back no MVP (ex.: remoções de campos não usados).

## Licença
Projeto acadêmico/laboratorial. Ajuste a licença conforme sua necessidade.

