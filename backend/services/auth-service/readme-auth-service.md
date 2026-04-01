# 🔐 Auth Service

![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748?logo=prisma&logoColor=white)
![Tests](https://img.shields.io/badge/Tests-19_passed-22c55e?logo=vitest&logoColor=white)

Microserviço de autenticação com JWT (access + refresh tokens) e Redis como token store. Implementa Clean Architecture com 2 use cases e 2 Lambda handlers.

## Arquitetura

```
src/
├── domain/
│   ├── entities/           → User entity com validação
│   └── repositories/       → IUserRepository interface
├── application/
│   ├── use-cases/          → LoginUseCase, RefreshTokenUseCase
│   ├── interfaces/         → IJwtService, IPasswordHasher, ITokenStore
│   └── dtos/               → LoginRequestDTO, LoginResponseDTO, RefreshTokenDTO
├── infrastructure/
│   ├── database/           → Prisma client
│   ├── repositories/       → PrismaUserRepository
│   ├── services/           → JwtService, BcryptService, RedisTokenStore
│   ├── http/
│   │   ├── controllers/    → AuthController
│   │   ├── routes/         → auth.routes.ts
│   │   ├── middlewares/    → auth, rate-limiter
│   │   ├── validators/     → auth.validator.ts (Zod)
│   │   └── errors/         → AppError, error-handler
│   │   └── swagger.ts      → rotas renderizadas no swagger
│   └── config/             → env.ts, logger.ts (Pino)
└── lambda/
    ├── auth-login-handler.ts
    └── auth-refresh_token-handler.ts
```

## Endpoints

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| POST | `/api/auth/login` | Login com email e senha | Público |
| POST | `/api/auth/refresh-token` | Renovar access token | Refresh Token |
| GET | `/health` | Health check | Público |

## Lambda Handlers (Produção)

| Função | Handler | API Gateway Route |
|--------|---------|-------------------|
| `fastmeals-auth-login` | auth-login-handler.handler | POST /api/auth/login |
| `fastmeals-auth-refresh_token` | auth-refresh_token-handler.handler | POST /api/auth/refresh-token |

## Stack

- **Express** — HTTP server
- **JWT** — Access token (15min) + Refresh token (7d)
- **bcrypt** — Hash de senhas (10 salt rounds)
- **Redis** — Armazenamento de refresh tokens (permite revogação)
- **Prisma 6** — ORM com PostgreSQL
- **Zod** — Validação de entrada
- **Pino** — Logs estruturados (JSON)

## Variáveis de Ambiente

```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://auth_user:auth_pass@localhost:5433/auth_db
REDIS_URL=redis://localhost:6379
JWT_ACCESS_SECRET=dev-access-secret-fastmeals-2026
JWT_REFRESH_SECRET=dev-refresh-secret-fastmeals-2026
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
CORS_ORIGIN=http://localhost:5000
```

## Rodar localmente

```bash
# Subir banco + Redis
docker-compose up auth-db redis -d

# Instalar, migrar e popular
cp .env.example .env
npm install
npx prisma migrate dev --name init
npx prisma generate
npm run seed

# Rodar testes (19 testes)
npm test

# Rodar com coverage
npx vitest run --coverage

# Rodar servidor
npm run dev
```

## Seed Data

| Email | Senha | Role |
|-------|-------|------|
| admin@fastmeals.com | Admin@123 | admin |
| viewer@fastmeals.com | Viewer@123 | viewer |

## Testes: 19

| Tipo | Quantidade | Cobertura |
|------|-----------|-----------|
| Unit | 11 | Use cases (login, refresh token) |
| Integration | 8 | Controllers HTTP, auth flow |

**Destaques dos testes:**
- Login com credenciais válidas e inválidas
- Refresh token flow completo
- Validação de campos obrigatórios (Zod)
- Rate limiting
- bcrypt hash verification
- Token expiration handling
