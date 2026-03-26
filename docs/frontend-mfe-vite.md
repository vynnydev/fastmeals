frontend-mfe-vite/
├── shell/                        # Host App (porta 5000)
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── index.css
│   │   ├── components/
│   │   │   └── Sidebar.tsx
│   │   ├── pages/
│   │   │   └── Dashboard.tsx
│   │   └── types/
│   │       └── remotes.d.ts
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── .env
│
├── remote-orders/                # Remote (porta 5001)
│   ├── src/
│   │   ├── components/
│   │   │   └── OrdersPage.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── remote-products/              # Remote (porta 5002)
│   ├── src/
│   │   ├── components/
│   │   │   └── ProductsPage.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── (mesma estrutura)
│
├── remote-delivery/              # Remote (porta 5003)
│   ├── src/
│   │   ├── components/
│   │   │   └── DeliveryPage.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── (mesma estrutura)
│
└── remote-reports/               # Remote (porta 5004)
    ├── src/
    │   ├── components/
    │   │   └── ReportsPage.tsx
    │   ├── main.tsx
    │   └── index.css
    ├── (mesma estrutura)