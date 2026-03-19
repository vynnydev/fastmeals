# 📋 Orders Service

![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![RabbitMQ](https://img.shields.io/badge/RabbitMQ-3.13-FF6600?logo=rabbitmq&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748?logo=prisma&logoColor=white)

Microserviço de gestão de pedidos com máquina de estados, comunicação inter-serviço e mensageria RabbitMQ.

## Endpoints

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| GET | `/api/orders` | Listar pedidos (paginação, filtro por status) | Admin, Viewer |
| GET | `/api/orders/:id` | Detalhes do pedido com items | Admin, Viewer |
| POST | `/api/orders` | Criar pedido | Admin |
| PATCH | `/api/orders/:id/status` | Atualizar status | Admin |
| PATCH | `/api/orders/:id/assign` | Atribuir entregador | Admin |
| GET | `/health` | Health check | Público |

## Máquina de Estados

```
pending → preparing → ready → delivering → delivered
  │          │         │
  └──────────┴─────────┴──→ cancelled
```

| De | Para | Condição |
|----|------|----------|
| pending | preparing, cancelled | — |
| preparing | ready, cancelled | — |
| ready | delivering, cancelled | Requer deliveryPersonId atribuído |
| delivering | delivered | — |
| delivered | — | Estado final |
| cancelled | — | Estado final |

## Comunicação Inter-serviço

| Direção | Tipo | Descrição |
|---------|------|-----------|
| orders → products-service | HTTP síncrono | Validar produtos e obter preços ao criar pedido |
| orders → delivery-service | HTTP síncrono | Validar entregador ao atribuir |
| orders → RabbitMQ | Publish | `order.created`, `order.status.changed` |
| RabbitMQ → orders | Consume | `delivery.assigned` (futuro: optimization-service) |

## Price Snapshot

Ao criar um pedido, o `unitPrice` de cada item é capturado do products-service no momento da criação. Se o produto mudar de preço depois, o pedido mantém o valor original.

## Variáveis de Ambiente

```env
NODE_ENV=development
PORT=3003
DATABASE_URL=postgresql://orders_user:orders_pass@localhost:5435/orders_db
JWT_ACCESS_SECRET=dev-access-secret-fastmeals-2026
PRODUCTS_SERVICE_URL=http://localhost:3002
DELIVERY_SERVICE_URL=http://localhost:3004
RABBITMQ_URL=amqp://guest:guest@localhost:5672
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
CORS_ORIGIN=http://localhost:3000
```

## Rodar localmente

```bash
docker-compose up orders-db rabbitmq -d
cp .env.example .env
npm install
npx prisma migrate dev --name init
npx prisma generate
npm run seed
npm test    # 43 testes
npm run dev
```

## Testes: 43

- Status machine (todas as transições válidas e inválidas)
- Criação de pedido com validação de produtos
- Price snapshot
- Atribuição de entregador com validação
- Autorização (admin vs viewer)
- Token forwarding para serviços downstream
