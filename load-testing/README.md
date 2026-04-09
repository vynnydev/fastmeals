# ⚡ Load Testing — k6

Testes de carga na API de produção (AWS Lambda + API Gateway) usando [k6](https://k6.io/) da Grafana Labs.

## Instalação

### macOS

```bash
brew install k6
```

### Linux (Ubuntu/Debian)

```bash
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

### Windows

```bash
choco install k6
# ou
winget install k6 --source winget
```

### Docker (sem instalação)

```bash
docker run --rm -v $(pwd):/scripts grafana/k6 run /scripts/load-testing/k6-smoke.js
```

## Uso

### Quick Smoke Test (1 request por endpoint)

```bash
k6 run load-testing/k6-smoke.js
```

Valida que todos os endpoints estão respondendo. Executa 1 iteração com 1 usuário.

### Full Load Test (smoke → load → stress)

```bash
k6 run load-testing/k6-load-test.js
```

Executa 3 cenários sequenciais:

| Cenário | VUs | Duração | O que testa |
|---------|-----|---------|-------------|
| **Smoke** | 1 | 30s | Validação básica, todos os endpoints |
| **Load** | 0→5→10→0 | 2m | Tráfego normal, padrão de uso real |
| **Stress** | 0→20→50→0 | 2m | Alta carga, limites do sistema |

### Com URL customizada

```bash
# Ambiente local
k6 run -e BASE_URL=http://localhost load-testing/k6-load-test.js

# Produção (default)
k6 run -e BASE_URL=https://t2fwiydcrc.execute-api.us-east-1.amazonaws.com load-testing/k6-load-test.js
```

### Gerar report JSON

```bash
k6 run --out json=load-testing/results/raw.json load-testing/k6-load-test.js
```

O script também gera automaticamente `load-testing/results/summary.json` com métricas formatadas.

## Métricas Coletadas

| Métrica | Descrição |
|---------|-----------|
| `http_req_duration` | Latência total (avg, P50, P95, P99) |
| `http_req_failed` | Taxa de erros HTTP |
| `login_duration` | Latência do endpoint de login |
| `list_products_duration` | Latência de GET /api/products |
| `list_orders_duration` | Latência de GET /api/orders |
| `optimize_duration` | Latência de POST /api/orders/optimize-assignment |
| `reports_duration` | Latência dos endpoints de reports |

## Thresholds

| Métrica | Limite | Descrição |
|---------|--------|-----------|
| `http_req_duration` | P95 < 3000ms | 95% dos requests devem completar em menos de 3s |
| `http_req_failed` | < 5% | Taxa de erros deve ser menor que 5% |
| `errors` | < 5% | Taxa de erros custom deve ser menor que 5% |

## Endpoints Testados

| Método | Endpoint | Serviço |
|--------|----------|---------|
| POST | `/api/auth/login` | auth-service |
| GET | `/api/products` | products-service |
| GET | `/api/orders` | orders-service |
| GET | `/api/delivery-persons` | delivery-service |
| POST | `/api/orders/optimize-assignment` | optimization-service |
| GET | `/api/reports/revenue` | reports-service |
| GET | `/api/reports/orders-by-status` | reports-service |
| GET | `/api/reports/top-products` | reports-service |

## Estrutura

```
load-testing/
├── README.md              # Este arquivo
├── k6-smoke.js            # Quick smoke test (1 iteração)
├── k6-load-test.js        # Full test (smoke → load → stress)
└── results/               # Reports gerados (gitignored)
    └── summary.json       # Métricas formatadas
```