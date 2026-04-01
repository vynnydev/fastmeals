# 📦 Products Service

![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748?logo=prisma&logoColor=white)
![Tests](https://img.shields.io/badge/Tests-24_passed-22c55e?logo=vitest&logoColor=white)

Microserviço de gestão de produtos com CRUD completo, paginação, busca e filtros. Implementa Clean Architecture com 5 use cases e 5 Lambda handlers.

## Arquitetura

```
src/
├── domain/
│   ├── entities/           → Product entity
│   └── repositories/       → IProductRepository interface
├── application/
│   ├── use-cases/          → List, Get, Create, Update, Delete
│   └── dtos/               → ProductDTO, CreateProductDTO
├── infrastructure/
│   ├── database/           → Prisma client
│   ├── repositories/       → PrismaProductRepository
│   ├── http/
│   │   ├── controllers/    → ProductController
│   │   ├── routes/         → product.routes.ts
│   │   ├── middlewares/    → auth, rate-limiter
│   │   ├── validators/     → product.validator.ts (Zod)
│   │   └── errors/         → AppError, error-handler
│   │   └── swagger.ts      → rotas renderizadas no swagger
│   └── config/             → env.ts, logger.ts (Pino)
└── lambda/
    ├── products-list-handler.ts
    ├── products-get-handler.ts
    ├── products-create-handler.ts
    ├── products-update-handler.ts
    └── products-delete-handler.ts
```

## Endpoints

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| GET | `/api/products` | Listar produtos (paginação, busca, filtro) | Admin, Viewer |
| GET | `/api/products/:id` | Detalhes do produto | Admin, Viewer |
| POST | `/api/products` | Criar produto | Admin |
| PUT | `/api/products/:id` | Atualizar produto | Admin |
| DELETE | `/api/products/:id` | Remover produto | Admin |
| GET | `/health` | Health check | Público |

### Query Parameters (GET /api/products)

| Param | Tipo | Descrição |
|-------|------|-----------|
| `page` | number | Página (default: 1) |
| `limit` | number | Itens por página (default: 20, max: 100) |
| `search` | string | Busca por nome |
| `category` | string | Filtro: meal, drink, dessert, side |
| `sortBy` | string | Ordenar: name, price, createdAt |
| `sortOrder` | string | asc ou desc |

## Lambda Handlers (Produção)

| Função | Handler | API Gateway Route |
|--------|---------|-------------------|
| `fastmeals-products-list` | products-list-handler.handler | GET /api/products |
| `fastmeals-products-get` | products-get-handler.handler | GET /api/products/{id} |
| `fastmeals-products-create` | products-create-handler.handler | POST /api/products |
| `fastmeals-products-update` | products-update-handler.handler | PUT /api/products/{id} |
| `fastmeals-products-delete` | products-delete-handler.handler | DELETE /api/products/{id} |

## Categorias

| Categoria | Exemplos |
|-----------|----------|
| meal | X-Burger, Pizza Margherita |
| drink | Suco de Laranja, Refrigerante |
| dessert | Pudim, Brownie |
| side | Batata Frita, Coxinha |

## Business Rules

- Não é possível deletar produto com pedidos ativos (status pending/preparing) — retorna `409 PRODUCT_IN_USE`

## Variáveis de Ambiente

```env
NODE_ENV=development
PORT=3002
DATABASE_URL=postgresql://products_user:products_pass@localhost:5434/products_db
JWT_ACCESS_SECRET=dev-access-secret-fastmeals-2026
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
CORS_ORIGIN=http://localhost:5000
```

## Rodar localmente

```bash
docker-compose up products-db -d
cp .env.example .env
npm install
npx prisma migrate dev --name init
npx prisma generate
npm run seed
npm test    # 24 testes
npm run dev
```

## Testes: 24

| Tipo | Quantidade | Cobertura |
|------|-----------|-----------|
| Unit | 10 | Use cases (CRUD) |
| Integration | 14 | Controllers HTTP, paginação, busca |

**Destaques dos testes:**
- CRUD completo via HTTP
- Paginação, busca e filtros por categoria
- Autorização (admin vs viewer)
- Validação de dados (Zod)
- Proteção contra delete de produto em uso
