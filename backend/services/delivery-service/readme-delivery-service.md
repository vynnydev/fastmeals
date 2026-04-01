# 🚴 Delivery Service

![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![RabbitMQ](https://img.shields.io/badge/RabbitMQ-3.13-FF6600?logo=rabbitmq&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748?logo=prisma&logoColor=white)
![Tests](https://img.shields.io/badge/Tests-20_passed-22c55e?logo=vitest&logoColor=white)

Microserviço de gestão de entregadores com CRUD, filtro de disponibilidade e consumo de eventos RabbitMQ. Implementa Clean Architecture com 5 use cases e 5 Lambda handlers.

## Arquitetura

```
src/
├── domain/
│   ├── entities/           → DeliveryPerson entity
│   ├── enums/              → VehicleType enum
│   └── repositories/       → IDeliveryPersonRepository interface
├── application/
│   ├── use-cases/          → List, Get, Create, Update, Delete
│   └── dtos/               → DeliveryPersonDTO, CreateDeliveryPersonDTO
├── infrastructure/
│   ├── database/           → Prisma client
│   ├── repositories/       → PrismaDeliveryPersonRepository
│   ├── messaging/          → RabbitMQ consumer (order status changes)
│   ├── http/
│   │   ├── controllers/    → DeliveryController
│   │   ├── routes/         → delivery.routes.ts
│   │   ├── middlewares/    → auth, rate-limiter
│   │   ├── validators/     → delivery.validator.ts (Zod)
│   │   └── errors/         → AppError, error-handler
│   │   └── swagger.ts      → rotas renderizadas no swagger
│   └── config/             → env.ts, logger.ts (Pino)
└── lambda/
    ├── delivery-list-handler.ts
    ├── delivery-get-handler.ts
    ├── delivery-create-handler.ts
    ├── delivery-update-handler.ts
    └── delivery-delete-handler.ts
```

## Endpoints

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| GET | `/api/delivery-persons` | Listar entregadores | Admin, Viewer |
| GET | `/api/delivery-persons/:id` | Detalhes do entregador | Admin, Viewer |
| POST | `/api/delivery-persons` | Criar entregador | Admin |
| PUT | `/api/delivery-persons/:id` | Atualizar entregador | Admin |
| DELETE | `/api/delivery-persons/:id` | Remover entregador | Admin |
| GET | `/health` | Health check | Público |

### Query Parameters (GET /api/delivery-persons)

| Param | Tipo | Descrição |
|-------|------|-----------|
| `isActive` | boolean | Filtrar por ativos/inativos |
| `available` | boolean | `true` = ativos sem entrega em andamento |

## Lambda Handlers (Produção)

| Função | Handler | API Gateway Route |
|--------|---------|-------------------|
| `fastmeals-delivery-list` | delivery-list-handler.handler | GET /api/delivery-persons |
| `fastmeals-delivery-get` | delivery-get-handler.handler | GET /api/delivery-persons/{id} |
| `fastmeals-delivery-create` | delivery-create-handler.handler | POST /api/delivery-persons |
| `fastmeals-delivery-update` | delivery-update-handler.handler | PUT /api/delivery-persons/{id} |
| `fastmeals-delivery-delete` | delivery-delete-handler.handler | DELETE /api/delivery-persons/{id} |

## Tipos de Veículo

| Tipo | Descrição |
|------|-----------|
| bicycle | Bicicleta |
| motorcycle | Motocicleta |
| car | Carro |

## Mensageria (RabbitMQ Consumer)

O delivery-service **consome** o evento `order.status.changed` para saber quando:
- Um pedido muda para `delivering` → entregador fica **ocupado**
- Um pedido muda para `delivered` ou `cancelled` → entregador fica **livre**

## Business Rules

- Não é possível deletar entregador atribuído a pedido com status `delivering` — retorna `409 DELIVERY_PERSON_IN_USE`
- Coordenadas (`currentLatitude`, `currentLongitude`) são opcionais

## Variáveis de Ambiente

```env
NODE_ENV=development
PORT=3004
DATABASE_URL=postgresql://delivery_user:delivery_pass@localhost:5436/delivery_db
JWT_ACCESS_SECRET=dev-access-secret-fastmeals-2026
ORDERS_SERVICE_URL=http://localhost:3003
RABBITMQ_URL=amqp://guest:guest@localhost:5672
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
CORS_ORIGIN=http://localhost:5000
```

## Rodar localmente

```bash
docker-compose up delivery-db rabbitmq -d
cp .env.example .env
npm install
npx prisma migrate dev --name init
npx prisma generate
npm run seed
npm test    # 20 testes
npm run dev
```

## Testes: 20

| Tipo | Quantidade | Cobertura |
|------|-----------|-----------|
| Unit | 8 | Use cases (CRUD, availability) |
| Integration | 12 | Controllers HTTP, auth, filters |

**Destaques dos testes:**
- CRUD completo via HTTP
- Filtro `available=true` (entregadores livres)
- Autorização (admin vs viewer)
- Proteção contra delete de entregador em entrega
- Validação de telefone brasileiro e tipo de veículo
