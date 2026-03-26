frontend-mfe/
├── apps/
│   ├── shell/                    # Host App — layout, auth, routing
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── orders/
│   │   │   │   └── page.tsx      # Carrega remote "orders"
│   │   │   ├── products/
│   │   │   │   └── page.tsx      # Carrega remote "products"
│   │   │   ├── delivery/
│   │   │   │   └── page.tsx      # Carrega remote "delivery"
│   │   │   └── reports/
│   │   │       └── page.tsx      # Carrega remote "reports"
│   │   ├── components/
│   │   │   ├── sidebar.tsx
│   │   │   └── remote-loader.tsx
│   │   ├── next.config.mjs
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── orders/                   # Remote App — módulo de pedidos
│   │   ├── components/
│   │   │   └── OrdersPage.tsx    # Componente exposto
│   │   ├── next.config.mjs
│   │   ├── package.json
│   │   └── pages/
│   │       └── index.tsx         # Standalone page
│   │
│   ├── products/                 # Remote App — módulo de produtos
│   │   ├── components/
│   │   │   └── ProductsPage.tsx
│   │   ├── next.config.mjs
│   │   ├── package.json
│   │   └── pages/
│   │       └── index.tsx
│   │
│   ├── delivery/                 # Remote App — módulo de entregadores
│   │   ├── components/
│   │   │   └── DeliveryPage.tsx
│   │   ├── next.config.mjs
│   │   ├── package.json
│   │   └── pages/
│   │       └── index.tsx
│   │
│   └── reports/                  # Remote App — módulo de relatórios
│       ├── components/
│       │   └── ReportsPage.tsx
│       ├── next.config.mjs
│       ├── package.json
│       └── pages/
│           └── index.tsx
│
├── packages/
│   ├── ui/                       # Componentes compartilhados
│   │   ├── src/
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── badge.tsx
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── shared/                   # Types, utils, API client
│   │   ├── src/
│   │   │   ├── types/
│   │   │   │   └── index.ts
│   │   │   ├── api/
│   │   │   │   └── client.ts
│   │   │   ├── hooks/
│   │   │   │   └── use-auth.ts
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── config/                   # Configs compartilhados
│       ├── tailwind.config.ts
│       ├── tsconfig.base.json
│       └── package.json
│
├── turbo.json
├── package.json
├── pnpm-workspace.yaml
└── .env