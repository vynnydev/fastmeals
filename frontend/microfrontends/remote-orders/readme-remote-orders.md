# 📋 Remote Orders — Microfrontend de Pedidos

![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)
![Module Federation](https://img.shields.io/badge/Module_Federation-Remote-FF6F00?logo=webpack&logoColor=white)

Microfrontend de gestão de pedidos com três visualizações (Tabela, Cards, Kanban), criação de pedidos, transição de status e atribuição de entregadores.

&nbsp;

## Arquitetura

```
src/
├── main.tsx                   → Entry point + Module Federation export
├── pages/
│   └── OrdersPage.tsx         → Página principal exposta via federation
├── components/
│   ├── orders/
│   │   ├── OrdersTable.tsx    → Visualização em tabela
│   │   ├── OrdersCards.tsx    → Visualização em cards
│   │   ├── OrdersKanban.tsx   → Visualização kanban por status
│   │   ├── CreateOrderDialog.tsx → Modal de criação de pedido
│   │   ├── OrderStatusBadge.tsx  → Badge de status com cores
│   │   └── AssignDriverDialog.tsx → Atribuição de entregador
│   ├── shared/
│   │   ├── skeleton-loader.tsx
│   │   └── empty-state.tsx
│   └── ui/                    → shadcn/ui components
├── stores/
│   └── orders-store.ts        → Zustand: CRUD, status, assign
├── hooks/
│   └── use-orders.ts          → Hook com API calls e estado
├── lib/
│   ├── api.ts                 → Axios instance com interceptors
│   └── utils.ts               → Helpers
└── types/
    └── index.ts               → Order, OrderItem, OrderStatus types
```

&nbsp;

## Componente Exposto

```typescript
// vite.config.ts — Module Federation
federation({
  name: 'remoteOrders',
  filename: 'remoteEntry.js',
  exposes: {
    './OrdersPage': './src/pages/OrdersPage.tsx',
  },
})
```

&nbsp;

## Funcionalidades

| Feature | Descrição |
|---------|-----------|
| **Três visualizações** | Tabela, Cards e Kanban — toggle via botões |
| **Kanban por status** | Colunas: Pendente, Preparando, Pronto, Em Entrega, Entregue, Cancelado |
| **Criação de pedido** | Dialog com carrinho de produtos, endereço de entrega |
| **Transição de status** | Dropdown com transições válidas da máquina de estados |
| **Atribuição de entregador** | Select com entregadores disponíveis (ocupados desabilitados) |
| **Cancelamento** | Disponível em pending, preparing e ready |
| **Permissões** | Viewer vê apenas leitura — sem botões de CRUD |

&nbsp;

## API Endpoints Consumidos

| Método | Rota | Uso |
|--------|------|-----|
| GET | `/api/orders` | Listar pedidos |
| GET | `/api/orders/:id` | Detalhes do pedido |
| POST | `/api/orders` | Criar pedido |
| PATCH | `/api/orders/:id/status` | Atualizar status |
| PATCH | `/api/orders/:id/assign` | Atribuir entregador |

&nbsp;

## Porta

| Ambiente | Porta |
|----------|-------|
| Desenvolvimento | `5001` |
| Produção | Consolidado no Amplify (shell) |

&nbsp;

## Rodar localmente

```bash
npm install
npm run dev:fed    # Build com federation
npm run preview    # Serve na porta 5001
```
