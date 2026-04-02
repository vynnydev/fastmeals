# 🏠 Shell — Host Microfrontend

![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-E2E_28_tests-2EAD33?logo=playwright&logoColor=white)

Shell host que orquestra 4 microfrontends remotos via **Module Federation**. Gerencia autenticação, layout global, roteamento e o tema CSS da aplicação.

&nbsp;

## Arquitetura

```
src/
├── App.tsx                    → Roteamento principal (React Router)
├── main.tsx                   → Entry point
├── pages/
│   ├── Login.tsx              → Tela de login (react-hook-form + zod)
│   └── Dashboard.tsx          → Dashboard com stat cards e gráficos
├── components/
│   ├── Header.tsx             → Header com user info e logout
│   ├── Sidebar.tsx            → Navegação lateral colapsável
│   ├── ProtectedRoute.tsx     → Guard de autenticação
│   ├── shared/
│   │   ├── skeleton-loader.tsx
│   │   └── status-badge.tsx
│   └── ui/                    → shadcn/ui components
├── stores/
│   ├── auth-store.ts          → Zustand: login, logout, token management
│   └── ui-store.ts            → Zustand: sidebar state, theme
├── hooks/
│   └── use-auth.ts            → Hook de autenticação
├── lib/
│   └── utils.ts               → cn() helper
└── types/
    ├── index.ts               → Tipos compartilhados
    └── remotes.d.ts           → Declarações Module Federation
```

&nbsp;

## Responsabilidades

| Responsabilidade | Descrição |
|-----------------|-----------|
| **Autenticação** | Login, logout, JWT storage (localStorage), refresh token |
| **Roteamento** | React Router com ProtectedRoute guard |
| **Layout** | Header + Sidebar + Content area |
| **CSS Global** | Tailwind CSS 4 com `@source` directives para incluir remotes |
| **Theme** | Dark mode gold com oklch colors |
| **Module Federation** | Host que consome 4 remotes em runtime |

&nbsp;

## Remotes Consumidos

| Remote | Componente Exposto | Rota |
|--------|-------------------|------|
| remote-orders | `OrdersPage` | `/orders` |
| remote-products | `ProductsPage` | `/products` |
| remote-delivery | `DeliveryPage` | `/delivery` |
| remote-reports | `ReportsPage` | `/reports` |

&nbsp;

## Porta

| Ambiente | Porta |
|----------|-------|
| Desenvolvimento | `5000` |
| Produção | AWS Amplify (CDN) |

&nbsp;

## Rodar localmente

```bash
npm install
npm run dev    # Porta 5000
```

&nbsp;

## Testes E2E — Playwright

O shell contém **28 testes E2E** com Playwright que validam toda a aplicação (incluindo os remotes):

```bash
# Contra produção
PLAYWRIGHT_BASE_URL=https://fastmeals.com.br npx playwright test --reporter=list

# Com browser visível
PLAYWRIGHT_BASE_URL=https://fastmeals.com.br npx playwright test --headed --project=full-flow
```

&nbsp;

## Decisões Técnicas

| Decisão | Motivo |
|---------|--------|
| **Tailwind só no shell** | `@source` directives incluem CSS dos remotes, evitando conflito de CSS reset |
| **Auth via localStorage** | `fastmeals_user` + `fastmeals_token` acessíveis por todos os remotes |
| **Zustand persist** | Estado de autenticação persiste entre refreshes |
| **Sonner (toast)** | Funciona sem contexto React — compatível com Module Federation |
