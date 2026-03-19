# 🚴 Delivery Service

![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![RabbitMQ](https://img.shields.io/badge/RabbitMQ-3.13-FF6600?logo=rabbitmq&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748?logo=prisma&logoColor=white)

Microserviço de gestão de entregadores com CRUD, filtro de disponibilidade e consumo de eventos RabbitMQ.

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
CORS_ORIGIN=http://localhost:3000
```

## Rodar localmente

```bash
docker-compose up delivery-db -d
cp .env.example .env
npm install
npx prisma migrate dev --name init
npx prisma generate
npm run seed
npm test    # 20 testes
npm run dev
```

## Testes: 20

- CRUD completo via HTTP
- Filtro `available=true`
- Autorização (admin vs viewer)
- Proteção contra delete de entregador em entrega
- Validação de telefone brasileiro e tipo de veículo
