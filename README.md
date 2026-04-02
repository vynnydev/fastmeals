![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![Module Federation](https://img.shields.io/badge/Module_Federation-Microfrontends-FF6F00?logo=webpack&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white)
![RabbitMQ](https://img.shields.io/badge/RabbitMQ-3.13-FF6600?logo=rabbitmq&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-28-2496ED?logo=docker&logoColor=white)
![Nginx](https://img.shields.io/badge/Nginx-Alpine-009639?logo=nginx&logoColor=white)
![AWS Bedrock](https://img.shields.io/badge/AWS_Bedrock-Amazon_Nova-232F3E?logo=amazon-aws&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748?logo=prisma&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-3.0-6E9F18?logo=vitest&logoColor=white)
![Tests](https://img.shields.io/badge/Tests-210+-22c55e?logo=checkmarx&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-E2E_28_tests-2EAD33?logo=playwright&logoColor=white)
![Terraform](https://img.shields.io/badge/Terraform-1.7-844FBA?logo=terraform&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-Cloud-FF9900?logo=amazon-aws&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.21-000000?logo=express&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-5-433e38?logo=react&logoColor=white)
![Lambda](https://img.shields.io/badge/AWS_Lambda-23_Functions-FF9900?logo=awslambda&logoColor=white)
![Amplify](https://img.shields.io/badge/AWS_Amplify-Microfrontends-FF9900?logo=awsamplify&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-CI/CD-2088FF?logo=githubactions&logoColor=white)
![SonarCloud](https://img.shields.io/badge/SonarCloud-Quality_Gate-F3702A?logo=sonarcloud&logoColor=white)
![Datadog](https://img.shields.io/badge/Datadog-Observability-632CA6?logo=datadog&logoColor=white)
![Clean Architecture](https://img.shields.io/badge/Clean_Architecture-SOLID-4CAF50?logo=architect&logoColor=white)

> 🌐 **Live:** [https://fastmeals.com.br](https://fastmeals.com.br) | **API:** [https://t2fwiydcrc.execute-api.us-east-1.amazonaws.com](https://t2fwiydcrc.execute-api.us-east-1.amazonaws.com/api/products)

# 🍔 FastMeals — Sistema de Gerenciamento de Pedidos e Entregas

Plataforma fullstack de gerenciamento de delivery com **6 microserviços**, **5 microfrontends**, **dashboard analítico**, **algoritmo de otimização Hungarian**, **AI Insights com AWS Bedrock** e **observabilidade com Datadog**.

---

## 📑 Índice

1. [Demo](#-demo)
2. [Arquitetura](#-arquitetura)
3. [Clean Architecture + SOLID](#-clean-architecture--solid)
4. [Como Rodar](#-como-rodar)
5. [Stack Tecnológica](#-stack-tecnológica)
6. [Microserviços](#-microserviços)
7. [Frontend — Microfrontends](#-frontend--microfrontends)
8. [Algoritmo de Otimização](#-algoritmo-de-otimização)
9. [Infraestrutura AWS](#️-infraestrutura-aws)
10. [Banco de Dados](#️-banco-de-dados)
11. [Bastion Host — Acesso ao RDS](#-bastion-host--acesso-ao-rds)
12. [Observabilidade — Datadog](#-observabilidade--datadog)
13. [CI/CD Pipeline](#-cicd-pipeline)
14. [Testes](#-testes)
15. [Estrutura do Projeto](#-estrutura-do-projeto)
16. [Documentação](#-documentação)
17. [Variáveis de Ambiente](#-variáveis-de-ambiente)
18. [Docker](#-docker)
19. [Autor](#-autor)

---

<!-- GIF de apresentação da aplicação -->

![FastMeals Demo](docs/fastmeals.gif)

---

## 🏗 Arquitetura

A plataforma segue uma arquitetura de **microserviços** no backend e **microfrontends** no frontend, ambos com **Clean Architecture** e princípios **SOLID**. O backend é orquestrado por Docker Compose com Nginx como API Gateway local, e em produção roda como Lambda Functions via API Gateway HTTP. O frontend utiliza Module Federation para compor 5 SPAs independentes.

![Arquitetura Geral](docs/diagrams/images/01-architecture-overview.drawio.png)

**Padrões implementados:**

- **Database per Service** — cada serviço com seu PostgreSQL isolado
- **CQRS** — reports-service com read model dedicado
- **Event-Driven** — RabbitMQ (topic exchange) para comunicação assíncrona
- **API Gateway** — Nginx (local) / AWS API Gateway HTTP (produção)
- **Clean Architecture** — Domain → Application → Infrastructure → Lambda
- **Lambda per Use Case** — cada operação é uma função independente (23 Lambda handlers)
- **Microfrontends** — Module Federation com shell host + 4 remotes independentes

&nbsp;

---

## 🧅 Clean Architecture + SOLID

Cada microserviço segue 4 camadas com a Dependency Rule: dependências apontam sempre para dentro — Domain nunca conhece Infrastructure.

![Clean Architecture + SOLID](docs/diagrams/images/02-clean-architecture-solid.drawio.png)

**Camadas por microserviço:**

```
src/
├── domain/          → Entities, Value Objects, Repository Interfaces
├── application/     → Use Cases, DTOs, Service Interfaces
├── infrastructure/  → Prisma, HTTP Clients, Express Controllers, Config
└── lambda/          → AWS Lambda Handlers (1 per use case)
```

&nbsp;

---

## 🚀 Como Rodar

### Pré-requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (>= 4.0)
- [Node.js](https://nodejs.org/) (>= 20) — apenas para desenvolvimento local
- [Git](https://git-scm.com/)

&nbsp;

### Com Docker (recomendado) — 3 comandos

```bash
# 1. Clonar o repositório
git clone https://github.com/vynnydev/fastmeals.git
cd fastmeals

# 2. Subir todos os serviços (19 containers: 7 infra + 6 backend + 5 frontend + 1 gateway)
docker compose up --build -d

# 3. Preparar bancos de dados (migrations + seed)
./scripts/prepare-services-linux-mac.sh
```

Acesse:

| Aplicação | URL |
|-----------|-----|
| **Frontend (Shell)** | http://localhost:5000 |
| **API Gateway (Nginx)** | http://localhost |
| **RabbitMQ Management** | http://localhost:15672 (guest/guest) |

> Os 4 remotes (orders :5001, products :5002, delivery :5003, reports :5004) são carregados automaticamente pelo shell via Module Federation.

&nbsp;

### Credenciais de acesso

| Email | Senha | Perfil | Permissões |
|-------|-------|--------|------------|
| admin@fastmeals.com | Admin@123 | Administrador | Acesso total: CRUD de produtos, pedidos, entregadores, otimização |
| viewer@fastmeals.com | Viewer@123 | Visualizador | Somente leitura: visualizar pedidos, produtos e relatórios |

&nbsp;

### Desenvolvimento local (Microfrontends)

```bash
# Terminal 1 — Infraestrutura
docker compose up auth-db products-db orders-db delivery-db reports-db redis rabbitmq -d

# Terminal 2..7 — Backend (cada serviço)
cd backend/services/auth-service && npm install && npm run seed && npm run dev
cd backend/services/products-service && npm install && npm run seed && npm run dev
cd backend/services/orders-service && npm install && npm run seed && npm run dev
cd backend/services/delivery-service && npm install && npm run seed && npm run dev
cd backend/services/optimization-service && npm install && npm run dev
cd backend/services/reports-service && npm install && npm run seed && npm run dev

# Terminal 8..14 — Frontend (shell + 4 remotes, cada remote precisa de build + preview)
cd frontend/microfrontends/shell && npm install && npm run dev

cd frontend/microfrontends/remote-orders && npm install && npm run dev:fed    # Terminal 9
cd frontend/microfrontends/remote-orders && npm run preview                   # Terminal 10

cd frontend/microfrontends/remote-products && npm install && npm run dev:fed  # Terminal 11
cd frontend/microfrontends/remote-products && npm run preview                 # Terminal 12

cd frontend/microfrontends/remote-delivery && npm install && npm run dev:fed  # Terminal 13
cd frontend/microfrontends/remote-delivery && npm run preview                 # Terminal 14

cd frontend/microfrontends/remote-reports && npm install && npm run dev:fed   # Terminal 15
cd frontend/microfrontends/remote-reports && npm run preview                  # Terminal 16
```

&nbsp;

### Rodar testes

```bash
# Backend (em cada serviço)
cd backend/services/auth-service && npm test          # 19 testes
cd backend/services/products-service && npm test      # 24 testes
cd backend/services/orders-service && npm test        # 43 testes
cd backend/services/delivery-service && npm test      # 20 testes
cd backend/services/optimization-service && npm test  # 29 testes
cd backend/services/reports-service && npm test       # 18 testes

# Teste de fluxo completo (requer Docker rodando)
./scripts/test-flow.sh                                # 52 assertions
```

&nbsp;

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
| Pino | 10 | Logs estruturados (JSON) |
| Swagger | 5.0 | Documentação OpenAPI (`/docs`) |
| bcrypt | — | Hash de senhas (10 salt rounds) |
| JWT | — | Access token (15min) + Refresh token (7d) |
| AWS Bedrock | Amazon Nova | AI Insights no reports-service |
| Vitest | 3.0 | Framework de testes |
| Nginx | Alpine | API Gateway / reverse proxy |

&nbsp;

### Frontend

| Tecnologia | Versão | Uso |
|-----------|--------|-----|
| Vite | 6 | Build tool + dev server |
| React | 18 | UI library |
| TypeScript | 5.7 | Tipagem estrita |
| Module Federation | @originjs/vite-plugin-federation | Microfrontends (shell + 4 remotes) |
| Tailwind CSS | 4 | Estilização utility-first |
| shadcn/ui | — | Componentes acessíveis (Radix UI) |
| Zustand | 5 | Gerenciamento de estado |
| React Hook Form | 7 | Formulários com validação (remote-products) |
| Zod | 3.24 | Schema validation |
| Recharts | 3 | Gráficos e visualizações (remote-reports) |
| Axios | 1.13 | HTTP client com interceptors |
| Sonner | 2 | Toast notifications |
| Playwright | latest | Testes E2E (28 testes) |

&nbsp;

### DevOps & Observabilidade

| Tecnologia | Uso |
|-----------|-----|
| Terraform | IaC — 9 módulos gerenciando toda a infraestrutura AWS |
| GitHub Actions | CI/CD — 6 workflows (CI, deploy, quality, IaC) |
| SonarCloud | Qualidade de código, cobertura, Quality Gate |
| Datadog | Observabilidade — métricas Lambda, logs, cold starts |
| AWS Amplify | Deploy frontend com CDN global e SSL automático |
| AWS Lambda | 23 funções serverless (Node.js 20) |
| AWS API Gateway | HTTP API com CORS e logging |

&nbsp;

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

&nbsp;

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

&nbsp;

### Máquina de estados dos pedidos

![Order State Machine](docs/diagrams/images/03-order-state-machine.drawio.png)

| De | Para | Condição |
|----|------|----------|
| pending | preparing, cancelled | — |
| preparing | ready, cancelled | — |
| ready | delivering | Requer `deliveryPersonId` atribuído |
| ready | cancelled | — |
| delivering | delivered | — |

> `delivering → cancelled` **não é permitido**. `delivered` e `cancelled` são estados finais.

&nbsp;

### Fluxo de criação de pedido

![Order Creation Flow](docs/diagrams/images/04-order-creation-flow.drawio.png)

&nbsp;

---

## 🖥 Frontend — Microfrontends

O frontend foi construído com arquitetura de **microfrontends** usando **Vite + Module Federation**, onde cada domínio de negócio é uma SPA independente que é composta em runtime pelo shell host.

<!-- Diagrama da arquitetura de microfrontends -->
![Microfrontends Architecture](docs/diagrams/images/08-microfrontends-architecture.drawio.png)

&nbsp;

### Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│  Shell (Host) — porta 5000                                  │
│  Auth, Dashboard, Layout, Sidebar, Header                   │
│  Tailwind CSS + @source directives (gerencia CSS global)    │
│                                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ Orders   │ │ Products │ │ Delivery │ │ Reports  │      │
│  │ :5001    │ │ :5002    │ │ :5003    │ │ :5004    │      │
│  │ remoteE. │ │ remoteE. │ │ remoteE. │ │ remoteE. │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
└─────────────────────────────────────────────────────────────┘
```

> Acesse o readme de cada microfrontend clicando no nome dele na tabela a seguir.

| Microfrontend | Porta | Expõe | Responsabilidade |
|--------------|-------|-------|------------------|
| [**Shell**](frontend/microfrontends/shell/readme-shell.md) | 5000 | — (host) | Auth, Dashboard, Layout, roteamento, Tailwind global |
| [**remote-orders**](frontend/microfrontends/remote-orders/readme-remote-orders.md) | 5001 | `OrdersPage` | Pedidos: tabela, cards, kanban, criação, status, atribuição |
| [**remote-products**](frontend/microfrontends/remote-products/readme-remote-products.md) | 5002 | `ProductsPage` | Produtos: grid, tabela, CRUD com react-hook-form + zod |
| [**remote-delivery**](frontend/microfrontends/remote-delivery/readme-remote-delivery.md) | 5003 | `DeliveryPage` | Entregadores: cards, kanban, CRUD, otimização Hungarian |
| [**remote-reports**](frontend/microfrontends/remote-reports/readme-remote-reports.md) | 5004 | `ReportsPage` | Relatórios: charts recharts, analytics, AI Insights Bedrock |

&nbsp;

### Decisões arquiteturais do frontend

| Decisão | Motivo |
|---------|--------|
| **Sem Tailwind nos remotes** | Shell gerencia todo o CSS via `@source` directives, evitando conflitos de CSS reset entre instâncias |
| **React no `shared` do federation** | Evita dual React instance crashes (`useSyncExternalStore` errors) |
| **recharts no `shared`** | Mesma razão — recharts usa hooks internos que precisam da mesma instância React |
| **Auth via localStorage** | Shell salva `fastmeals_user` + `fastmeals_token`; remotes lêem diretamente com fallback para Zustand persist |
| **Sonner ao invés de useToast** | Toast library sem dependência de contexto React — funciona em qualquer remote |
| **AvatarFallback sem AvatarImage** | `AvatarImage` do Radix usa `useSyncExternalStore` que crasha com dual React |

&nbsp;

### Funcionalidades por módulo

**Dashboard (Shell)** — Visão geral com stat cards animados (receita, pedidos, entregas, tempo médio), gráficos de pedidos por status e últimos pedidos.

**Gestão de Pedidos (remote-orders)** — Três visualizações (Tabela / Cards / Kanban), criação de pedido com carrinho de produtos, transição de status com validação, atribuição manual de entregador e cancelamento.

**Gestão de Produtos (remote-products)** — Grid e tabela com filtros por categoria (Refeições / Bebidas / Sobremesas / Acompanhamentos), busca por nome, CRUD completo com modal de detalhes, validação com zod.

**Entregadores e Otimização (remote-delivery)** — Cards e Kanban de entregadores (Disponíveis / Em Entrega / Inativos), CRUD completo, e aba de **Otimização** com algoritmo Hungarian mostrando atribuições sugeridas, distâncias calculadas (Haversine) e comparação greedy vs. ótimo.

**Relatórios e AI Insights (remote-reports)** — Receita diária, pedidos por status, ranking de top produtos, tempo de entrega por veículo (Moto / Bicicleta / Carro), filtro por período, e **Insights com IA** via AWS Bedrock (Amazon Nova) gerando resumo, recomendações e destaques.

&nbsp;

### Destaques de UX

| Feature | Descrição |
|---------|-----------|
| Números animados | Contagem progressiva com easing nos stat cards |
| Skeleton loading | Feedback visual durante carregamento |
| Empty states | Mensagens descritivas quando não há dados |
| Error states | Tratamento de erros com botão retry |
| Dark mode | Tema gold escuro com oklch colors |
| Responsividade | Sidebar colapsável, layout adaptativo mobile |
| Permissões | Viewer não vê botões de escrita (CRUD, otimização) |
| Kanban drivers | Visualização por status com detalhes do pedido atual |
| Máscara de telefone | Formatação automática `(XX) XXXXX-XXXX` |
| Atribuição manual | Select com entregadores ocupados desabilitados |

&nbsp;

---

## 🧠 Algoritmo de Otimização

![Optimization Flow](docs/diagrams/images/05-optimization-flow.drawio.png)

&nbsp;

### Hungarian Algorithm (Kuhn-Munkres) — O(n³)

Resolve o **Problema de Atribuição**: dado N entregadores e M pedidos com status `ready`, encontra a atribuição que **minimiza a distância total percorrida**.

```
          Pedido 1    Pedido 2
Pessoa A:  1 km        2 km
Pessoa B:  3 km       10 km

Greedy:    A→1 (1km) + B→2 (10km) = 11 km
Hungarian: A→2 (2km) + B→1 (3km)  =  5 km  ← 54% melhor
```

&nbsp;

### Haversine — O(1)

Calcula a distância geodésica (curvatura da Terra) entre dois pontos:

```
a = sin²((lat2 - lat1) / 2) + cos(lat1) · cos(lat2) · sin²((lon2 - lon1) / 2)
c = 2 · atan2(√a, √(1-a))
d = R · c   (R = 6371 km)
```

&nbsp;

### Performance

| Cenário | Tempo | Requisito |
|---------|-------|-----------|
| 30 entregadores × 50 pedidos | **87ms** | < 2.000ms |
| 10 × 10 | < 5ms | — |
| 1 × 1 | < 1ms | — |

&nbsp;

### Endpoint

```
POST /api/orders/optimize-assignment
```

Retorna `assignments` (pedido → entregador com distância), `unassigned` (pedidos sem entregador disponível) e `totalDistanceKm`.

&nbsp;

---

## ☁️ Infraestrutura AWS

Toda a infraestrutura é gerenciada por **Terraform** com **9 módulos**, estado remoto no S3 e locking com DynamoDB.

![AWS Infrastructure](docs/diagrams/images/06-aws-infrastructure.drawio.png)

&nbsp;

| Recurso | Serviço AWS | Especificação |
|---------|------------|---------------|
| Banco de dados | RDS PostgreSQL 16 | db.t3.micro, 5 databases, encrypted |
| Cache | ElastiCache Redis 7.1 | cache.t3.micro, token store |
| Mensageria | Amazon MQ RabbitMQ 3.13 | mq.t3.micro, AMQPS |
| Backend | 23 Lambda Functions | Node.js 20, 256MB, VPC, Datadog Extension |
| API | API Gateway HTTP | 23 routes, CORS, logs |
| Frontend | AWS Amplify | 1 app consolidado (shell + 4 remotes), CDN global |
| DNS | Route53 + ACM | fastmeals.com.br, wildcard HTTPS |
| Secrets | Secrets Manager | 9 secrets (DB, JWT, MQ, Bedrock) |
| Bastion | EC2 t3.micro | SSH tunnel para RDS e Redis |
| Observabilidade | Datadog | Métricas Lambda, logs, cold starts |
| Logs | CloudWatch | 14 dias retention |
| State | S3 + DynamoDB | Terraform remote state |

&nbsp;

### Módulos Terraform

```
infrastructure/terraform/
├── bootstrap/           # S3 bucket + DynamoDB table (state)
├── modules/
│   ├── networking/      # VPC, subnets, security groups, NAT GW
│   ├── database/        # RDS PostgreSQL (5 databases)
│   ├── cache/           # ElastiCache Redis
│   ├── messaging/       # Amazon MQ RabbitMQ
│   ├── lambda/          # 23 Lambda functions + IAM + Datadog
│   ├── api-gateway/     # API Gateway HTTP + routes
│   ├── frontend/        # Amplify (consolidated MFE app)
│   ├── dns/             # Route53 + ACM certificate
│   ├── bastion/         # EC2 bastion host (SSH tunnel)
│   └── secrets/         # Secrets Manager
└── environments/
    └── production/      # Entry point (main.tf)
```

&nbsp;

---

## 🗄️ Banco de Dados

A plataforma utiliza **PostgreSQL 16** via **Amazon RDS** com uma única instância compartilhada e **5 databases isolados** — cada microserviço tem seu próprio banco, seguindo o padrão de database-per-service.

&nbsp;

![Arquitetura de Bancos de Dados](docs/diagrams/images/09-database-architecture.drawio.png)

&nbsp;

### Arquitetura de Dados

| Database | Owner | Microserviço | Descrição |
|----------|-------|-------------|-----------|
| `auth_db` | `auth_user` | auth-service | Usuários, credenciais, tokens de refresh |
| `products_db` | `products_user` | products-service | Catálogo de produtos, categorias, preços |
| `orders_db` | `orders_user` | orders-service | Pedidos, itens, status, histórico |
| `delivery_db` | `delivery_user` | delivery-service | Entregadores, veículos, localização |
| `reports_db` | `reports_user` | reports-service | Read model (CQRS) para relatórios e analytics |

&nbsp;

### Padrão CQRS no Reports

O `reports_db` é um read model que replica dados dos demais bancos via eventos do RabbitMQ. Isso permite queries analíticas complexas sem impactar a performance dos serviços transacionais. As tabelas do reports (`orders`, `order_items`, `products`, `delivery_persons`) são sincronizadas via consumers que escutam eventos de criação e atualização.

&nbsp;

### Conexão Local (Docker)

| Database | Container | Porta Local | Credenciais |
|----------|-----------|-------------|-------------|
| auth_db | fastmeals-auth-db | 5433 | auth_user / auth_pass |
| products_db | fastmeals-products-db | 5434 | products_user / products_pass |
| orders_db | fastmeals-orders-db | 5435 | orders_user / orders_pass |
| delivery_db | fastmeals-delivery-db | 5436 | delivery_user / delivery_pass |
| reports_db | fastmeals-reports-db | 5437 | reports_user / reports_pass |

&nbsp;

### Conexão Produção (AWS RDS)

| Configuração | Valor |
|-------------|-------|
| **Engine** | PostgreSQL 16.4 |
| **Instance** | db.t3.micro |
| **Endpoint** | `fastmeals-postgres.cw3eceym6ad8.us-east-1.rds.amazonaws.com` |
| **Port** | 5432 |
| **Subnets** | Privadas (2 AZs) |
| **Encryption** | Habilitado |
| **Backups** | 7 dias de retenção automática |

&nbsp;

---

## 🔐 Bastion Host — Acesso ao RDS

O RDS está em uma subnet privada sem acesso direto pela internet. Para acessar os bancos de dados, utilizamos um **Bastion Host** — uma instância EC2 na subnet pública que serve como ponto de entrada seguro.

&nbsp;

### Arquitetura de Acesso

```
Seu computador (DBeaver)
        │
        │ SSH Tunnel (porta 15432)
        ▼
  ┌─────────────┐      ┌──────────────┐
  │   Bastion    │─────▶│   RDS        │
  │   EC2        │ 5432 │  PostgreSQL  │
  │  (pública)   │      │  (privada)   │
  └─────────────┘      └──────────────┘
   44.204.165.150     fastmeals-postgres...
```

&nbsp;

### Configuração

| Recurso | Valor |
|---------|-------|
| **Instance Type** | t3.micro |
| **AMI** | Amazon Linux 2023 |
| **Key Pair** | fastmeals-bastion |
| **Security Group** | SSH (22) + RDS (5432) + Redis (6379) |
| **IAM Role** | SSM Session Manager habilitado |
| **Ferramentas** | postgresql16, redis6 |

&nbsp;

### Como conectar via SSH Tunnel + DBeaver

```bash
# Passo 1 — Criar túnel SSH (deixe aberto)
ssh -i ~/.ssh/fastmeals-bastion.pem \
  -L 15432:fastmeals-postgres.cw3eceym6ad8.us-east-1.rds.amazonaws.com:5432 \
  ec2-user@44.204.165.150

# Passo 2 — No DBeaver: localhost:15432, user fastmeals_admin
```

&nbsp;

### Acesso direto via Bastion (psql)

```bash
ssh -i ~/.ssh/fastmeals-bastion.pem ec2-user@44.204.165.150
psql -h fastmeals-postgres.cw3eceym6ad8.us-east-1.rds.amazonaws.com -U fastmeals_admin -d orders_db
```

&nbsp;

---

## 📊 Observabilidade — Datadog

Todas as **23 Lambda functions** são instrumentadas com o **Datadog Extension Layer**, enviando métricas, logs e dados de invocação em tempo real.

&nbsp;

### Serverless Overview

![Datadog Serverless Overview](docs/images/observability/datadog-serverless-overview.png)

&nbsp;

### Lambda Detail — Invocações e Cold Starts

![Datadog Lambda Detail](docs/images/observability/datadog-lambda-detail.png)

&nbsp;

### O que é monitorado

| Métrica | Descrição |
|---------|-----------|
| **Invocations** | Número de invocações por função |
| **Duration** | Tempo de execução (avg, p50, p95, p99, max) |
| **Cold Starts** | Frequência e duração de cold starts |
| **Errors** | Taxa de erros por função |
| **Memory** | Consumo de memória por invocação |
| **Cost** | Custo estimado por função |
| **Logs** | Logs estruturados encaminhados automaticamente |

&nbsp;

### Configuração via Terraform

```hcl
# Habilitado via flag no módulo Lambda
datadog_enabled = true
datadog_site    = "us5.datadoghq.com"
```

O Terraform adiciona automaticamente a **Datadog Extension Layer** e as environment variables em todas as 23 funções Lambda.

&nbsp;

---

## 🔄 CI/CD Pipeline

6 workflows no GitHub Actions com deploy automático e quality gate.

![CI/CD Pipeline](docs/diagrams/images/07-cicd-pipeline.drawio.png)

| Pipeline | Trigger | O que faz |
|----------|---------|-----------|
| CI Backend | push development/main/improvements | Testa 6 serviços em paralelo (180+ testes) |
| CI Frontend | push development/main/improvements | Type check + build de todos os 5 microfrontends |
| SonarCloud | push + PR | Qualidade de código, cobertura, Quality Gate |
| Deploy Lambdas | merge to main | Build + zip + upload 23 Lambda functions |
| Deploy Frontend | merge to main | Amplify auto-deploy via webhook |
| Terraform | PR (plan) / merge (apply) | Infra as Code com review (9 módulos) |

&nbsp;

---

## 🧪 Testes

| Camada | Framework | Quantidade | Cobertura |
|--------|-----------|-----------|-----------|
| Backend (unit) | Vitest | 80+ | Use cases, algoritmos, value objects |
| Backend (integration) | Vitest + Supertest | 73+ | Controllers HTTP, auth, validation |
| Backend (flow) | Shell script | 52 | Fluxo real entre todos os serviços |
| Frontend (E2E) | Playwright | 28 | Login, navegação, todos os microfrontends |
| **Total** | — | **210+ testes** | — |

&nbsp;

Todos os testes backend são executados com `Vitest 3.x` e coverage via `@vitest/coverage-v8`, gerando reports em `lcov` para integração com SonarCloud. Os testes E2E utilizam **Playwright** com suporte a execução local e contra produção.

&nbsp;

---

### 🎭 Frontend — Testes E2E com Playwright

**28 testes end-to-end** validando o fluxo completo da aplicação em produção, cobrindo autenticação, navegação entre microfrontends e funcionalidades de cada módulo.

&nbsp;

![Playwright E2E Demo](docs/images/frontend/tests/playwright-e2e-demo.gif)

&nbsp;

![Playwright E2E Tests](docs/images/frontend/tests/playwright-e2e-tests.png)

&nbsp;

| Suite | Testes | O que valida |
|-------|--------|-------------|
| auth.spec.ts | 7 | Login admin/viewer, credenciais inválidas, form elements |
| dashboard.spec.ts | 6 | Stat cards, sidebar links, navegação entre páginas |
| orders.spec.ts | 3 | Carregamento do remote, listagem, botões de ação |
| products.spec.ts | 3 | Carregamento do remote, listagem, busca |
| delivery.spec.ts | 3 | Carregamento do remote, listagem, aba de otimização |
| reports.spec.ts | 3 | Carregamento do remote, conteúdo, filtros de data |
| smoke.spec.ts | 3 | Smoke tests em produção (login + todas as páginas) |

&nbsp;

**Como rodar:**

```bash
cd frontend/microfrontends/shell

# Contra produção
PLAYWRIGHT_BASE_URL=https://fastmeals.com.br npx playwright test --reporter=list

# Com browser visível (para gravação/demo)
PLAYWRIGHT_BASE_URL=https://fastmeals.com.br npx playwright test --headed --project=full-flow

# Modo interativo
PLAYWRIGHT_BASE_URL=https://fastmeals.com.br npx playwright test --ui
```

&nbsp;

---

### 🔬 Backend — Testes Unitários e de Integração

**155+ testes** com cobertura de use cases, controllers HTTP, validações e regras de negócio em todos os 6 microserviços.

&nbsp;

### 🔐 [auth-service](backend/services/auth-service/readme-auth-service.md) — 19 testes

Testes de autenticação JWT, refresh token com Redis, hash bcrypt e rate limiting. Cobertura de 100% nos use cases e controllers.

&nbsp;

![Auth Service Tests](docs/images/backend/services/tests/auth-service-tests.png)

&nbsp;

### 📦 [products-service](backend/services/products-service/readme-products-service.md) — 24 testes

CRUD completo de produtos com paginação, busca por nome/categoria, proteção contra delete de produtos vinculados a pedidos, e validação Zod.

&nbsp;

![Products Service Tests](docs/images/backend/services/tests/products-service-tests.png)

&nbsp;

### 📋 [orders-service](backend/services/orders-service/readme-orders-service.md) — 43 testes

O serviço mais testado. Cobre todas as transições da máquina de estados (pending → preparing → ready → delivering → delivered), comunicação inter-service (products + delivery), snapshot de preços e validação de regras de negócio.

&nbsp;

![Orders Service Tests](docs/images/backend/services/tests/orders-service-tests.png)

&nbsp;

### 🚴 [delivery-service](backend/services/delivery-service/readme-delivery-service.md) — 20 testes

CRUD de entregadores, filtro por disponibilidade, proteção contra delete de entregadores com entregas ativas, e validação de dados do veículo.

&nbsp;

![Delivery Service Tests](docs/images/backend/services/tests/delivery-service-tests.png)

&nbsp;

### 🧠 [optimization-service](backend/services/optimization-service/readme-optimization-service.md) — 29 testes

Validação da corretude do algoritmo Hungarian (atribuição ótima vs. greedy), precisão do Haversine (< 0.1% de erro), e performance com matrizes 30×50 em < 87ms.

&nbsp;

![Optimization Service Tests](docs/images/backend/services/tests/optimization-service-tests.png)

&nbsp;

### 📊 [reports-service](backend/services/reports-service/readme-reports-service.md) — 19 testes

Revenue por período, orders-by-status, top produtos, tempo médio de entrega, e AI Insights com fallback local quando o Bedrock não está disponível.

&nbsp;

![Reports Service Tests](docs/images/backend/services/tests/reports-service-tests.png)

&nbsp;

---

## 📁 Estrutura do Projeto

```
fastmeals/
├── DECISIONS.md                       # 16 Architecture Decision Records
├── README.md                          # Este arquivo
├── sonar-project.properties           # Configuração SonarCloud
├── docker-compose.yml                 # Orquestração (19 containers)
├── .github/workflows/                 # 6 CI/CD pipelines
├── nginx/
│   └── nginx.conf                     # API Gateway routing (local)
├── scripts/
│   ├── prepare-services-linux-mac.sh  # Setup automático (migrations + seed)
│   ├── prepare-services-win.bat       # Versão Windows
│   ├── deploy-lambdas.sh             # Deploy 23 Lambda functions
│   └── test-flow.sh                   # 52 assertions de fluxo
├── backend/
│   └── services/
│       ├── auth-service/              # 🔐 JWT + Redis (19 testes)
│       ├── products-service/          # 📦 CRUD produtos (24 testes)
│       ├── orders-service/            # 📋 Pedidos + state machine (43 testes)
│       ├── delivery-service/          # 🚴 Entregadores (20 testes)
│       ├── optimization-service/      # 🧠 Hungarian + Haversine (29 testes)
│       └── reports-service/           # 📊 Analytics + AI (19 testes)
├── frontend/
│   └── microfrontends/
│       ├── shell/                     # 🏠 Host + Playwright E2E (28 testes)
│       ├── remote-orders/             # 📋 Pedidos: tabela, cards, kanban, CRUD
│       ├── remote-products/           # 📦 Produtos: grid, tabela, CRUD
│       ├── remote-delivery/           # 🚴 Entregadores + Otimização Hungarian
│       └── remote-reports/            # 📊 Charts, Analytics, AI Insights
├── infrastructure/
│   └── terraform/                     # ☁️ 9 módulos Terraform
│       ├── bootstrap/                 # S3 + DynamoDB (state)
│       ├── modules/                   # networking, database, cache, messaging,
│       │                              # lambda, api-gateway, frontend, dns,
│       │                              # bastion, secrets
│       └── environments/production/   # Entry point
└── docs/
    ├── api-spec.md                    # Especificação completa da API
    ├── database-schema.md             # Schema do banco de dados
    ├── images/                        # Screenshots (tests, observability)
    ├── evidences/                     # Screenshots
    └── diagrams/                      # 9 diagramas draw.io
        ├── images/                    # PNGs exportados
        └── xml/                       # Arquivos .drawio editáveis
```

&nbsp;

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

&nbsp;

### Swagger (OpenAPI)

Cada serviço possui documentação interativa acessível em `/docs`:

| Serviço | URL |
|---------|-----|
| Auth | http://localhost:3001/docs |
| Products | http://localhost:3002/docs |
| Orders | http://localhost:3003/docs |
| Delivery | http://localhost:3004/docs |
| Optimization | http://localhost:3005/docs |
| Reports | http://localhost:3006/docs |

&nbsp;

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
| `CORS_ORIGIN` | Todos | Origem permitida |
| `VITE_API_URL` | frontend (remotes) | URL do API Gateway (vazio em dev para usar proxy) |
| `DD_API_KEY` | Lambda (Datadog) | API Key do Datadog |
| `DD_SITE` | Lambda (Datadog) | Site do Datadog (us5.datadoghq.com) |

&nbsp;

---

## 🐳 Docker

O `docker-compose.yml` orquestra **19 containers** (7 infra + 6 backend + 5 frontend + 1 gateway):

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
| mfe-shell | node:20-alpine | 5000 | Frontend host (Vite) |
| mfe-remote-orders | node:20-alpine | 5001 | Microfrontend pedidos |
| mfe-remote-products | node:20-alpine | 5002 | Microfrontend produtos |
| mfe-remote-delivery | node:20-alpine | 5003 | Microfrontend entregas |
| mfe-remote-reports | node:20-alpine | 5004 | Microfrontend relatórios |
| nginx | nginx:alpine | 80 | API Gateway |

&nbsp;

---

## 👨‍💻 Autor

**Vinicius Prudencio** — Full Stack & DevOps Engineer

[![GitHub](https://img.shields.io/badge/GitHub-vynnydev-181717?logo=github&logoColor=white)](https://github.com/vynnydev)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-vynnydev-0A66C2?logo=linkedin&logoColor=white)](https://linkedin.com/in/vynnydev)

---

*Desenvolvido como teste técnico para Eyecare Health — Março 2026*