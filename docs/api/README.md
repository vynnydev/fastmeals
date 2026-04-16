# 📖 Unified API Documentation

Documentação unificada de todos os 6 microserviços da FastMeals usando **Redoc** (API reference clássica, usada por Docker, Stripe, AWS, GitHub).

## 🌐 Online

Acesse em: **https://vynnydev.github.io/fastmeals/**

## 🛠️ Como gerar localmente

### 1. Instalar dependência

```bash
npm install --save-dev js-yaml
```

### 2. Gerar o OpenAPI unificado

```bash
node scripts/generate-unified-api-docs.js
```

Isso vai criar:
- `docs/api/openapi.yaml` — OpenAPI 3.0 em YAML
- `docs/api/openapi.json` — Mesma coisa em JSON

### 3. Ver localmente no browser

```bash
npx serve docs/api
```

Acesse `http://localhost:3000` para ver a documentação.

## 📦 O que está incluído

| Serviço | Tag | Endpoints |
|---------|-----|-----------|
| auth-service | 🔐 Authentication | Login, Refresh Token |
| products-service | 📦 Products | CRUD completo |
| orders-service | 📋 Orders | CRUD + state machine + assignment |
| delivery-service | 🚴 Delivery | CRUD entregadores |
| optimization-service | 🧠 Optimization | Hungarian algorithm |
| reports-service | 📊 Reports | Revenue, orders, top products, AI insights |

## 🎨 Tecnologia

- **[Redoc](https://redocly.com/redoc/)** — API reference clássica (usada por Docker, Stripe, AWS, GitHub)
- **GitHub Pages** — Hospedagem gratuita
- **GitHub Actions** — Deploy automático a cada push

## 🎨 Customização

O tema do Redoc foi customizado no `index.html`:

- Cor primária: `#FF6B35` (laranja FastMeals)
- Fontes: Montserrat (headings) + Roboto (texto)
- Painel direito em dark mode com exemplos de código
- Sidebar de 300px com listagem de endpoints

## 📁 Estrutura

```
docs/api/
├── index.html        # Página Redoc (committar)
├── openapi.yaml      # Spec unificado em YAML (gerado)
├── openapi.json      # Spec unificado em JSON (gerado)
└── README.md         # Este arquivo

scripts/
└── generate-unified-api-docs.js  # Script de merge
```