# 🚴 Remote Delivery — Microfrontend de Entregadores e Otimização

![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)
![Module Federation](https://img.shields.io/badge/Module_Federation-Remote-FF6F00?logo=webpack&logoColor=white)

Microfrontend de gestão de entregadores com CRUD, visualização Kanban por status, e aba de **Otimização** com algoritmo Hungarian mostrando atribuições sugeridas, distâncias Haversine e comparação greedy vs. ótimo.

&nbsp;

## Arquitetura

```
src/
├── main.tsx                   → Entry point + Module Federation export
├── pages/
│   └── DeliveryPage.tsx       → Página principal exposta via federation
├── components/
│   ├── delivery/
│   │   ├── DriversCards.tsx    → Cards de entregadores
│   │   ├── DriversKanban.tsx   → Kanban: Disponíveis / Em Entrega / Inativos
│   │   ├── CreateDriverDialog.tsx   → Modal de criação
│   │   ├── EditDriverDialog.tsx     → Modal de edição
│   │   ├── DeleteDriverDialog.tsx   → Confirmação de exclusão
│   │   └── OptimizationPanel.tsx    → Painel de otimização Hungarian
│   ├── shared/
│   │   ├── skeleton-loader.tsx
│   │   └── empty-state.tsx
│   └── ui/                    → shadcn/ui components
├── stores/
│   └── delivery-store.ts      → Zustand: CRUD, otimização
├── hooks/
│   └── use-delivery.ts        → Hook com API calls e estado
├── lib/
│   ├── api.ts                 → Axios instance com interceptors
│   └── utils.ts               → Helpers
└── types/
    └── index.ts               → DeliveryPerson, VehicleType, Assignment types
```

&nbsp;

## Componente Exposto

```typescript
// vite.config.ts — Module Federation
federation({
  name: 'remoteDelivery',
  filename: 'remoteEntry.js',
  exposes: {
    './DeliveryPage': './src/pages/DeliveryPage.tsx',
  },
})
```

&nbsp;

## Funcionalidades

| Feature | Descrição |
|---------|-----------|
| **Cards de entregadores** | Exibe nome, telefone, veículo, status |
| **Kanban por status** | Colunas: Disponíveis, Em Entrega, Inativos |
| **CRUD completo** | Criar, editar e excluir entregadores |
| **Máscara de telefone** | Formatação automática `(XX) XXXXX-XXXX` |
| **Aba Otimização** | Executa algoritmo Hungarian via API |
| **Resultado da otimização** | Atribuições sugeridas com distância (km) |
| **Comparação** | Greedy vs. Hungarian (economia de distância) |
| **Permissões** | Viewer não vê CRUD nem otimização |

&nbsp;

## Tabs

| Tab | Conteúdo |
|-----|----------|
| **Entregadores** | Cards/Kanban com CRUD |
| **Otimização** | Painel com resultado do Hungarian Algorithm |

&nbsp;

## API Endpoints Consumidos

| Método | Rota | Uso |
|--------|------|-----|
| GET | `/api/delivery-persons` | Listar entregadores |
| GET | `/api/delivery-persons/:id` | Detalhes do entregador |
| POST | `/api/delivery-persons` | Criar entregador |
| PUT | `/api/delivery-persons/:id` | Atualizar entregador |
| DELETE | `/api/delivery-persons/:id` | Remover entregador |
| POST | `/api/orders/optimize-assignment` | Executar otimização |

&nbsp;

## Porta

| Ambiente | Porta |
|----------|-------|
| Desenvolvimento | `5003` |
| Produção | Consolidado no Amplify (shell) |

&nbsp;

## Rodar localmente

```bash
npm install
npm run dev:fed    # Build com federation
npm run preview    # Serve na porta 5003
```
