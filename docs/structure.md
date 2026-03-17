fastmeals/
├── README.md
├── DECISIONS.md
├── docker-compose.yml
├── nginx/
│   └── nginx.conf
├── .github/
│   └── workflows/
│       └── ci.yml
├── docs/
│   ├── api-spec.md
│   ├── database-schema.md
│   ├── evaluation-criteria.md
│   └── diagrams/
├── seed/
│   └── data.json
│
├── backend/
│   ├── services/
│   │   │
│   │   ├── auth-service/
│   │   │   ├── package.json
│   │   │   ├── tsconfig.json
│   │   │   ├── vitest.config.ts
│   │   │   ├── Dockerfile
│   │   │   ├── docker-compose.yml          # Individual: auth + auth_db + redis
│   │   │   ├── .env.example
│   │   │   │
│   │   │   ├── prisma/
│   │   │   │   ├── schema.prisma           # model User only
│   │   │   │   ├── seed.ts                 # Seed users
│   │   │   │   └── migrations/
│   │   │   │
│   │   │   ├── src/
│   │   │   │   ├── server.ts               # Express (local dev + Docker)
│   │   │   │   │
│   │   │   │   ├── domain/
│   │   │   │   │   ├── entities/
│   │   │   │   │   │   └── user.entity.ts
│   │   │   │   │   └── repositories/
│   │   │   │   │       └── user-repository.interface.ts
│   │   │   │   │
│   │   │   │   ├── application/
│   │   │   │   │   ├── use-cases/
│   │   │   │   │   │   ├── login.use-case.ts
│   │   │   │   │   │   └── refresh-token.use-case.ts
│   │   │   │   │   ├── dtos/
│   │   │   │   │   │   ├── login-request.dto.ts
│   │   │   │   │   │   ├── login-response.dto.ts
│   │   │   │   │   │   └── refresh-token.dto.ts
│   │   │   │   │   └── interfaces/
│   │   │   │   │       ├── jwt-service.interface.ts
│   │   │   │   │       └── token-store.interface.ts
│   │   │   │   │
│   │   │   │   ├── infrastructure/
│   │   │   │   │   ├── database/
│   │   │   │   │   │   └── prisma-client.ts
│   │   │   │   │   ├── repositories/
│   │   │   │   │   │   └── prisma-user.repository.ts
│   │   │   │   │   ├── services/
│   │   │   │   │   │   ├── jwt.service.ts
│   │   │   │   │   │   ├── bcrypt.service.ts
│   │   │   │   │   │   └── redis-token-store.service.ts
│   │   │   │   │   ├── http/
│   │   │   │   │   │   ├── controllers/
│   │   │   │   │   │   │   └── auth.controller.ts
│   │   │   │   │   │   ├── routes/
│   │   │   │   │   │   │   └── auth.routes.ts
│   │   │   │   │   │   ├── middlewares/
│   │   │   │   │   │   │   └── rate-limiter.middleware.ts
│   │   │   │   │   │   └── validators/
│   │   │   │   │   │       └── auth.validator.ts
│   │   │   │   │   └── container/
│   │   │   │   │       └── index.ts        # Dependency injection setup
│   │   │   │   │
│   │   │   │   └── lambda/
│   │   │   │       ├── auth-login.handler.ts
│   │   │   │       └── auth-refresh-token.handler.ts
│   │   │   │
│   │   │   └── tests/
│   │   │       ├── unit/
│   │   │       │   ├── login.use-case.spec.ts
│   │   │       │   └── refresh-token.use-case.spec.ts
│   │   │       └── integration/
│   │   │           └── auth.integration.spec.ts
│   │   │
│   │   ├── products-service/
│   │   │   ├── package.json
│   │   │   ├── tsconfig.json
│   │   │   ├── vitest.config.ts
│   │   │   ├── Dockerfile
│   │   │   ├── docker-compose.yml          # Individual: products + products_db
│   │   │   ├── .env.example
│   │   │   │
│   │   │   ├── prisma/
│   │   │   │   ├── schema.prisma           # model Product only
│   │   │   │   ├── seed.ts
│   │   │   │   └── migrations/
│   │   │   │
│   │   │   ├── src/
│   │   │   │   ├── server.ts
│   │   │   │   │
│   │   │   │   ├── domain/
│   │   │   │   │   ├── entities/
│   │   │   │   │   │   └── product.entity.ts
│   │   │   │   │   └── repositories/
│   │   │   │   │       └── product-repository.interface.ts
│   │   │   │   │
│   │   │   │   ├── application/
│   │   │   │   │   ├── use-cases/
│   │   │   │   │   │   ├── create-product.use-case.ts
│   │   │   │   │   │   ├── update-product.use-case.ts
│   │   │   │   │   │   ├── delete-product.use-case.ts
│   │   │   │   │   │   ├── get-product.use-case.ts
│   │   │   │   │   │   └── list-products.use-case.ts
│   │   │   │   │   └── dtos/
│   │   │   │   │       ├── create-product.dto.ts
│   │   │   │   │       ├── update-product.dto.ts
│   │   │   │   │       └── list-products-query.dto.ts
│   │   │   │   │
│   │   │   │   ├── infrastructure/
│   │   │   │   │   ├── database/
│   │   │   │   │   │   └── prisma-client.ts
│   │   │   │   │   ├── repositories/
│   │   │   │   │   │   └── prisma-product.repository.ts
│   │   │   │   │   ├── http/
│   │   │   │   │   │   ├── controllers/
│   │   │   │   │   │   │   └── product.controller.ts
│   │   │   │   │   │   ├── routes/
│   │   │   │   │   │   │   └── product.routes.ts
│   │   │   │   │   │   ├── middlewares/
│   │   │   │   │   │   │   ├── auth.middleware.ts
│   │   │   │   │   │   │   └── role-guard.middleware.ts
│   │   │   │   │   │   └── validators/
│   │   │   │   │   │       └── product.validator.ts
│   │   │   │   │   └── container/
│   │   │   │   │       └── index.ts
│   │   │   │   │
│   │   │   │   └── lambda/
│   │   │   │       ├── products-create.handler.ts
│   │   │   │       ├── products-update.handler.ts
│   │   │   │       ├── products-delete.handler.ts
│   │   │   │       ├── products-get.handler.ts
│   │   │   │       └── products-list.handler.ts
│   │   │   │
│   │   │   └── tests/
│   │   │       ├── unit/
│   │   │       │   ├── create-product.use-case.spec.ts
│   │   │       │   └── delete-product.use-case.spec.ts
│   │   │       └── integration/
│   │   │           └── products.integration.spec.ts
│   │   │
│   │   ├── orders-service/
│   │   │   ├── package.json
│   │   │   ├── tsconfig.json
│   │   │   ├── vitest.config.ts
│   │   │   ├── Dockerfile
│   │   │   ├── docker-compose.yml
│   │   │   ├── .env.example
│   │   │   │
│   │   │   ├── prisma/
│   │   │   │   ├── schema.prisma           # models: Order, OrderItem
│   │   │   │   ├── seed.ts
│   │   │   │   └── migrations/
│   │   │   │
│   │   │   ├── src/
│   │   │   │   ├── server.ts
│   │   │   │   │
│   │   │   │   ├── domain/
│   │   │   │   │   ├── entities/
│   │   │   │   │   │   ├── order.entity.ts
│   │   │   │   │   │   └── order-item.entity.ts
│   │   │   │   │   ├── repositories/
│   │   │   │   │   │   └── order-repository.interface.ts
│   │   │   │   │   └── value-objects/
│   │   │   │   │       └── order-status.vo.ts
│   │   │   │   │
│   │   │   │   ├── application/
│   │   │   │   │   ├── use-cases/
│   │   │   │   │   │   ├── create-order.use-case.ts
│   │   │   │   │   │   ├── list-orders.use-case.ts
│   │   │   │   │   │   ├── get-order.use-case.ts
│   │   │   │   │   │   ├── update-order-status.use-case.ts
│   │   │   │   │   │   └── assign-delivery-person.use-case.ts
│   │   │   │   │   ├── dtos/
│   │   │   │   │   │   ├── create-order.dto.ts
│   │   │   │   │   │   ├── update-status.dto.ts
│   │   │   │   │   │   └── assign-delivery.dto.ts
│   │   │   │   │   └── interfaces/
│   │   │   │   │       ├── product-client.interface.ts
│   │   │   │   │       └── delivery-client.interface.ts
│   │   │   │   │
│   │   │   │   ├── infrastructure/
│   │   │   │   │   ├── database/
│   │   │   │   │   │   └── prisma-client.ts
│   │   │   │   │   ├── repositories/
│   │   │   │   │   │   └── prisma-order.repository.ts
│   │   │   │   │   ├── clients/
│   │   │   │   │   │   ├── product-service.client.ts
│   │   │   │   │   │   └── delivery-service.client.ts
│   │   │   │   │   ├── http/
│   │   │   │   │   │   ├── controllers/
│   │   │   │   │   │   │   └── order.controller.ts
│   │   │   │   │   │   ├── routes/
│   │   │   │   │   │   │   └── order.routes.ts
│   │   │   │   │   │   ├── middlewares/
│   │   │   │   │   │   │   ├── auth.middleware.ts
│   │   │   │   │   │   │   └── role-guard.middleware.ts
│   │   │   │   │   │   └── validators/
│   │   │   │   │   │       └── order.validator.ts
│   │   │   │   │   └── container/
│   │   │   │   │       └── index.ts
│   │   │   │   │
│   │   │   │   └── lambda/
│   │   │   │       ├── orders-create.handler.ts
│   │   │   │       ├── orders-list.handler.ts
│   │   │   │       ├── orders-get.handler.ts
│   │   │   │       ├── orders-update-status.handler.ts
│   │   │   │       └── orders-assign-delivery.handler.ts
│   │   │   │
│   │   │   └── tests/
│   │   │       ├── unit/
│   │   │       │   ├── create-order.use-case.spec.ts
│   │   │       │   ├── update-status.use-case.spec.ts
│   │   │       │   └── order-status.vo.spec.ts
│   │   │       └── integration/
│   │   │           └── orders.integration.spec.ts
│   │   │
│   │   ├── delivery-service/
│   │   │   ├── package.json
│   │   │   ├── tsconfig.json
│   │   │   ├── vitest.config.ts
│   │   │   ├── Dockerfile
│   │   │   ├── docker-compose.yml
│   │   │   ├── .env.example
│   │   │   │
│   │   │   ├── prisma/
│   │   │   │   ├── schema.prisma           # model: DeliveryPerson
│   │   │   │   ├── seed.ts
│   │   │   │   └── migrations/
│   │   │   │
│   │   │   ├── src/
│   │   │   │   ├── server.ts
│   │   │   │   │
│   │   │   │   ├── domain/
│   │   │   │   │   ├── entities/
│   │   │   │   │   │   └── delivery-person.entity.ts
│   │   │   │   │   └── repositories/
│   │   │   │   │       └── delivery-person-repository.interface.ts
│   │   │   │   │
│   │   │   │   ├── application/
│   │   │   │   │   ├── use-cases/
│   │   │   │   │   │   ├── create-delivery-person.use-case.ts
│   │   │   │   │   │   ├── update-delivery-person.use-case.ts
│   │   │   │   │   │   ├── delete-delivery-person.use-case.ts
│   │   │   │   │   │   └── list-delivery-persons.use-case.ts
│   │   │   │   │   └── dtos/
│   │   │   │   │       └── delivery-person.dto.ts
│   │   │   │   │
│   │   │   │   ├── infrastructure/
│   │   │   │   │   ├── database/
│   │   │   │   │   │   └── prisma-client.ts
│   │   │   │   │   ├── repositories/
│   │   │   │   │   │   └── prisma-delivery-person.repository.ts
│   │   │   │   │   ├── http/
│   │   │   │   │   │   ├── controllers/
│   │   │   │   │   │   │   └── delivery-person.controller.ts
│   │   │   │   │   │   ├── routes/
│   │   │   │   │   │   │   └── delivery-person.routes.ts
│   │   │   │   │   │   ├── middlewares/
│   │   │   │   │   │   │   ├── auth.middleware.ts
│   │   │   │   │   │   │   └── role-guard.middleware.ts
│   │   │   │   │   │   └── validators/
│   │   │   │   │   │       └── delivery-person.validator.ts
│   │   │   │   │   └── container/
│   │   │   │   │       └── index.ts
│   │   │   │   │
│   │   │   │   └── lambda/
│   │   │   │       ├── delivery-create.handler.ts
│   │   │   │       ├── delivery-update.handler.ts
│   │   │   │       ├── delivery-delete.handler.ts
│   │   │   │       └── delivery-list.handler.ts
│   │   │   │
│   │   │   └── tests/
│   │   │       └── unit/
│   │   │           └── delivery-person.use-case.spec.ts
│   │   │
│   │   ├── optimization-service/
│   │   │   ├── package.json
│   │   │   ├── tsconfig.json
│   │   │   ├── vitest.config.ts
│   │   │   ├── Dockerfile
│   │   │   ├── docker-compose.yml
│   │   │   ├── .env.example
│   │   │   │
│   │   │   ├── src/
│   │   │   │   ├── server.ts
│   │   │   │   │
│   │   │   │   ├── domain/
│   │   │   │   │   ├── algorithms/
│   │   │   │   │   │   ├── haversine.ts
│   │   │   │   │   │   └── hungarian.ts
│   │   │   │   │   └── interfaces/
│   │   │   │   │       ├── order-data-source.interface.ts
│   │   │   │   │       └── delivery-data-source.interface.ts
│   │   │   │   │
│   │   │   │   ├── application/
│   │   │   │   │   ├── use-cases/
│   │   │   │   │   │   └── optimize-assignment.use-case.ts
│   │   │   │   │   └── dtos/
│   │   │   │   │       └── optimization-result.dto.ts
│   │   │   │   │
│   │   │   │   ├── infrastructure/
│   │   │   │   │   ├── clients/
│   │   │   │   │   │   ├── order-service.client.ts
│   │   │   │   │   │   └── delivery-service.client.ts
│   │   │   │   │   ├── http/
│   │   │   │   │   │   ├── controllers/
│   │   │   │   │   │   │   └── optimization.controller.ts
│   │   │   │   │   │   └── routes/
│   │   │   │   │   │       └── optimization.routes.ts
│   │   │   │   │   └── container/
│   │   │   │   │       └── index.ts
│   │   │   │   │
│   │   │   │   └── lambda/
│   │   │   │       └── optimization-execute.handler.ts
│   │   │   │
│   │   │   └── tests/
│   │   │       └── unit/
│   │   │           ├── haversine.spec.ts
│   │   │           ├── hungarian.spec.ts
│   │   │           └── optimize-assignment.spec.ts
│   │   │
│   │   └── reports-service/
│   │       ├── package.json
│   │       ├── tsconfig.json
│   │       ├── vitest.config.ts
│   │       ├── Dockerfile
│   │       ├── docker-compose.yml
│   │       ├── .env.example
│   │       │
│   │       ├── prisma/
│   │       │   ├── schema.prisma           # Read model: all tables (CQRS read side)
│   │       │   └── migrations/
│   │       │
│   │       ├── src/
│   │       │   ├── server.ts
│   │       │   │
│   │       │   ├── domain/
│   │       │   │   └── repositories/
│   │       │   │       └── report-repository.interface.ts
│   │       │   │
│   │       │   ├── application/
│   │       │   │   ├── use-cases/
│   │       │   │   │   ├── get-revenue.use-case.ts
│   │       │   │   │   ├── get-orders-by-status.use-case.ts
│   │       │   │   │   ├── get-top-products.use-case.ts
│   │       │   │   │   └── get-avg-delivery-time.use-case.ts
│   │       │   │   └── dtos/
│   │       │   │       └── report-query.dto.ts
│   │       │   │
│   │       │   ├── infrastructure/
│   │       │   │   ├── database/
│   │       │   │   │   └── prisma-client.ts
│   │       │   │   ├── repositories/
│   │       │   │   │   └── prisma-report.repository.ts
│   │       │   │   ├── http/
│   │       │   │   │   ├── controllers/
│   │       │   │   │   │   └── report.controller.ts
│   │       │   │   │   ├── routes/
│   │       │   │   │   │   └── report.routes.ts
│   │       │   │   │   └── middlewares/
│   │       │   │   │       └── auth.middleware.ts
│   │       │   │   └── container/
│   │       │   │       └── index.ts
│   │       │   │
│   │       │   └── lambda/
│   │       │       ├── reports-revenue.handler.ts
│   │       │       ├── reports-orders-by-status.handler.ts
│   │       │       ├── reports-top-products.handler.ts
│   │       │       └── reports-avg-delivery.handler.ts
│   │       │
│   │       └── tests/
│   │           └── unit/
│   │               ├── revenue.spec.ts
│   │               └── top-products.spec.ts
│   │
│   └── shared/                              # @fastmeals/shared (npm workspace)
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── middlewares/
│           │   ├── auth.middleware.ts
│           │   ├── rate-limiter.middleware.ts
│           │   └── role-guard.middleware.ts
│           ├── errors/
│           │   ├── app-error.ts
│           │   └── error-codes.ts
│           ├── config/
│           │   └── env.ts
│           ├── logger/
│           │   └── winston.ts
│           └── utils/
│               └── pagination.ts
│
├── frontend/
│   └── (... mesmo da versão anterior, monolito Next.js 14)
│
└── infra/
    └── terraform/
        ├── main.tf
        ├── variables.tf
        ├── outputs.tf
        ├── providers.tf
        └── modules/
            ├── api-gateway/             # Roteia path+method → Lambda específica
            ├── lambda/                  # 20 Lambdas, uma por use case
            ├── rds/                     # Um RDS por serviço (ou Aurora Serverless)
            ├── elasticache/             # Redis para tokens
            ├── amplify/                 # Frontend deployment
            └── cloudfront/              # CDN