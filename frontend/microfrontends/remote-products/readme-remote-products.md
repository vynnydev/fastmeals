# 📦 Remote Products — Microfrontend de Produtos

![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)
![React Hook Form](https://img.shields.io/badge/React_Hook_Form-7-EC5990?logo=reacthookform&logoColor=white)
![Module Federation](https://img.shields.io/badge/Module_Federation-Remote-FF6F00?logo=webpack&logoColor=white)

Microfrontend de gestão de produtos com CRUD completo, duas visualizações (Grid e Tabela), filtros por categoria, busca por nome e validação com react-hook-form + zod.

&nbsp;

## Arquitetura

```
src/
├── main.tsx                   → Entry point + Module Federation export
├── pages/
│   └── ProductsPage.tsx       → Página principal exposta via federation
├── components/
│   ├── products/
│   │   ├── ProductsGrid.tsx   → Visualização em grid de cards
│   │   ├── ProductsTable.tsx  → Visualização em tabela
│   │   ├── ProductCard.tsx    → Card individual do produto
│   │   ├── CreateProductDialog.tsx  → Modal de criação
│   │   ├── EditProductDialog.tsx    → Modal de edição
│   │   ├── ProductDetailDialog.tsx  → Modal de detalhes
│   │   └── DeleteProductDialog.tsx  → Confirmação de exclusão
│   ├── shared/
│   │   ├── skeleton-loader.tsx
│   │   └── empty-state.tsx
│   └── ui/                    → shadcn/ui components
├── stores/
│   └── products-store.ts      → Zustand: CRUD, filtros, paginação
├── hooks/
│   └── use-products.ts        → Hook com API calls e estado
├── lib/
│   ├── api.ts                 → Axios instance com interceptors
│   └── utils.ts               → Helpers
└── types/
    └── index.ts               → Product, Category types
```

&nbsp;

## Componente Exposto

```typescript
// vite.config.ts — Module Federation
federation({
  name: 'remoteProducts',
  filename: 'remoteEntry.js',
  exposes: {
    './ProductsPage': './src/pages/ProductsPage.tsx',
  },
})
```

&nbsp;

## Funcionalidades

| Feature | Descrição |
|---------|-----------|
| **Duas visualizações** | Grid de cards e Tabela — toggle via botões |
| **Filtro por categoria** | Refeições, Bebidas, Sobremesas, Acompanhamentos |
| **Busca por nome** | Input com debounce |
| **CRUD completo** | Criar, visualizar, editar e excluir produtos |
| **Validação** | react-hook-form + zod com feedback visual |
| **Confirmação de delete** | AlertDialog antes de excluir |
| **Permissões** | Viewer vê apenas leitura — sem botões de CRUD |

&nbsp;

## Categorias

| Categoria | Enum | Exemplos |
|-----------|------|----------|
| Refeições | `meal` | X-Burger, Pizza Margherita |
| Bebidas | `drink` | Suco de Laranja, Refrigerante |
| Sobremesas | `dessert` | Pudim, Brownie |
| Acompanhamentos | `side` | Batata Frita, Coxinha |

&nbsp;

## API Endpoints Consumidos

| Método | Rota | Uso |
|--------|------|-----|
| GET | `/api/products` | Listar produtos (paginação, busca, filtro) |
| GET | `/api/products/:id` | Detalhes do produto |
| POST | `/api/products` | Criar produto |
| PUT | `/api/products/:id` | Atualizar produto |
| DELETE | `/api/products/:id` | Remover produto |

&nbsp;

## Porta

| Ambiente | Porta |
|----------|-------|
| Desenvolvimento | `5002` |
| Produção | Consolidado no Amplify (shell) |

&nbsp;

## Rodar localmente

```bash
npm install
npm run dev:fed    # Build com federation
npm run preview    # Serve na porta 5002
```
