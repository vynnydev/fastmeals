# Decisoes Arquiteturais - FastMeals Frontend

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![shadcn/ui](https://img.shields.io/badge/shadcn/ui-latest-000000?style=for-the-badge&logo=shadcnui&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-5-433E38?style=for-the-badge&logo=react&logoColor=white)
![React Hook Form](https://img.shields.io/badge/React_Hook_Form-7-EC5990?style=for-the-badge&logo=reacthookform&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-3.24-3E67B1?style=for-the-badge&logo=zod&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-2-22B5BF?style=for-the-badge&logo=react&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-1.7-5A29E4?style=for-the-badge&logo=axios&logoColor=white)
![SWR](https://img.shields.io/badge/SWR-2.3-000000?style=for-the-badge&logo=vercel&logoColor=white)

---

## Indice

- [1. Framework e Runtime](#1-framework-e-runtime)
- [2. Gerenciamento de Estado](#2-gerenciamento-de-estado)
- [3. Biblioteca de Componentes](#3-biblioteca-de-componentes)
- [4. Formularios e Validacao](#4-formularios-e-validacao)
- [5. Graficos e Visualizacoes](#5-graficos-e-visualizacoes)
- [6. Cliente HTTP e Data Fetching](#6-cliente-http-e-data-fetching)
- [7. Estilizacao](#7-estilizacao)
- [8. Padroes de UX](#8-padroes-de-ux)
- [9. Responsividade e Acessibilidade](#9-responsividade-e-acessibilidade)
- [10. Estrategia de Autenticacao](#10-estrategia-de-autenticacao)
- [11. Componentizacao e Reutilizacao](#11-componentizacao-e-reutilizacao)
- [12. Estrutura de Pastas](#12-estrutura-de-pastas)

---

## 1. Framework e Runtime

### Decisao: Next.js 15 com React 19

**Alternativas Consideradas:**
| Framework | Pros | Contras |
|-----------|------|---------|
| **Next.js 15** | SSR/SSG nativo, App Router, Server Components, otimizacao automatica | Curva de aprendizado, complexidade adicional |
| Vite + React | Mais simples, build rapido | Sem SSR nativo, precisa configurar roteamento |
| Remix | Excelente para forms, nested routes | Ecossistema menor, menos recursos |
| Create React App | Familiar, simples | Descontinuado, sem SSR |

**Justificativa:**
- **App Router** permite layouts aninhados perfeitos para dashboards
- **Server Components** reduzem bundle size e melhoram performance
- **API Routes** facilitam proxying de requisicoes
- **Otimizacao de imagens** nativa com next/image
- **Suporte a React 19** com Server Actions e novas features

**Trade-offs:**
- Maior complexidade vs SPA pura
- Necessidade de entender modelo mental de Server vs Client Components
- Algumas bibliotecas (como react-three-fiber) ainda nao sao 100% compativeis

---

## 2. Gerenciamento de Estado

### Decisao: Zustand para Estado Global

**Alternativas Consideradas:**
| Biblioteca | Bundle Size | Boilerplate | DevTools | Performance |
|------------|-------------|-------------|----------|-------------|
| **Zustand** | ~1KB | Minimo | Sim | Excelente |
| Redux Toolkit | ~11KB | Medio | Excelente | Boa |
| Context API | 0KB | Baixo | Limitado | Problemas com re-renders |
| Jotai | ~2KB | Minimo | Sim | Excelente |
| Recoil | ~20KB | Medio | Sim | Boa |

**Justificativa:**
```typescript
// Zustand - Simples e direto
const useAuthStore = create<AuthState>((set) => ({
  user: null,
  login: async (data) => {
    const response = await authApi.login(data)
    set({ user: response.user })
  },
}))
```

- **Bundle size minimo** (~1KB gzipped)
- **Zero boilerplate** - nao precisa de providers, actions, reducers
- **Seletores automaticos** - evita re-renders desnecessarios
- **Suporte a middleware** - persist, devtools, immer
- **TypeScript first** - tipagem excelente out-of-the-box

**Trade-offs:**
- Menos estrutura que Redux (pode ser positivo ou negativo)
- DevTools menos robustos que Redux DevTools
- Menos recursos de time-travel debugging

### Stores Criadas:
- `auth-store.ts` - Autenticacao e usuario logado
- `orders-store.ts` - Estado de pedidos com filtros e paginacao
- `products-store.ts` - Catalogo de produtos
- `delivery-store.ts` - Entregadores e entregas
- `ui-store.ts` - Estado da UI (sidebar, modais)

---

## 3. Biblioteca de Componentes

### Decisao: shadcn/ui

**Alternativas Consideradas:**
| Biblioteca | Customizacao | Bundle | Acessibilidade | Estilo |
|------------|--------------|--------|----------------|--------|
| **shadcn/ui** | Total | Sob demanda | Radix UI | Tailwind |
| Material UI | Limitada | Grande | Boa | Material Design |
| Chakra UI | Boa | Medio | Boa | Props-based |
| Ant Design | Limitada | Grande | Media | Ant Design |
| Headless UI | Total | Pequeno | Excelente | Nenhum |

**Justificativa:**
- **Copy-paste** - componentes sao copiados para o projeto, total controle
- **Radix UI** como base - acessibilidade garantida
- **Tailwind CSS** - estilizacao consistente com o projeto
- **Nao e dependencia** - codigo e seu, pode modificar livremente
- **Dark mode** nativo com CSS variables

**Trade-offs:**
- Precisa manter os componentes manualmente
- Menos "out-of-the-box" que Material UI
- Requer conhecimento de Tailwind

### Componentes Utilizados:
- Button, Card, Input, Label, Select
- Dialog, Sheet, Dropdown Menu
- Table, Tabs, Badge, Avatar
- Skeleton, Toast (Sonner)

---

## 4. Formularios e Validacao

### Decisao: React Hook Form + Zod

**Alternativas Consideradas:**
| Solucao | Re-renders | Validacao | Bundle | DX |
|---------|------------|-----------|--------|-----|
| **RHF + Zod** | Minimos | Schema-based | ~12KB | Excelente |
| Formik + Yup | Muitos | Schema-based | ~20KB | Boa |
| React Final Form | Poucos | Custom | ~8KB | Media |
| useState manual | Muitos | Custom | 0KB | Trabalhosa |

**Justificativa:**
```typescript
// Schema Zod reutilizavel
const productSchema = z.object({
  name: z.string().min(1, 'Nome obrigatorio'),
  price: z.number().min(0.01, 'Preco deve ser positivo'),
  category: z.enum(['meal', 'drink', 'dessert', 'snack']),
})

// Integracao com RHF
const form = useForm<ProductFormData>({
  resolver: zodResolver(productSchema),
})
```

- **Uncontrolled inputs** - performance superior
- **Zod** permite reutilizar schemas entre frontend e backend
- **Type inference** - tipos gerados automaticamente do schema
- **Validacao declarativa** - facil de ler e manter

**Trade-offs:**
- Duas bibliotecas para aprender
- Zod adiciona bundle size

---

## 5. Graficos e Visualizacoes

### Decisao: Recharts

**Alternativas Consideradas:**
| Biblioteca | React Native | Customizacao | Bundle | Curva |
|------------|--------------|--------------|--------|-------|
| **Recharts** | Sim | Boa | ~150KB | Baixa |
| Chart.js | Nao | Boa | ~60KB | Baixa |
| D3.js | Nao | Total | ~80KB | Alta |
| Victory | Sim | Boa | ~100KB | Media |
| Nivo | Nao | Excelente | ~200KB | Media |

**Justificativa:**
- **Componentes React** - API declarativa natural
- **Responsivo** nativo com ResponsiveContainer
- **Customizavel** via props e CSS
- **Integracao shadcn/ui** - ChartTooltip, ChartContainer

**Trade-offs:**
- Bundle maior que Chart.js
- Menos flexivel que D3.js puro
- Alguns tipos de graficos nao disponiveis

### Graficos Implementados:
- BarChart - Pedidos por dia/semana
- AreaChart - Receita ao longo do tempo
- PieChart - Distribuicao por categoria
- LineChart - Tendencias

---

## 6. Cliente HTTP e Data Fetching

### Decisao: Axios + SWR

**Alternativas Consideradas:**
| Solucao | Interceptors | Cache | Retry | Bundle |
|---------|--------------|-------|-------|--------|
| **Axios + SWR** | Sim | SWR | SWR | ~15KB |
| Fetch + React Query | Nao | TQ | TQ | ~20KB |
| Fetch + SWR | Nao | SWR | SWR | ~5KB |
| ky | Limitados | Nao | Sim | ~3KB |

**Justificativa:**

**Axios:**
```typescript
// Interceptor para auto-redirect no 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
```

**SWR:**
```typescript
// Cache automatico, revalidacao, deduplicacao
const { data, error, isLoading, mutate } = useSWR(
  'products',
  () => productsApi.getAll()
)
```

- **Interceptors Axios** - manipulacao global de requests/responses
- **SWR** - cache inteligente, deduplicacao, revalidacao em foco
- **Mutate** - otimistic updates faceis
- **Stale-while-revalidate** - UX superior

**Trade-offs:**
- Duas bibliotecas (poderia ser so fetch + React Query)
- SWR menos features que React Query

---

## 7. Estilizacao

### Decisao: Tailwind CSS 4

**Alternativas Consideradas:**
| Solucao | Performance | DX | Consistencia | Bundle |
|---------|-------------|-----|--------------|--------|
| **Tailwind CSS** | Excelente | Otima | Alta | ~10KB |
| CSS Modules | Boa | Media | Media | Variavel |
| Styled Components | Media | Boa | Alta | ~15KB |
| Emotion | Media | Boa | Alta | ~12KB |
| Vanilla CSS | Excelente | Trabalhosa | Baixa | Variavel |

**Justificativa:**
- **Utility-first** - desenvolvimento rapido
- **Design tokens** via CSS variables
- **PurgeCSS** automatico - bundle minimo
- **Dark mode** com classe `dark`
- **Responsivo** com prefixos (sm:, md:, lg:)

**Trade-offs:**
- Classes longas no JSX
- Curva de aprendizado inicial
- Precisa de extensao VSCode para DX ideal

---

## 8. Padroes de UX

### 8.1 Skeleton Loading

```typescript
// Implementacao
export function CardSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-6 space-y-4 animate-pulse">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-32" />
    </div>
  )
}

// Uso
{isLoading ? <CardsSkeleton count={6} /> : <ProductGrid products={data} />}
```

**Beneficios:**
- Perceived performance melhor
- Layout nao "pula" quando dados carregam
- Usuario sabe que algo esta carregando

### 8.2 Error States

```typescript
export function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div className="text-center py-12">
      <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
      <h3>Erro ao carregar dados</h3>
      <p className="text-muted-foreground">{error}</p>
      <Button onClick={onRetry}>Tentar novamente</Button>
    </div>
  )
}
```

### 8.3 Empty States

```typescript
export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      {icon}
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  )
}
```

### 8.4 Toast Notifications

**Biblioteca:** Sonner (via shadcn/ui)

```typescript
// Sucesso
toast.success('Produto criado com sucesso!')

// Erro
toast.error('Falha ao salvar. Tente novamente.')

// Loading
toast.promise(saveProduct(), {
  loading: 'Salvando...',
  success: 'Salvo!',
  error: 'Erro ao salvar',
})
```

---

## 9. Responsividade e Acessibilidade

### Responsividade

**Breakpoints Tailwind:**
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

**Implementacao:**
```typescript
// Grid responsivo
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">

// Sidebar colapsavel
<aside className={cn(
  "hidden lg:block fixed",
  sidebarCollapsed ? "w-[72px]" : "w-64"
)}>
```

### Acessibilidade

- **Radix UI** como base (shadcn/ui) - ARIA roles automaticos
- **Semantic HTML** - `<main>`, `<nav>`, `<header>`
- **Focus management** - focus-visible, focus-within
- **Screen reader** - sr-only para textos auxiliares
- **Keyboard navigation** - todos componentes interativos acessiveis via teclado

---

## 10. Estrategia de Autenticacao

### Decisao: JWT + Axios Interceptor

**Fluxo:**
1. Usuario faz login com email/senha
2. Backend retorna JWT + refresh token
3. Token armazenado no Zustand (persist em localStorage)
4. Axios interceptor adiciona token em todas requests
5. Interceptor de resposta detecta 401 e redireciona para login

```typescript
// Request interceptor
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
```

### Role-Based UI

```typescript
// Tipos de roles
type UserRole = 'admin' | 'manager' | 'operator' | 'viewer'

// Verificacao de permissao
const canWrite = hasPermission(user.role, 'write')

// Componente condicional
{canWrite && <Button>Criar Produto</Button>}
```

---

## 11. Componentizacao e Reutilizacao

### Componentes Compartilhados (`components/shared/`)

| Componente | Descricao | Props |
|------------|-----------|-------|
| `StatCard` | Card de metrica com icone e variacao | title, value, icon, trend |
| `StatusBadge` | Badge colorido por status | status, type |
| `EmptyState` | Estado vazio com acao | icon, title, action |
| `ErrorState` | Estado de erro com retry | error, onRetry |
| `SkeletonLoader` | Varios skeletons | count, type |

### Hooks Customizados (`hooks/`)

| Hook | Funcao |
|------|--------|
| `useAuth` | Acesso ao estado de autenticacao |
| `useOrders` | CRUD de pedidos com SWR |
| `useProducts` | CRUD de produtos com SWR |
| `useDelivery` | Entregadores e entregas |
| `useReports` | Metricas e relatorios |
| `useWebSocket` | Conexao WebSocket para real-time |

### Stores Zustand (`stores/`)

| Store | Estado |
|-------|--------|
| `auth-store` | user, token, isAuthenticated |
| `orders-store` | orders, filters, pagination |
| `products-store` | products, categories, filters |
| `delivery-store` | deliveryPersons, deliveries |
| `ui-store` | sidebarCollapsed, theme |

---

## 12. Estrutura de Pastas

```
src/
├── app/                    # Next.js App Router
│   ├── (dashboard)/        # Grupo de rotas protegidas
│   │   ├── layout.tsx      # Layout com sidebar
│   │   ├── page.tsx        # Dashboard
│   │   ├── orders/
│   │   ├── products/
│   │   ├── delivery/
│   │   └── reports/
│   ├── login/
│   └── globals.css
├── components/
│   ├── ui/                 # shadcn/ui
│   ├── shared/             # Componentes reutilizaveis
│   ├── layout/             # Sidebar, Header
│   ├── orders/             # Componentes de pedidos
│   ├── products/           # Componentes de produtos
│   ├── delivery/           # Componentes de entregas
│   └── illustrations/      # Ilustracoes SVG
├── hooks/                  # Hooks customizados
├── stores/                 # Zustand stores
├── lib/                    # Utilitarios (api, utils)
├── types/                  # TypeScript types
└── docs/                   # Documentacao
```

**Principios:**
- **Colocation** - componentes perto de onde sao usados
- **Feature-based** - agrupamento por funcionalidade
- **Shared** - componentes reutilizaveis em pasta separada
- **Single responsibility** - cada arquivo uma responsabilidade
