# FastMeals - Sistema de Gerenciamento de Pedidos e Entregas

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
![Lucide](https://img.shields.io/badge/Lucide_React-latest-F56565?style=for-the-badge&logo=lucide&logoColor=white)
![Sonner](https://img.shields.io/badge/Sonner-latest-000000?style=for-the-badge&logo=react&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)

---

## Indice

- [Descricao do Projeto](#descricao-do-projeto)
- [Telas do Sistema](#telas-do-sistema)
- [Arquitetura de Pastas](#arquitetura-de-pastas)
- [Como Rodar Localmente](#como-rodar-localmente)
- [Variaveis de Ambiente](#variaveis-de-ambiente)
- [Docker](#docker)
- [Componentes Reutilizaveis](#componentes-reutilizaveis)
- [Hooks Customizados](#hooks-customizados)
- [Stores Zustand](#stores-zustand)
- [Integracao com API](#integracao-com-api)
- [Padroes de UX](#padroes-de-ux)
- [Documentacao Adicional](#documentacao-adicional)

---

## Descricao do Projeto

**FastMeals** e um sistema completo de gerenciamento de pedidos e entregas para restaurantes e servicos de delivery. O frontend foi desenvolvido para integrar com 6 microservicos:

- **Auth Service** - Autenticacao e autorizacao
- **Products Service** - Catalogo de produtos
- **Orders Service** - Gestao de pedidos
- **Delivery Service** - Gerenciamento de entregadores
- **Optimization Service** - Algoritmo Hungarian para atribuicao otimizada
- **Reports Service** - Analytics e relatorios

### Funcionalidades Principais

- Dashboard analitico com metricas em tempo real
- Gestao de pedidos com visualizacao em tabela e Kanban
- Catalogo de produtos com CRUD completo
- Gerenciamento de entregadores com status em tempo real
- Otimizacao de rotas com fluxograma visual
- Relatorios avancados com graficos e insights
- Autenticacao JWT com controle de acesso por role
- Atualizacoes em tempo real via WebSocket

---

## Telas do Sistema

### 1. Login

**Rota:** `/login`

Tela de autenticacao com design dark mode elegante. Inclui:
- Formulario de login com validacao Zod
- Opcao "Lembrar-me"
- Mensagens de erro contextuais
- Fundo decorativo com gradientes

**Campos:**
- Email (validacao de formato)
- Senha (minimo 6 caracteres)

---

### 2. Dashboard

**Rota:** `/` ou `/dashboard`

Visao geral do sistema com metricas principais:

**Stat Cards:**
- Total de Pedidos (com variacao percentual)
- Receita Total (formatada em BRL)
- Pedidos Pendentes
- Tempo Medio de Entrega

**Graficos:**
- Pedidos por Dia (BarChart)
- Receita ao Longo do Tempo (AreaChart)
- Distribuicao por Categoria (PieChart)

**Outros Elementos:**
- Calendario de Atividades (heatmap)
- Lista de Pedidos Recentes
- Entregadores Ativos

---

### 3. Pedidos (Orders)

**Rota:** `/orders`

Gerenciamento completo de pedidos com duas visualizacoes:

**Visualizacao em Tabela:**
- Ordenacao por coluna
- Filtros por status, data, cliente
- Paginacao
- Acoes rapidas (ver detalhes, atualizar status, cancelar)

**Visualizacao em Kanban:**
- Colunas por status: Pendente, Confirmado, Preparando, Pronto, Em Entrega, Entregue
- Drag-and-drop para mover pedidos
- Atualizacao em tempo real via WebSocket

**Modal de Detalhes:**
- Informacoes do cliente
- Itens do pedido
- Endereco de entrega
- Historico de status
- Acoes disponiveis

---

### 4. Produtos (Products)

**Rota:** `/products`

Catalogo de produtos com CRUD completo:

**Visualizacao em Grid:**
- Cards com imagem, nome, preco, categoria
- Badge de disponibilidade
- Indicador de estoque baixo
- Acoes rapidas (editar, excluir, toggle disponibilidade)

**Visualizacao em Tabela:**
- Todas as informacoes em formato tabular
- Ordenacao e filtros

**Modal de Criacao/Edicao:**
- Formulario com validacao Zod
- Upload de imagem
- Categorias: Refeicao, Bebida, Sobremesa, Lanche
- Tempo de preparo
- Controle de estoque

---

### 5. Entregadores (Delivery)

**Rota:** `/delivery`

Gestao de entregadores e entregas:

**Cards de Entregadores:**
- Foto, nome, avaliacao
- Status atual (disponivel, em entrega, offline)
- Tipo de veiculo
- Entregas ativas

**Kanban de Entregas:**
- Colunas: Pendente, Atribuido, Coletado, Em Transito, Entregue
- Cards com informacoes do pedido e entregador
- Atualizacao automatica via WebSocket

**Acoes:**
- Atribuir entrega manualmente
- Alterar status do entregador
- Ver historico de entregas

---

### 6. Otimizacao (Optimization)

**Rota:** `/delivery` (aba Otimizacao)

Fluxograma visual do algoritmo de otimizacao:

**Visualizacao do Fluxo:**
- Entrada: Pedidos pendentes
- Processamento: Coleta de dados
- Matriz de custos
- Algoritmo Hungarian
- Atribuicoes otimizadas
- Saida: Pedidos atribuidos

**Execucao:**
- Botao para executar otimizacao
- Animacao do fluxo durante processamento
- Resultados com economia estimada

---

### 7. Relatorios (Reports)

**Rota:** `/reports`

Analytics avancados com multiplas abas:

**Aba Visao Geral:**
- Metricas consolidadas
- Comparativo semanal/mensal
- Top produtos mais vendidos

**Aba Vendas:**
- Grafico de receita (AreaChart)
- Vendas por periodo
- Ticket medio

**Aba Entregas:**
- Tempo medio de entrega
- Taxa de sucesso
- Entregas por entregador

**Aba Logistica:**
- Ilustracao do fluxo logistico
- Metricas de eficiencia
- Veiculos e armazem

**Aba AI Insights:**
- Analise automatica de dados
- Recomendacoes de melhoria
- Previsoes de demanda

---

## Arquitetura de Pastas

```
fastmeals-frontend/
├── app/                          # Next.js App Router
│   ├── (dashboard)/              # Grupo de rotas autenticadas
│   │   ├── layout.tsx            # Layout com sidebar
│   │   ├── page.tsx              # Dashboard principal
│   │   ├── orders/
│   │   │   └── page.tsx          # Gestao de pedidos
│   │   ├── products/
│   │   │   └── page.tsx          # Catalogo de produtos
│   │   ├── delivery/
│   │   │   └── page.tsx          # Entregadores e otimizacao
│   │   └── reports/
│   │       └── page.tsx          # Relatorios e analytics
│   ├── login/
│   │   └── page.tsx              # Tela de login
│   ├── api/
│   │   └── health/
│   │       └── route.ts          # Health check endpoint
│   ├── layout.tsx                # Layout raiz
│   └── globals.css               # Estilos globais + tema
│
├── components/
│   ├── ui/                       # Componentes shadcn/ui
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── table.tsx
│   │   ├── tabs.tsx
│   │   └── ...
│   ├── shared/                   # Componentes reutilizaveis
│   │   ├── stat-card.tsx
│   │   ├── status-badge.tsx
│   │   ├── empty-state.tsx
│   │   ├── error-state.tsx
│   │   └── skeleton-loader.tsx
│   ├── layout/                   # Componentes de layout
│   │   ├── app-sidebar.tsx
│   │   └── header.tsx
│   ├── orders/                   # Componentes de pedidos
│   │   ├── order-card.tsx
│   │   ├── order-table.tsx
│   │   ├── order-kanban.tsx
│   │   └── order-detail-modal.tsx
│   ├── products/                 # Componentes de produtos
│   │   ├── product-card.tsx
│   │   ├── product-table.tsx
│   │   └── product-form-modal.tsx
│   ├── delivery/                 # Componentes de entregas
│   │   ├── delivery-card.tsx
│   │   ├── delivery-kanban.tsx
│   │   └── optimization-flow.tsx
│   └── illustrations/            # Ilustracoes SVG
│       └── logistics-illustration.tsx
│
├── hooks/                        # Hooks customizados
│   ├── use-auth.ts
│   ├── use-orders.ts
│   ├── use-products.ts
│   ├── use-delivery.ts
│   ├── use-reports.ts
│   └── use-websocket.ts
│
├── stores/                       # Zustand stores
│   ├── auth-store.ts
│   ├── orders-store.ts
│   ├── products-store.ts
│   ├── delivery-store.ts
│   └── ui-store.ts
│
├── lib/                          # Utilitarios
│   ├── api.ts                    # Cliente Axios + endpoints
│   ├── websocket.ts              # Cliente WebSocket
│   └── utils.ts                  # Funcoes utilitarias
│
├── types/                        # Tipos TypeScript
│   └── index.ts                  # Todos os tipos do sistema
│
├── docs/                         # Documentacao
│   ├── DECISIONS.md              # Decisoes arquiteturais
│   └── FRONTEND_INTEGRATIONS.md  # Mapeamento de endpoints
│
├── public/                       # Assets estaticos
├── Dockerfile                    # Build de producao
├── docker-compose.yml            # Orquestracao
└── package.json
```

---

## Como Rodar Localmente

### Pre-requisitos

- Node.js 20+
- pnpm 8+ (ou npm/yarn)
- Backend dos microservicos rodando

### Instalacao

```bash
# Clone o repositorio
git clone https://github.com/seu-usuario/fastmeals-frontend.git
cd fastmeals-frontend

# Instale as dependencias
pnpm install

# Configure as variaveis de ambiente
cp .env.example .env.local

# Rode em desenvolvimento
pnpm dev
```

### Scripts Disponiveis

```bash
pnpm dev          # Desenvolvimento com hot reload
pnpm build        # Build de producao
pnpm start        # Rodar build de producao
pnpm lint         # Verificar codigo com ESLint
pnpm type-check   # Verificar tipos TypeScript
```

---

## Variaveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# URL base da API (Gateway Nginx)
NEXT_PUBLIC_API_URL=http://localhost:80

# URL do WebSocket (opcional)
NEXT_PUBLIC_WS_URL=ws://localhost:80/ws

# Ambiente
NODE_ENV=development
```

### Variaveis em Producao

```env
NEXT_PUBLIC_API_URL=https://api.fastmeals.com.br
NEXT_PUBLIC_WS_URL=wss://api.fastmeals.com.br/ws
NODE_ENV=production
```

---

## Docker

### Build e Execucao

```bash
# Build da imagem
docker build -t fastmeals-frontend .

# Rodar container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://api:80 \
  fastmeals-frontend
```

### Docker Compose

```bash
# Producao
docker-compose up fastmeals-frontend

# Desenvolvimento com hot reload
docker-compose --profile dev up fastmeals-frontend-dev
```

### Integracao com Backend

```yaml
# docker-compose.yml do projeto completo
services:
  frontend:
    image: fastmeals-frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://nginx:80
    depends_on:
      - nginx
    networks:
      - fastmeals-network
```

---

## Componentes Reutilizaveis

### StatCard

Card para exibir metricas com icone e variacao percentual.

```tsx
<StatCard
  title="Total de Pedidos"
  value={1234}
  icon={<ShoppingBag />}
  trend={{ value: 12.5, isPositive: true }}
  variant="primary"
/>
```

**Props:**
| Prop | Tipo | Descricao |
|------|------|-----------|
| title | string | Titulo da metrica |
| value | string \| number | Valor principal |
| icon | ReactNode | Icone Lucide |
| trend | object | Variacao percentual |
| variant | 'default' \| 'primary' \| 'success' \| 'warning' | Estilo visual |

---

### StatusBadge

Badge colorido baseado no status.

```tsx
<StatusBadge status="delivered" type="order" />
<StatusBadge status="available" type="delivery" />
```

**Props:**
| Prop | Tipo | Descricao |
|------|------|-----------|
| status | string | Status do item |
| type | 'order' \| 'delivery' \| 'product' | Tipo para cores |

---

### EmptyState

Estado vazio com icone, titulo e acao.

```tsx
<EmptyState
  icon={<Package className="h-12 w-12" />}
  title="Nenhum produto encontrado"
  description="Adicione seu primeiro produto ao catalogo"
  action={<Button>Adicionar Produto</Button>}
/>
```

---

### ErrorState

Estado de erro com opcao de retry.

```tsx
<ErrorState
  error="Falha ao carregar dados"
  onRetry={() => refetch()}
/>
```

---

### SkeletonLoader

Varios tipos de skeleton para loading states.

```tsx
<TableSkeleton rows={5} />
<CardsSkeleton count={6} />
<StatCardSkeleton />
```

---

## Hooks Customizados

### useAuth

Acesso ao estado de autenticacao.

```tsx
const { user, isAuthenticated, login, logout, hasPermission } = useAuth()

// Verificar permissao
if (hasPermission('write')) {
  // Pode criar/editar
}
```

---

### useOrders

CRUD de pedidos com cache SWR.

```tsx
const { data: orders, isLoading, error, mutate } = useOrders({
  status: 'pending',
  page: 1,
  limit: 10,
})
```

---

### useProducts

CRUD de produtos com cache SWR.

```tsx
const { data: products, isLoading, createProduct, updateProduct, deleteProduct } = useProducts()

// Criar produto
await createProduct({ name: 'Pizza', price: 45.90, category: 'meal' })
```

---

### useDelivery

Dados de entregadores e entregas.

```tsx
const { data, isLoading, error, mutate } = useDelivery()

// data.deliveryPersons - lista de entregadores
// data.deliveries - lista de entregas
```

---

### useReports

Metricas e relatorios consolidados.

```tsx
const { data, isLoading } = useReports()

// data.metrics - metricas do dashboard
// data.summary - resumo de relatorios
```

---

### useWebSocket

Conexao WebSocket para atualizacoes em tempo real.

```tsx
const { isConnected } = useWebSocket({
  enabled: true,
  onMessage: (event, data) => {
    if (event === 'order_updated') {
      // Atualizar lista de pedidos
      mutateOrders()
    }
  },
})
```

---

## Stores Zustand

### auth-store

```typescript
interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (data: LoginRequest) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => void
}
```

### orders-store

```typescript
interface OrdersState {
  orders: Order[]
  filters: OrderFilters
  pagination: PaginationState
  isLoading: boolean
  fetchOrders: () => Promise<void>
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<void>
  setFilters: (filters: Partial<OrderFilters>) => void
}
```

### products-store

```typescript
interface ProductsState {
  products: Product[]
  filters: ProductFilters
  isLoading: boolean
  fetchProducts: () => Promise<void>
  createProduct: (data: ProductCreateRequest) => Promise<void>
  updateProduct: (id: string, data: ProductUpdateRequest) => Promise<void>
  deleteProduct: (id: string) => Promise<void>
}
```

### delivery-store

```typescript
interface DeliveryState {
  deliveryPersons: DeliveryPerson[]
  filters: DeliveryFilters
  isLoading: boolean
  fetchDeliveryPersons: () => Promise<void>
  updateStatus: (id: string, status: DeliveryPersonStatus) => Promise<void>
}
```

### ui-store

```typescript
interface UIState {
  sidebarCollapsed: boolean
  theme: 'light' | 'dark'
  toggleSidebar: () => void
  setTheme: (theme: 'light' | 'dark') => void
}
```

---

## Integracao com API

### Endpoints Consumidos

Ver documentacao completa em [`docs/FRONTEND_INTEGRATIONS.md`](docs/FRONTEND_INTEGRATIONS.md)

#### Autenticacao
| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| POST | /api/auth/login | Login |
| POST | /api/auth/logout | Logout |
| GET | /api/auth/me | Usuario atual |

#### Produtos
| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| GET | /api/products | Listar produtos |
| GET | /api/products/:id | Buscar produto |
| POST | /api/products | Criar produto |
| PUT | /api/products/:id | Atualizar produto |
| DELETE | /api/products/:id | Deletar produto |

#### Pedidos
| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| GET | /api/orders | Listar pedidos |
| GET | /api/orders/:id | Buscar pedido |
| POST | /api/orders | Criar pedido |
| PATCH | /api/orders/:id/status | Atualizar status |

#### Entregadores
| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| GET | /api/delivery-persons | Listar entregadores |
| GET | /api/delivery-persons/:id | Buscar entregador |
| POST | /api/delivery-persons | Criar entregador |
| PUT | /api/delivery-persons/:id | Atualizar entregador |

#### Otimizacao
| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| POST | /api/orders/optimize-assignment | Executar otimizacao |

---

## Padroes de UX

### Loading States

Todos os componentes de dados implementam skeleton loading:

```tsx
{isLoading ? <TableSkeleton rows={10} /> : <OrdersTable data={orders} />}
```

### Error Handling

Erros sao tratados com componente ErrorState e toasts:

```tsx
{error && <ErrorState error={error} onRetry={refetch} />}
```

### Empty States

Estados vazios com mensagem contextual e acao:

```tsx
{data.length === 0 && (
  <EmptyState
    icon={<Package />}
    title="Nenhum pedido encontrado"
    action={<Button>Criar Pedido</Button>}
  />
)}
```

### Toast Notifications

Feedback visual para acoes do usuario:

```tsx
toast.success('Produto criado com sucesso!')
toast.error('Falha ao salvar. Tente novamente.')
```

---

## Documentacao Adicional

- [Decisoes Arquiteturais](docs/DECISIONS.md) - Por que cada tecnologia foi escolhida
- [Integracao Frontend](docs/FRONTEND_INTEGRATIONS.md) - Mapeamento completo de endpoints
- [shadcn/ui Components](https://ui.shadcn.com) - Documentacao dos componentes base

---

## Licenca

MIT License - Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

Desenvolvido com Next.js 15, React 19 e muito cafe.
