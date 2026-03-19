# 📊 Reports Service

![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![AWS Bedrock](https://img.shields.io/badge/AWS_Bedrock-Claude_Sonnet_4.5-232F3E?logo=amazon-aws&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748?logo=prisma&logoColor=white)

Microserviço de analytics com 4 relatórios + AI Insights via AWS Bedrock (Claude). Implementa CQRS read model com acesso a todas as tabelas para queries analíticas cross-domain.

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

**Revenue** (obrigatório):
- `startDate` — Data início (YYYY-MM-DD)
- `endDate` — Data fim (YYYY-MM-DD)

**Top Products** (opcional):
- `startDate`, `endDate` — Período
- `limit` — Quantidade (default: 10, max: 50)

**Average Delivery Time** (opcional):
- `startDate`, `endDate` — Período

**AI Insights** (obrigatório):
- `startDate`, `endDate` — Período

## AI Insights (AWS Bedrock)

O endpoint `/api/reports/ai-insights` coleta todos os 4 relatórios em paralelo (`Promise.all`), monta um prompt estruturado em português e envia para o Claude via AWS Bedrock.

**Response:**
```json
{
  "summary": "Resumo executivo em 2-3 frases",
  "recommendations": ["Recomendação 1", "Recomendação 2"],
  "highlights": ["Destaque positivo", "Ponto de atenção"],
  "generatedAt": "2026-03-19T20:00:00Z",
  "model": "anthropic.claude-sonnet-4-5-20250929-v1:0"
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
CORS_ORIGIN=http://localhost:3000

# AWS Bedrock (opcional — funciona sem)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
BEDROCK_MODEL_ID=anthropic.claude-sonnet-4-5-20250929-v1:0
```

## Rodar localmente

```bash
docker-compose up reports-db -d
cp .env.example .env
npm install
npx prisma migrate dev --name init
npx prisma generate
npm run seed
npm test    # 18 testes
npm run dev
```

## Testes: 18

- Revenue report com range de datas
- Orders by status aggregation
- Top products com limit customizado
- Average delivery time com breakdown por veículo
- AI Insights (mock do Bedrock)
- Validação de datas obrigatórias
- Autorização (admin e viewer têm acesso)
