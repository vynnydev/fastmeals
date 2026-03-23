![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white)
![RabbitMQ](https://img.shields.io/badge/RabbitMQ-3.13-FF6600?logo=rabbitmq&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-28-2496ED?logo=docker&logoColor=white)
![Nginx](https://img.shields.io/badge/Nginx-Alpine-009639?logo=nginx&logoColor=white)
![AWS Bedrock](https://img.shields.io/badge/AWS_Bedrock-Claude-232F3E?logo=amazon-aws&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748?logo=prisma&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-3.0-6E9F18?logo=vitest&logoColor=white)
![Tests](https://img.shields.io/badge/Tests-180+-22c55e?logo=checkmarx&logoColor=white)

# 🍔 FastMeals — Sistema de Gerenciamento de Pedidos e Entregas

Plataforma fullstack de gerenciamento de delivery com **6 microserviços**, **dashboard analítico**, **algoritmo de otimização Hungarian** e **AI Insights com AWS Bedrock**.

---

## 📑 Índice

1. [Demo](#-demo)
2. [Arquitetura](#-arquitetura)
3. [Como Rodar](#-como-rodar)
4. [Stack Tecnológica](#-stack-tecnológica)
5. [Microserviços](#-microserviços)
6. [Frontend](#-frontend)
7. [Algoritmo de Otimização](#-algoritmo-de-otimização)
8. [Testes](#-testes)
9. [Estrutura do Projeto](#-estrutura-do-projeto)
10. [Documentação](#-documentação)
11. [Variáveis de Ambiente](#-variáveis-de-ambiente)
12. [Autor](#-autor)

---

## 🎬 Demo

<!-- OPÇÃO 1: Vídeo no YouTube (recomendado) -->
<!-- [![FastMeals Demo](docs/screenshots/demo-thumbnail.png)](https://youtu.be/SEU_VIDEO_ID) -->

<!-- OPÇÃO 2: GIF inline -->
<!-- ![FastMeals Demo](docs/screenshots/demo.gif) -->

<!-- OPÇÃO 3: Link direto -->
<!-- 🎥 **[Assistir demo completa (2 min)](https://youtu.be/SEU_VIDEO_ID)** -->

> 🎥 **Demo em vídeo:** Em breve

---

## 🏗 Arquitetura

<!-- Inserir diagrama draw.io exportado -->
<!-- ![Arquitetura](docs/diagrams/architecture-overview.png) -->

A plataforma segue uma arquitetura de **microserviços** com **Clean Architecture** e princípios **SOLID**, orquestrada por Docker Compose com Nginx como API Gateway.

```
┌─────────────┐     ┌──────────────┐     ┌──────────────────────────────────────┐
│   Frontend   │────▶│    Nginx     │────▶│           Microserviços              │
│  Next.js 15  │     │  API Gateway │     │                                      │
│  port: 3000  │     │  port: 80    │     │  Auth ─ Products ─ Orders ─ Delivery │
└─────────────┘     └──────────────┘     │  Optimization ─ Reports              │
                                          └──────────────────────────────────────┘
                                                    │              │
                                              ┌─────┴─────┐  ┌────┴────┐
                                              │ RabbitMQ  │  │  Redis  │
                                              │  Events   │  │ Tokens  │
                                              └───────────┘  └─────────┘
```

**Padrões implementados:**

- **Database per Service** — cada serviço com seu PostgreSQL isolado
- **CQRS** — reports-service com read model dedicado
- **Event-Driven** — RabbitMQ (topic exchange) para comunicação assíncrona
- **API Gateway** — Nginx roteando requests para os serviços corretos
- **Clean Architecture** — Domain → Application → Infrastructure → Lambda
- **Lambda per Use Case** — cada operação é uma função independente (20 Lambda handlers)

<!-- Inserir diagrama draw.io das camadas Clean Architecture -->
<!-- ![Clean Architecture](docs/diagrams/clean-architecture-layers.png) -->

**Camadas por microserviço:**

```
src/
├── domain/          → Entities, Value Objects, Repository Interfaces
├── application/     → Use Cases, DTOs, Service Interfaces
├── infrastructure/  → Prisma, HTTP Clients, Express Controllers, Config
└── lambda/          → AWS Lambda Handlers (1 per use case)
```

---

## 🚀 Como Rodar

### Pré-requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (>= 4.0)
- [Node.js](https://nodejs.org/) (>= 20) — apenas para desenvolvimento local
- [Git](https://git-scm.com/)

### Com Docker (recomendado) — 3 comandos

```bash
# 1. Clonar o repositório
git clone https://github.com/vynnydev/fastmeals.git
cd fastmeals

# 2. Subir todos os serviços (14 containers)
docker compose up --build -d

# 3. Preparar bancos de dados (migrations + seed)
./scripts/prepare-services-linux-mac.sh
```

Acesse:

| Aplicação | URL |
|-----------|-----|
| **Frontend** | http://localhost:3000 |
| **API Gateway (Nginx)** | http://localhost |
| **RabbitMQ Management** | http://localhost:15672 (guest/guest) |

### Credenciais de acesso

| Email | Senha | Perfil | Permissões |
|-------|-------|--------|------------|
| admin@fastmeals.com | Admin@123 | Administrador | Acesso total: CRUD de produtos, pedidos, entregadores |
| viewer@fastmeals.com | Viewer@123 | Visualizador | Somente leitura: visualizar pedidos, produtos e relatórios |

### Sem Docker (desenvolvimento local)

```bash
# Terminal 1 — Infraestrutura
docker compose up auth-db products-db orders-db delivery-db reports-db redis rabbitmq -d

# Terminal 2..7 — Cada serviço
cd backend/services/auth-service && npm install && npm run seed && npm run dev
cd backend/services/products-service && npm install && npm run seed && npm run dev
cd backend/services/orders-service && npm install && npm run seed && npm run dev
cd backend/services/delivery-service && npm install && npm run seed && npm run dev
cd backend/services/optimization-service && npm install && npm run dev
cd backend/services/reports-service && npm install && npm run seed && npm run dev

# Terminal 8 — Frontend
cd frontend && npm install && npm run dev
```

### Rodar testes

```bash
# Backend (em cada serviço)
cd backend/services/auth-service && npm test          # 19 testes
cd backend/services/products-service && npm test      # 24 testes
cd backend/services/orders-service && npm test        # 43 testes
cd backend/services/delivery-service && npm test      # 20 testes
cd backend/services/optimization-service && npm test  # 29 testes
cd backend/services/reports-service && npm test       # 18 testes

# Frontend
cd frontend && npm test -- --run                      # 27 testes

# Teste de fluxo completo (requer Docker rodando)
./scripts/test-flow.sh                                # 52 assertions
```

---

## 🛠 Stack Tecnológica

### Backend

| Tecnologia | Versão | Uso |
|-----------|--------|-----|
| Node.js | 20 LTS | Runtime |
| TypeScript | 5.7 | Tipagem estrita (`strict: true`, zero `any`) |
| Express | 4.21 | HTTP server |
| Prisma | 6.19 | ORM com PostgreSQL |
| PostgreSQL | 16 | Banco relacional (5 instâncias) |
| Redis | 7 | Token store para JWT refresh tokens |
| RabbitMQ | 3.13 | Mensageria assíncrona (topic exchange) |
| Zod | 3.24 | Validação de entrada |
| bcrypt | — | Hash de senhas (10 salt rounds) |
| JWT | — | Access token (15min) + Refresh token (7d) |
| AWS Bedrock | Claude | AI Insights no reports-service |
| Vitest | 3.0 | Framework de testes |
| Nginx | Alpine | API Gateway / reverse proxy |

### Frontend

| Tecnologia | Versão | Uso |
|-----------|--------|-----|
| Next.js | 15.3 | Framework React com App Router |
| React | 19 | UI library |
| TypeScript | 5.7 | Tipagem estrita |
| Tailwind CSS | 4 | Estilização utility-first |
| shadcn/ui | — | Componentes acessíveis (Radix UI) |
| Zustand | 5 | Gerenciamento de estado |
| React Hook Form | 7 | Formulários com validação |
| Zod | 3.24 | Schema validation |
| Recharts | 2.15 | Gráficos e visualizações |
| Axios | 1.7 | HTTP client com interceptors |
| next-themes | 0.4 | Dark/Light mode |
| Vitest + RTL | — | Testes unitários e integração |

---

## 🔧 Microserviços

| Serviço | Porta | Banco | Testes | Responsabilidade |
|---------|-------|-------|--------|-----------------|
| [auth-service](backend/services/auth-service/README.md) | 3001 | auth_db + Redis | 19 | JWT login, refresh token, bcrypt |
| [products-service](backend/services/products-service/README.md) | 3002 | products_db | 24 | CRUD produtos, paginação, busca |
| [orders-service](backend/services/orders-service/README.md) | 3003 | orders_db | 43 | Pedidos, máquina de estados, inter-service |
| [delivery-service](backend/services/delivery-service/README.md) | 3004 | delivery_db | 20 | CRUD entregadores, disponibilidade |
| [optimization-service](backend/services/optimization-service/README.md) | 3005 | — (stateless) | 29 | Hungarian Algorithm + Haversine |
| [reports-service](backend/services/reports-service/README.md) | 3006 | reports_db (CQRS) | 18 | Analytics, AI Insights (Bedrock) |

### Comunicação entre serviços

```
orders-service ──HTTP──▶ products-service     (validar produtos + snapshot preço)
orders-service ──HTTP──▶ delivery-service     (validar entregador + disponibilidade)
orders-service ──AMQP──▶ RabbitMQ            (order.created, order.status.changed)
delivery-service ◀──AMQP── RabbitMQ          (atualizar status do entregador)
optimization-service ──HTTP──▶ orders-service (buscar pedidos ready)
optimization-service ──HTTP──▶ delivery-service (buscar entregadores disponíveis)
reports-service ──SQL──▶ reports_db           (CQRS read model cross-domain)
```

### Máquina de estados dos pedidos

```
  pending → preparing → ready → delivering → delivered
    │          │         │
    └──────────┴─────────┴──→ cancelled
```

| De | Para | Condição |
|----|------|----------|
| pending | preparing, cancelled | — |
| preparing | ready, cancelled | — |
| ready | delivering | Requer `deliveryPersonId` atribuído |
| ready | cancelled | — |
| delivering | delivered | — |

> `delivering → cancelled` **não é permitido**. `delivered` e `cancelled` são estados finais.

---

## 🖥 Frontend

### Dashboard Overview

<!-- ![Dashboard](docs/screenshots/dashboard-overview.png) -->

Visão geral com stat cards animados (receita, pedidos, entregas, tempo médio), gráficos de pedidos por status, top produtos e últimos pedidos em tabela.

### Gestão de Pedidos

<!-- ![Pedidos](docs/screenshots/orders-page.png) -->

Três visualizações (Tabela/Cards/Kanban), criação de pedido com carrinho de produtos, transição de status, atribuição manual de entregador e cancelamento.

### Gestão de Produtos

<!-- ![Produtos](docs/screenshots/products-page.png) -->

Grid e tabela com filtros por categoria (Refeições/Bebidas/Sobremesas/Acompanhamentos), busca por nome, CRUD completo com modal de detalhes e imagem.

### Entregadores & Otimização

<!-- ![Entregadores](docs/screenshots/delivery-optimization.png) -->

Cards e Kanban de entregadores (Disponíveis/Em Entrega/Inativos), CRUD completo, e aba de **Otimização** com algoritmo Hungarian mostrando atribuições sugeridas, distâncias calculadas e comparação antes/depois.

### Relatórios & AI Insights

<!-- ![Relatórios](docs/screenshots/reports-page.png) -->

Receita diária, pedidos por status, top produtos, tempo de entrega por veículo (Motocicleta/Bicicleta/Carro), filtro por período, e **Insights com IA** via AWS Bedrock (Claude) gerando resumo, recomendações e destaques.

### Destaques de UX

| Feature | Descrição |
|---------|-----------|
| Números animados | Contagem progressiva com easing nos stat cards |
| Skeleton loading | Feedback visual durante carregamento |
| Empty states | Mensagens descritivas quando não há dados |
| Error states | Tratamento de erros com botão retry |
| Dark/Light mode | Toggle no header com `next-themes` |
| Responsividade | Sidebar mobile com hambúrguer menu |
| Permissões | Viewer não vê botões de escrita (CRUD) |
| Kanban drivers | Visualização por status com detalhes do pedido atual |
| Máscara de telefone | Formatação automática `(XX) XXXXX-XXXX` |
| Atribuição manual | Select com entregadores ocupados desabilitados |

---

## 🧠 Algoritmo de Otimização

### Hungarian Algorithm (Kuhn-Munkres) — O(n³)

Resolve o **Problema de Atribuição**: dado N entregadores e M pedidos com status `ready`, encontra a atribuição que **minimiza a distância total percorrida**.

```
          Pedido 1    Pedido 2
Pessoa A:  1 km        2 km
Pessoa B:  3 km       10 km

Greedy:    A→1 (1km) + B→2 (10km) = 11 km
Hungarian: A→2 (2km) + B→1 (3km)  =  5 km  ← 54% melhor
```

### Haversine — O(1)

Calcula a distância geodésica (curvatura da Terra) entre dois pontos:

```
a = sin²((lat2 - lat1) / 2) + cos(lat1) · cos(lat2) · sin²((lon2 - lon1) / 2)
c = 2 · atan2(√a, √(1-a))
d = R · c   (R = 6371 km)
```

### Performance

| Cenário | Tempo | Requisito |
|---------|-------|-----------|
| 30 entregadores × 50 pedidos | **87ms** | < 2.000ms |
| 10 × 10 | < 5ms | — |
| 1 × 1 | < 1ms | — |

### Endpoint

```
POST /api/orders/optimize-assignment
```

Retorna `assignments` (pedido → entregador com distância), `unassigned` (pedidos sem entregador disponível) e `totalDistanceKm`.

---

## 🧪 Testes

| Camada | Framework | Quantidade | Cobertura |
|--------|-----------|-----------|-----------|
| Backend (unit) | Vitest | 80+ | Use cases, algoritmos, value objects |
| Backend (integration) | Vitest + Supertest | 73+ | Controllers HTTP, auth, validation |
| Backend (flow) | Shell script | 52 | Fluxo real entre todos os serviços |
| Frontend (unit/integration) | Vitest + RTL | 27 | Componentes, hooks, interações, login |
| **Total** | — | **180+ testes** | — |

### Distribuição por serviço

| Serviço | Testes | Destaques |
|---------|--------|-----------|
| auth-service | 19 | Login, refresh token, bcrypt, rate limiting |
| products-service | 24 | CRUD, paginação, busca, delete protection |
| orders-service | 43 | Status machine (todas as transições), inter-service, price snapshot |
| delivery-service | 20 | CRUD, available filter, delete protection |
| optimization-service | 29 | Hungarian correctness, Haversine accuracy, performance 30×50 |
| reports-service | 18 | Revenue, orders-by-status, top-products, AI insights |
| frontend | 27 | EmptyState, StatCard, StatusBadge, ProductFilter, login flow, hooks |

---

## 📁 Estrutura do Projeto

```
fastmeals/
├── DECISIONS.md                       # 16 Architecture Decision Records
├── README.md                          # Este arquivo
├── docker-compose.yml                 # Orquestração (14 containers)
├── nginx/
│   └── nginx.conf                     # API Gateway routing
├── scripts/
│   ├── prepare-services-linux-mac.sh  # Setup automático (migrations + seed)
│   ├── prepare-services-win.bat       # Versão Windows
│   └── test-flow.sh                   # 52 assertions de fluxo
├── backend/
│   └── services/
│       ├── auth-service/              # 🔐 JWT + Redis (19 testes)
│       ├── products-service/          # 📦 CRUD produtos (24 testes)
│       ├── orders-service/            # 📋 Pedidos + state machine (43 testes)
│       ├── delivery-service/          # 🚴 Entregadores (20 testes)
│       ├── optimization-service/      # 🧠 Hungarian + Haversine (29 testes)
│       └── reports-service/           # 📊 Analytics + AI (18 testes)
├── frontend/                          # 🖥 Next.js 15 (27 testes)
│   ├── app/(dashboard)/               # Rotas: /, /orders, /products, /delivery, /reports
│   ├── components/                    # shadcn/ui + custom components
│   ├── hooks/                         # useAnimatedCounter, useRole, useAuth
│   ├── stores/                        # Zustand (auth, ui, orders, delivery)
│   ├── lib/                           # API client (Axios), utils
│   ├── types/                         # TypeScript interfaces
│   └── tests/                         # 27 testes (Vitest + RTL)
├── docs/
│   ├── api-spec.md                    # Especificação completa da API
│   ├── database-schema.md             # Schema do banco de dados
│   ├── evaluation-criteria.md         # Critérios de avaliação
│   ├── screenshots/                   # Screenshots e vídeo demo
│   └── diagrams/                      # Diagramas draw.io
└── seed/
    └── data.json                      # Dados de exemplo
```

---

## 📖 Documentação

| Documento | Descrição |
|-----------|-----------|
| [DECISIONS.md](DECISIONS.md) | 16 ADRs — decisões arquiteturais com trade-offs |
| [API Spec](docs/api-spec.md) | Especificação completa de todos os endpoints |
| [Database Schema](docs/database-schema.md) | Esquema do banco de dados |
| [Auth Service](backend/services/auth-service/README.md) | JWT, Redis, bcrypt |
| [Products Service](backend/services/products-service/README.md) | CRUD com paginação e busca |
| [Orders Service](backend/services/orders-service/README.md) | State machine, inter-service, RabbitMQ |
| [Delivery Service](backend/services/delivery-service/README.md) | CRUD, disponibilidade, RabbitMQ |
| [Optimization Service](backend/services/optimization-service/README.md) | Hungarian O(n³), Haversine |
| [Reports Service](backend/services/reports-service/README.md) | Analytics, CQRS, AI Insights |

---

## 🔑 Variáveis de Ambiente

Todas as variáveis estão definidas no `docker-compose.yml`. Para desenvolvimento local, copie `.env.example` para `.env` em cada serviço.

| Variável | Serviços | Descrição |
|----------|----------|-----------|
| `DATABASE_URL` | auth, products, orders, delivery, reports | Connection string PostgreSQL |
| `JWT_ACCESS_SECRET` | Todos | Secret compartilhado para validação JWT |
| `REDIS_URL` | auth | URL do Redis para token store |
| `RABBITMQ_URL` | orders, delivery | URL do RabbitMQ |
| `PRODUCTS_SERVICE_URL` | orders, optimization | HTTP client para products-service |
| `DELIVERY_SERVICE_URL` | orders, optimization | HTTP client para delivery-service |
| `ORDERS_SERVICE_URL` | optimization | HTTP client para orders-service |
| `AWS_REGION` | reports | Região AWS para Bedrock |
| `AWS_ACCESS_KEY_ID` | reports | Credencial AWS (opcional — fallback local) |
| `CORS_ORIGIN` | Todos | Origem permitida (`http://localhost:3000`) |
| `NEXT_PUBLIC_API_URL` | frontend | URL do API Gateway (Nginx) |

---

## 🐳 Docker

O `docker-compose.yml` orquestra **14 containers**:

| Container | Imagem | Porta | Função |
|-----------|--------|-------|--------|
| auth-db | postgres:16-alpine | 5433 | Banco auth |
| products-db | postgres:16-alpine | 5434 | Banco products |
| orders-db | postgres:16-alpine | 5435 | Banco orders |
| delivery-db | postgres:16-alpine | 5436 | Banco delivery |
| reports-db | postgres:16-alpine | 5437 | Banco reports (CQRS) |
| redis | redis:7-alpine | 6379 | Token store |
| rabbitmq | rabbitmq:3.13-management | 5672 / 15672 | Mensageria + UI |
| auth-service | node:20-alpine | 3001 | Microserviço |
| products-service | node:20-alpine | 3002 | Microserviço |
| orders-service | node:20-alpine | 3003 | Microserviço |
| delivery-service | node:20-alpine | 3004 | Microserviço |
| optimization-service | node:20-alpine | 3005 | Microserviço |
| reports-service | node:20-alpine | 3006 | Microserviço |
| nginx | nginx:alpine | 80 | API Gateway |
| frontend | node:20-alpine | 3000 | Dashboard |

---

## 👨‍💻 Autor

**Vinicius Prudencio** — VynnyTech

[![GitHub](https://img.shields.io/badge/GitHub-vynnydev-181717?logo=github&logoColor=white)](https://github.com/vynnydev)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-vynnydev-0A66C2?logo=linkedin&logoColor=white)](https://linkedin.com/in/vynnydev)

---

*Desenvolvido como teste técnico para Eyecare Health — Março 2026*
