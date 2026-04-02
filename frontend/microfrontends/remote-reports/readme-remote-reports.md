# 📊 Remote Reports — Microfrontend de Relatórios e AI Insights

![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-3-22b5bf?logo=react&logoColor=white)
![AWS Bedrock](https://img.shields.io/badge/AWS_Bedrock-Amazon_Nova-232F3E?logo=amazon-aws&logoColor=white)
![Module Federation](https://img.shields.io/badge/Module_Federation-Remote-FF6F00?logo=webpack&logoColor=white)

Microfrontend de analytics com 3 tabs (Visão Geral, Entregas, IA Insights), gráficos interativos via Recharts, filtro por período, e geração de insights com IA via AWS Bedrock (Amazon Nova) com fallback local.

&nbsp;

## Arquitetura

```
src/
├── main.tsx                   → Entry point + Module Federation export
├── pages/
│   └── ReportsPage.tsx        → Página principal exposta via federation
├── components/
│   ├── reports/
│   │   ├── OverviewTab.tsx    → Receita diária + pedidos por status
│   │   ├── DeliveryTab.tsx    → Tempo médio de entrega por veículo
│   │   ├── AIInsightsTab.tsx  → Geração de insights com IA
│   │   ├── RevenueChart.tsx   → Gráfico de receita (AreaChart)
│   │   ├── OrdersByStatusChart.tsx → Gráfico de status (BarChart)
│   │   ├── TopProductsChart.tsx    → Ranking de produtos (BarChart)
│   │   └── DeliveryTimeChart.tsx   → Tempo por veículo (BarChart)
│   ├── shared/
│   │   ├── skeleton-loader.tsx
│   │   └── error-state.tsx
│   └── ui/                    → shadcn/ui components
├── hooks/
│   ├── use-reports.ts         → Hook com API calls para todos os relatórios
│   ├── use-auth.ts            → Hook de autenticação
│   └── use-animated-counter.tsx → Contagem progressiva nos stat cards
├── lib/
│   ├── api.ts                 → Axios instance com interceptors
│   └── utils.ts               → Helpers
└── types/
    └── index.ts               → Revenue, OrdersByStatus, TopProducts, AIInsights types
```

&nbsp;

## Componente Exposto

```typescript
// vite.config.ts — Module Federation
federation({
  name: 'remoteReports',
  filename: 'remoteEntry.js',
  exposes: {
    './ReportsPage': './src/pages/ReportsPage.tsx',
  },
})
```

&nbsp;

## Funcionalidades

| Feature | Descrição |
|---------|-----------|
| **Stat cards animados** | Receita total, total de pedidos, entregas realizadas, tempo médio |
| **Números animados** | Contagem progressiva com easing (`use-animated-counter`) |
| **Filtro por período** | Date range com startDate/endDate |
| **Gráficos interativos** | Recharts com tooltips, legends e cores temáticas |
| **AI Insights** | Geração de resumo, recomendações e destaques via Bedrock |
| **Fallback local** | Se Bedrock indisponível, gera insights a partir dos dados reais |

&nbsp;

## Tabs

| Tab | Conteúdo |
|-----|----------|
| **Visão Geral** | Receita diária (AreaChart) + Pedidos por status (BarChart) + Top produtos |
| **Entregas** | Tempo médio por veículo (Moto / Bicicleta / Carro), mais rápido, mais lento |
| **IA Insights** | Botão "Gerar Insights com IA" → Resumo inteligente, recomendações, destaques |

&nbsp;

## AI Insights — Fluxo

```
1. Usuário clica "Gerar Insights com IA"
2. Frontend envia GET /api/reports/ai-insights?startDate=...&endDate=...
3. Backend coleta 4 relatórios em paralelo (Promise.all)
4. Monta prompt em português → envia para Amazon Nova (Bedrock)
5. Retorna: summary, recommendations[], highlights[]
6. Se Bedrock falhar → fallback-local com insights básicos
```

&nbsp;

## API Endpoints Consumidos

| Método | Rota | Uso |
|--------|------|-----|
| GET | `/api/reports/revenue` | Receita por período |
| GET | `/api/reports/orders-by-status` | Pedidos agrupados por status |
| GET | `/api/reports/top-products` | Produtos mais vendidos |
| GET | `/api/reports/average-delivery-time` | Tempo médio de entrega |
| GET | `/api/reports/ai-insights` | Insights com IA (Bedrock) |

&nbsp;

## Porta

| Ambiente | Porta |
|----------|-------|
| Desenvolvimento | `5004` |
| Produção | Consolidado no Amplify (shell) |

&nbsp;

## Rodar localmente

```bash
npm install
npm run dev:fed    # Build com federation
npm run preview    # Serve na porta 5004
```

&nbsp;

## Decisões Técnicas

| Decisão | Motivo |
|---------|--------|
| **recharts no `shared`** | Usa hooks internos — precisa da mesma instância React |
| **Sem store (Zustand)** | Dados vêm da API sob demanda, sem cache local |
| **use-animated-counter** | Efeito visual de contagem nos stat cards |
| **Fallback local** | AI Insights nunca falha — graceful degradation |
