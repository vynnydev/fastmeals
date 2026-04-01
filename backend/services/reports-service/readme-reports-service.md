# 📊 Reports Service

![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![AWS Bedrock](https://img.shields.io/badge/AWS_Bedrock-Amazon_Nova-232F3E?logo=amazon-aws&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748?logo=prisma&logoColor=white)
![Tests](https://img.shields.io/badge/Tests-19_passed-22c55e?logo=vitest&logoColor=white)

Microserviço de analytics com 4 relatórios + AI Insights via AWS Bedrock (Amazon Nova). Implementa CQRS read model com acesso a todas as tabelas para queries analíticas cross-domain. Clean Architecture com 5 use cases e 5 Lambda handlers.

## Arquitetura

```
src/
├── domain/
│   └── repositories/       → IReportRepository interface
├── application/
│   ├── use-cases/          → GetRevenue, GetOrdersByStatus, GetTopProducts,
│   │                         GetAvgDeliveryTime, GetAIInsights
│   ├── interfaces/         → IAIService
│   └── dtos/               → ReportQueryDTO
├── infrastructure/
│   ├── database/           → Prisma client
│   ├── repositories/       → PrismaReportRepository
│   ├── services/           → BedrockAIService (Converse API + fallback)
│   ├── http/
│   │   ├── controllers/    → ReportController
│   │   ├── routes/         → report.routes.ts
│   │   ├── middlewares/    → auth, rate-limiter
│   │   ├── validators/     → report.validator.ts (Zod)
│   │   └── errors/         → AppError, error-handler
│   │   └── swagger.ts      → rotas renderizadas no swagger
│   └── config/             → env.ts, logger.ts (Pino)
└── lambda/
    ├── reports-revenue-handler.ts
    ├── reports-orders_status-handler.ts
    ├── reports-top_products-handler.ts
    ├── reports-delivery_time-handler.ts
    └── reports-ai_insights-handler.ts
```

## Endpoints

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| GET | `/api/reports/revenue` | Receita por período | Admin, Viewer |
| GET | `/api/reports/orders-by-status` | Pedidos agrupados por status | Admin, Viewer |
| GET | `/api/reports/top-products` | Produtos mais vendidos | Admin, Viewer |
| GET | `/api/reports/average-delivery-time` | Tempo médio de entrega | Admin, Viewer |
| GET | `/api/reports/ai-insights` | Análise com IA (Bedrock) | Admin, Viewer |
| GET | `/health` | Health check | Público |

### Query Parameters

**Revenue** (obrigatório): `startDate`, `endDate` (YYYY-MM-DD)

**Top Products** (opcional): `startDate`, `endDate`, `limit` (default: 10, max: 50)

**AI Insights** (obrigatório): `startDate`, `endDate`

## Lambda Handlers (Produção)

| Função | Handler | API Gateway Route |
|--------|---------|-------------------|
| `fastmeals-reports-revenue` | reports-revenue-handler.handler | GET /api/reports/revenue |
| `fastmeals-reports-orders_status` | reports-orders_status-handler.handler | GET /api/reports/orders-by-status |
| `fastmeals-reports-top_products` | reports-top_products-handler.handler | GET /api/reports/top-products |
| `fastmeals-reports-delivery_time` | reports-delivery_time-handler.handler | GET /api/reports/average-delivery-time |
| `fastmeals-reports-ai_insights` | reports-ai_insights-handler.handler | GET /api/reports/ai-insights |

## AI Insights (AWS Bedrock)

O endpoint `/api/reports/ai-insights` coleta todos os 4 relatórios em paralelo (`Promise.all`), monta um prompt estruturado em português e envia para o Amazon Nova via AWS Bedrock (Converse API).

O serviço suporta tanto modelos Anthropic (InvokeModel API) quanto Amazon Nova (Converse API), selecionando automaticamente com base no `modelId`.

**Response:**
```json
{
  "summary": "Resumo executivo em 2-3 frases",
  "recommendations": ["Recomendação 1", "Recomendação 2"],
  "highlights": ["Destaque positivo", "Ponto de atenção"],
  "generatedAt": "2026-03-19T20:00:00Z",
  "model": "amazon.nova-pro-v1:0"
}
```

**Graceful Degradation:** Se o Bedrock não está disponível (credenciais ausentes, modelo não habilitado, erro de rede), o serviço gera insights básicos localmente. O endpoint nunca falha — retorna `model: "fallback-local"`.

## CQRS Read Model

Este serviço tem **todas as tabelas** no seu schema (orders, order_items, products, delivery_persons) — é um read model dedicado para queries analíticas cross-domain, sem impactar os serviços transacionais.

## Variáveis de Ambiente

```env
NODE_ENV=development
PORT=3006
DATABASE_URL=postgresql://reports_user:reports_pass@localhost:5437/reports_db
JWT_ACCESS_SECRET=dev-access-secret-fastmeals-2026
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
CORS_ORIGIN=http://localhost:5000

# AWS Bedrock (opcional — funciona sem)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
BEDROCK_MODEL_ID=amazon.nova-pro-v1:0
```

## Rodar localmente

```bash
docker-compose up reports-db -d
cp .env.example .env
npm install
npx prisma migrate dev --name init
npx prisma generate
npm run seed
npm test    # 19 testes
npm run dev
```

## Testes: 19

| Tipo | Quantidade | Cobertura |
|------|-----------|-----------|
| Unit | 9 | Use cases (revenue, status, top products, AI insights) |
| Integration | 10 | Controllers HTTP, date validation, auth |

**Destaques dos testes:**
- Revenue report com range de datas
- Orders by status aggregation
- Top products com limit customizado
- Average delivery time com breakdown por veículo
- AI Insights (mock do Bedrock)
- Validação de datas obrigatórias
- Autorização (admin e viewer têm acesso)
- Fallback local quando Bedrock não disponível
