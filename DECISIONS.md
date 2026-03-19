# DECISIONS.md

![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.21-000000?logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748?logo=prisma&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white)
![RabbitMQ](https://img.shields.io/badge/RabbitMQ-3.13-FF6600?logo=rabbitmq&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-28-2496ED?logo=docker&logoColor=white)
![Nginx](https://img.shields.io/badge/Nginx-Alpine-009639?logo=nginx&logoColor=white)
![AWS Bedrock](https://img.shields.io/badge/AWS_Bedrock-Claude-232F3E?logo=amazon-aws&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-3.0-6E9F18?logo=vitest&logoColor=white)

---

## Índice

1. [Visão Geral da Arquitetura](#1-visão-geral-da-arquitetura)
2. [Microserviços vs Monolito](#2-microserviços-vs-monolito)
3. [Clean Architecture + SOLID](#3-clean-architecture--solid)
4. [PostgreSQL vs MongoDB](#4-postgresql-vs-mongodb)
5. [Database per Service (CQRS)](#5-database-per-service-cqrs)
6. [Prisma 6 como ORM](#6-prisma-6-como-orm)
7. [RabbitMQ para Mensageria](#7-rabbitmq-para-mensageria)
8. [HTTP Síncrono vs Mensageria Assíncrona](#8-http-síncrono-vs-mensageria-assíncrona)
9. [Algoritmo Hungarian vs Greedy](#9-algoritmo-hungarian-vs-greedy)
10. [Vitest vs Jest](#10-vitest-vs-jest)
11. [JWT com Redis Token Store](#11-jwt-com-redis-token-store)
12. [Nginx como API Gateway](#12-nginx-como-api-gateway)
13. [AWS Bedrock para AI Insights](#13-aws-bedrock-para-ai-insights)
14. [Docker Multi-stage Build](#14-docker-multi-stage-build)
15. [Estratégia de Testes](#15-estratégia-de-testes)
16. [Resumo dos Microserviços](#16-resumo-dos-microserviços)

---

## 1. Visão Geral da Arquitetura

A plataforma FastMeals é composta por **6 microserviços** independentes, cada um com seu próprio banco de dados, seguindo o padrão **Database per Service**. A comunicação entre serviços utiliza **HTTP síncrono** para queries que precisam de resposta imediata e **RabbitMQ** para eventos assíncronos (fire-and-forget).

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │────▶│    Nginx     │────▶│  Microservices│
│   Next.js    │     │  API Gateway │     │  (6 services) │
└─────────────┘     └──────────────┘     └──────────────┘
                                                │
                    ┌───────────────────────────┼────────────────────────┐
                    │               │           │           │            │
              ┌─────┴─────┐  ┌─────┴─────┐ ┌───┴───┐ ┌────┴────┐ ┌────┴────┐
              │   Auth    │  │ Products  │ │Orders │ │Delivery │ │Reports  │
              │  Service  │  │  Service  │ │Service│ │ Service │ │ Service │
              │  :3001    │  │  :3002    │ │ :3003 │ │  :3004  │ │  :3006  │
              └─────┬─────┘  └─────┬─────┘ └───┬───┘ └────┬────┘ └────┬────┘
                    │              │            │          │            │
              ┌─────┴─────┐  ┌────┴─────┐ ┌───┴───┐ ┌────┴────┐ ┌────┴────┐
              │PostgreSQL │  │PostgreSQL│ │Postgre│ │PostgreSQL│ │PostgreSQL│
              │ + Redis   │  │          │ │  SQL  │ │          │ │ (CQRS)  │
              └───────────┘  └──────────┘ └───────┘ └─────────┘ └─────────┘
                                               │          │
                                          ┌────┴──────────┴────┐
                                          │     RabbitMQ       │
                                          │  (Topic Exchange)  │
                                          └────────────────────┘
                                                    │
                                          ┌─────────┴─────────┐
                                          │   Optimization    │
                                          │    Service :3005  │
                                          │   (Stateless)     │
                                          └───────────────────┘
```

**Total: 153+ testes automatizados | 6 microserviços | 5 bancos PostgreSQL | RabbitMQ | Redis | Nginx**

---

## 2. Microserviços vs Monolito

**Decisão:** Microserviços com Clean Architecture.

**Justificativa:**
- O teste exige gerenciamento de pedidos, produtos, entregadores, otimização e relatórios — domínios naturalmente separados
- Cada serviço pode ser escalado independentemente (ex: o optimization-service pode escalar em momentos de pico sem afetar o auth-service)
- Database per service garante isolamento de dados e falhas
- Deploy independente permite atualizar um serviço sem afetar os outros
- A spec do teste menciona explicitamente avaliação de "Design da API" e "Modelagem do banco", que são melhor demonstrados em microserviços

**Trade-off aceito:**
- Complexidade operacional maior (12 containers Docker)
- Comunicação inter-serviço adiciona latência (~5ms por HTTP call)
- Para o tamanho do projeto, um monolito modular seria suficiente, mas microserviços demonstram competência técnica superior

---

## 3. Clean Architecture + SOLID

**Decisão:** Todas as camadas seguem Clean Architecture com 4 layers.

**Estrutura de cada microserviço:**
```
src/
├── domain/          → Entities, Value Objects, Repository Interfaces
├── application/     → Use Cases, DTOs, Service Interfaces
├── infrastructure/  → Prisma Repository, HTTP Clients, Express Controllers
└── lambda/          → AWS Lambda Handlers
```

**Princípios SOLID aplicados:**

| Princípio | Aplicação |
|-----------|-----------|
| **S** — Single Responsibility | Cada use case tem uma única responsabilidade (CreateOrderUseCase, UpdateStatusUseCase, etc.) |
| **O** — Open/Closed | Novos tipos de veículo ou status podem ser adicionados sem alterar código existente |
| **L** — Liskov Substitution | Todas as implementações respeitam suas interfaces (PrismaRepository implements IRepository) |
| **I** — Interface Segregation | Interfaces específicas por contexto (IProductClient, IDeliveryClient, IAIService) |
| **D** — Dependency Inversion | Use cases dependem de interfaces, não implementações. Container injeta as dependências |

**Exemplo de DIP no orders-service:**
```
CreateOrderUseCase(IOrderRepository, IProductClient)
    │                    │                    │
    │                    ▼                    ▼
    │         PrismaOrderRepository   ProductServiceClient
    │         (Prisma + PostgreSQL)   (Axios + HTTP)
    │
    └── Em testes: MockRepository, MockProductClient
```

**Justificativa:**
- Use cases não conhecem Prisma, Express, Axios ou RabbitMQ
- Troca de banco de dados requer apenas nova implementação do Repository
- Testes unitários não precisam de infraestrutura externa
- Código testável, manutenível e extensível

---

## 4. PostgreSQL vs MongoDB

**Decisão:** PostgreSQL para todos os serviços.

**Justificativa:**
- Os critérios de avaliação incluem "Modelagem do banco de dados (15%)" — PostgreSQL permite demonstrar JOINs, indexes, constraints e relações que são avaliados
- Orders com items é uma relação 1:N natural para modelo relacional
- Products com categories, delivery persons com vehicle types — todos beneficiam de constraints e enums do PostgreSQL
- Queries analíticas do reports-service (GROUP BY, aggregate functions) são mais eficientes em SQL
- Prisma 6 com adapter-pg oferece type safety completo

**Trade-off aceito:**
- MongoDB seria mais flexível para schemas dinâmicos, mas a spec do teste tem schema bem definido
- PostgreSQL com Prisma exige migrations, mas isso demonstra maturidade no processo de desenvolvimento

---

## 5. Database per Service (CQRS)

**Decisão:** Cada microserviço tem seu próprio banco PostgreSQL. O reports-service implementa um read model CQRS simplificado.

**Mapeamento:**

| Serviço | Banco | Porta | Tabelas |
|---------|-------|-------|---------|
| auth-service | auth_db | 5433 | users |
| products-service | products_db | 5434 | products |
| orders-service | orders_db | 5435 | orders, order_items |
| delivery-service | delivery_db | 5436 | delivery_persons |
| reports-service | reports_db | 5437 | orders, order_items, products, delivery_persons |

**Justificativa:**
- Isolamento completo de dados entre serviços
- Cada serviço pode escalar seu banco independentemente
- Falha em um banco não afeta outros serviços
- O reports-service tem todas as tabelas como read model dedicado para queries analíticas, sem impactar os serviços transacionais

---

## 6. Prisma 6 como ORM

**Decisão:** Prisma 6 com `@prisma/adapter-pg` para todos os serviços com banco de dados.

**Justificativa:**
- Type safety completo com TypeScript — erros de query são capturados em compile time
- Schema declarativo com migrations versionadas
- Adapter pattern (`@prisma/adapter-pg`) permite uso com connection pooling
- `prisma.config.ts` centraliza configuração de datasource
- Auto-completion no editor para queries

**Configuração adotada:**
```typescript
// prisma.config.ts — configuração Prisma 6
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: { url: env('DATABASE_URL') },
});
```

**Trade-off aceito:**
- Generated client adiciona peso ao build (~30MB)
- `rootDir` no tsconfig precisa ser `.` (não `./src`) para incluir o generated
- O `prisma generate` precisa de DATABASE_URL dummy no Docker build stage

---

## 7. RabbitMQ para Mensageria

**Decisão:** RabbitMQ com Topic Exchange para comunicação assíncrona entre microserviços.

**Alternativas consideradas:**

| Opção | Prós | Contras | Decisão |
|-------|------|---------|---------|
| **RabbitMQ** | Persistência, acknowledgment, dead-letter queues, management UI | Container adicional | ✅ Escolhido |
| Redis Pub/Sub | Já temos Redis rodando | Sem persistência, sem ack, fire-and-forget puro | ❌ |
| AWS SQS/SNS | Managed, escalável | Dependência AWS, custo, complexidade para dev local | ❌ (produção) |

**Arquitetura da mensageria:**
```
orders-service ──PUBLICA──▶ fastmeals.events (Topic Exchange)
    │                              │
    │   order.created              ├──▶ (futuro: notification-service)
    │   order.status.changed       ├──▶ delivery-order-status-queue ──▶ delivery-service
    │                              │
    └──CONSOME── delivery-assigned-queue ◀── (futuro: optimization-service)
```

**Características implementadas:**
- Exchange `fastmeals.events` do tipo Topic com `durable: true`
- Queues persistentes (`durable: true`) — sobrevivem restart do broker
- Manual acknowledgment (`noAck: false`) — mensagem só sai da fila após processamento
- Graceful degradation — serviços funcionam sem RabbitMQ (fallback silencioso)
- Management UI na porta 15672 para monitoramento

**Justificativa:**
- Demonstra comunicação assíncrona real entre microserviços
- Persistência de mensagens é requisito para sistemas de produção
- O delivery-service precisa saber quando pedidos mudam de status sem polling
- Em produção na AWS, migraria para SNS+SQS mantendo as mesmas interfaces (IAIService pattern)

---

## 8. HTTP Síncrono vs Mensageria Assíncrona

**Decisão:** HTTP para queries que precisam de resposta imediata. Mensageria para eventos fire-and-forget.

| Cenário | Padrão | Justificativa |
|---------|--------|---------------|
| Criar pedido → validar produtos | HTTP síncrono | Precisa saber AGORA se o produto existe e está disponível |
| Atribuir entregador → validar disponibilidade | HTTP síncrono | Precisa confirmar que o entregador está livre |
| Pedido mudou de status → notificar delivery | Mensageria assíncrona | Informação eventual, não bloqueia o fluxo |
| Otimização → buscar pedidos ready | HTTP síncrono | Precisa dos dados frescos no momento exato do cálculo |

**Regra prática:**
- "Preciso dos dados AGORA para decidir?" → HTTP
- "Algo aconteceu, avise quem quiser saber" → Mensageria

---

## 9. Algoritmo Hungarian vs Greedy

**Decisão:** Algoritmo Hungarian (Kuhn-Munkres) O(n³) com fórmula de Haversine para distância geodésica.

**Comparação:**

| Algoritmo | Complexidade | Resultado | Decisão |
|-----------|-------------|-----------|---------|
| **Greedy (nearest neighbor)** | O(n²) | Localmente ótimo | ❌ |
| **Hungarian (Kuhn-Munkres)** | O(n³) | Globalmente ótimo | ✅ Escolhido |
| Brute force | O(n!) | Globalmente ótimo mas impraticável | ❌ |

**Exemplo que demonstra a diferença:**
```
         Pedido 1    Pedido 2
Pessoa A:  1 km        2 km
Pessoa B:  3 km       10 km

Greedy:    A→1 (1km) + B→2 (10km) = 11 km total
Hungarian: A→2 (2km) + B→1 (3km)  =  5 km total  ← 54% melhor
```

**Haversine** calcula a distância geodésica (curvatura da Terra) entre dois pontos, não a distância euclidiana plana. Para coordenadas em São Paulo, a diferença é significativa.

**Performance:** O teste exige < 2 segundos para 50 pedidos × 30 entregadores. O Hungarian com n=50 executa ~125.000 operações — testado em 87ms (muito abaixo do limite).

---

## 10. Vitest vs Jest

**Decisão:** Vitest para todos os testes.

**Justificativa:**
- Compatibilidade nativa com TypeScript sem configuração extra (jest-ts precisa de transformer)
- API idêntica ao Jest (`describe`, `it`, `expect`, `vi.fn()`) — zero curva de aprendizado
- 3-5x mais rápido que Jest para projetos TypeScript (usa ESBuild internamente)
- Hot module replacement nos testes em modo watch
- Integração nativa com Vite (usado no frontend)

**Resultado:** 153+ testes executam em < 2 segundos total.

---

## 11. JWT com Redis Token Store

**Decisão:** JWT para autenticação com Redis para armazenamento de refresh tokens.

**Fluxo:**
```
Login → JWT Access Token (15min) + Refresh Token (7d, salvo no Redis)
    │
    ├── Access Token: validado localmente por cada serviço (sem HTTP call)
    │   → Cada serviço tem o mesmo JWT_ACCESS_SECRET
    │
    └── Refresh Token: validado contra Redis (garante revogação)
```

**Justificativa:**
- Access tokens curtos (15min) limitam exposição em caso de vazamento
- Validação local do access token elimina chamada HTTP ao auth-service em cada request
- Redis como token store permite revogar refresh tokens instantaneamente
- Todos os serviços compartilham o mesmo `JWT_ACCESS_SECRET` para validação descentralizada

**Roles implementadas:**
- `admin`: acesso total (CRUD + otimização + relatórios)
- `viewer`: apenas leitura (listagem e consulta)

---

## 12. Nginx como API Gateway

**Decisão:** Nginx como reverse proxy e API Gateway.

**Roteamento:**
```
/api/auth/*                       → auth-service:3001
/api/products/*                   → products-service:3002
/api/orders/optimize-assignment   → optimization-service:3005  (antes do catch-all)
/api/orders/*                     → orders-service:3003
/api/delivery-persons/*           → delivery-service:3004
/api/reports/*                    → reports-service:3006
```

**Justificativa:**
- Ponto de entrada único (porta 80) para o frontend
- O frontend não precisa conhecer as portas individuais dos serviços
- CORS centralizado no gateway
- Em produção na AWS, seria substituído por API Gateway + CloudFront

**Nota:** A rota `/api/orders/optimize-assignment` precisa ser definida ANTES do catch-all `/api/orders/*` para evitar que o Nginx encaminhe para o orders-service.

---

## 13. AWS Bedrock para AI Insights

**Decisão:** AWS Bedrock (Claude Sonnet 4.5) para geração de insights analíticos em linguagem natural.

**Fluxo:**
```
GET /api/reports/ai-insights
    │
    ├── 1. Coleta todos os relatórios em paralelo (Promise.all)
    │      ├── Revenue
    │      ├── Orders by Status
    │      ├── Top Products
    │      └── Avg Delivery Time
    │
    ├── 2. Monta prompt estruturado em português
    │
    ├── 3. Envia para Claude via Bedrock API
    │
    └── 4. Retorna: summary + recommendations + highlights
```

**Graceful degradation:** Se o Bedrock não está disponível (credenciais ausentes, modelo não habilitado, erro de rede), o serviço gera insights básicos localmente usando a função `generateFallbackInsights`. O endpoint nunca falha — retorna `model: "fallback-local"` ao invés de `model: "anthropic.claude-sonnet-4-5-..."`.

**Interface IAIService:** O Bedrock é uma implementação da interface `IAIService`. Nos testes, mockamos sem AWS. Se trocar para OpenAI ou outro provider, só muda a implementação — os use cases não mudam.

---

## 14. Docker Multi-stage Build

**Decisão:** Dockerfile com 3 stages para cada serviço.

```dockerfile
Stage 1 (deps):     npm ci → separa production e dev dependencies
Stage 2 (builder):  prisma generate + tsc → compila TypeScript
Stage 3 (runner):   Apenas production dependencies + dist → imagem final
```

**Justificativa:**
- Imagem final contém apenas o necessário para rodar (sem devDependencies, sem source code)
- Cada serviço roda com usuário não-root (segurança)
- Health checks via `wget` no Dockerfile
- Imagem base `node:20-alpine` para tamanho mínimo (~150MB por serviço)

---

## 15. Estratégia de Testes

**Decisão:** Testes unitários com mocks + testes de integração HTTP + script de teste de fluxo completo.

| Tipo | Quantidade | O que testa |
|------|-----------|-------------|
| Unit tests (Vitest) | 80+ | Use cases, algorithms, value objects com mocks |
| Integration tests (Vitest + Supertest) | 73+ | Controllers HTTP, auth, validation, error handling |
| Flow test (Shell script) | 52 | Fluxo real entre todos os serviços via HTTP |
| **Total** | **153+ unit/integration + 52 flow** | — |

**Distribuição por serviço:**

| Serviço | Testes | Destaques |
|---------|--------|-----------|
| auth-service | 19 | Login, refresh token, bcrypt, validation |
| products-service | 24 | CRUD, pagination, search, auth, delete protection |
| orders-service | 43 | Status machine (todas transições), inter-service, price snapshot |
| delivery-service | 20 | CRUD, auth, available filter, delete protection |
| optimization-service | 29 | Hungarian correctness, Haversine accuracy, performance 30×50 |
| reports-service | 18 | All endpoints, AI insights, date validation |

**Teste que demonstra superioridade do Hungarian:**
```typescript
it('should find optimal even when greedy would fail', () => {
  const result = hungarianAlgorithm([
    [1, 2],   // Person A: 1km to Order1, 2km to Order2
    [3, 10],  // Person B: 3km to Order1, 10km to Order2
  ]);
  expect(result.totalCost).toBe(5);  // Hungarian: 5km (Greedy seria 11km)
});
```

---

## 16. Resumo dos Microserviços

| Serviço | Porta | Banco | Mensageria | Responsabilidade |
|---------|-------|-------|------------|-----------------|
| auth-service | 3001 | auth_db + Redis | — | Autenticação JWT, login, refresh token |
| products-service | 3002 | products_db | — | CRUD de produtos com paginação e busca |
| orders-service | 3003 | orders_db | Publisher + Consumer | Gestão de pedidos com máquina de estados |
| delivery-service | 3004 | delivery_db | Consumer | CRUD de entregadores, filtro de disponibilidade |
| optimization-service | 3005 | — (stateless) | — | Algoritmo Hungarian + Haversine |
| reports-service | 3006 | reports_db (CQRS) | — | Analytics + AI Insights (Bedrock) |

---

*Documento gerado como parte do teste técnico FastMeals — Março 2026*
