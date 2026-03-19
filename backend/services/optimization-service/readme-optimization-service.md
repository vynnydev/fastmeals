# 🧠 Optimization Service

![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)
![Algorithm](https://img.shields.io/badge/Algorithm-Hungarian_O(n³)-purple)
![Haversine](https://img.shields.io/badge/Distance-Haversine-blue)

Microserviço de otimização de atribuição de entregadores usando algoritmo Hungarian (Kuhn-Munkres) com fórmula de Haversine para distância geodésica. **Stateless — sem banco de dados.**

## Endpoints

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| POST | `/api/orders/optimize-assignment` | Executar otimização | Admin |
| GET | `/health` | Health check | Público |

## Response Format

```json
{
  "assignments": [
    {
      "orderId": "uuid",
      "deliveryPersonId": "uuid",
      "estimatedDistanceKm": 2.83,
      "orderAddress": "Rua das Flores, 123",
      "deliveryPersonName": "Carlos Santos"
    }
  ],
  "unassigned": [
    {
      "orderId": "uuid",
      "orderAddress": "Rua B, 456",
      "reason": "No available delivery person"
    }
  ],
  "totalDistanceKm": 5.51,
  "algorithm": "hungarian",
  "executionTimeMs": 87
}
```

## Algoritmos

### Haversine — O(1)

Calcula a distância geodésica (curvatura da Terra) entre dois pontos dados em latitude/longitude. Resultado em quilômetros com 2 casas decimais.

```
a = sin²((lat2 - lat1) / 2) + cos(lat1) · cos(lat2) · sin²((lon2 - lon1) / 2)
c = 2 · atan2(√a, √(1-a))
d = R · c   (R = 6371 km)
```

### Hungarian (Kuhn-Munkres) — O(n³)

Resolve o problema de atribuição: dado N entregadores e M pedidos, encontra a atribuição que **minimiza a distância total**.

```
         Pedido 1    Pedido 2
Pessoa A:  1 km        2 km
Pessoa B:  3 km       10 km

Greedy:    A→1 (1km) + B→2 (10km) = 11 km
Hungarian: A→2 (2km) + B→1 (3km)  =  5 km  ← 54% melhor
```

Lida com matrizes retangulares: se há mais pedidos que entregadores, os excedentes vão para `unassigned`.

### Performance

- Spec exige: < 2 segundos para 50 pedidos × 30 entregadores
- Resultado real: **87ms** (30×50 matrix)

## Fluxo de Execução

```
1. Busca pedidos com status 'ready' → orders-service (HTTP)
2. Busca entregadores disponíveis → delivery-service (HTTP)
3. Monta matriz de distâncias (Haversine)
4. Executa Hungarian Algorithm
5. Retorna assignments + unassigned + métricas
```

## Variáveis de Ambiente

```env
NODE_ENV=development
PORT=3005
JWT_ACCESS_SECRET=dev-access-secret-fastmeals-2026
ORDERS_SERVICE_URL=http://localhost:3003
DELIVERY_SERVICE_URL=http://localhost:3004
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
CORS_ORIGIN=http://localhost:3000
```

## Rodar localmente

```bash
# Sem banco — serviço stateless
cp .env.example .env
npm install
npm test    # 29 testes
npm run dev
```

## Testes: 29

- Haversine: distância zero, SP interno, SP→RJ, simetria, equador, antimeridiano
- Hungarian: vazio, 1×1, 2×2, 3×3, retangular, greedy vs optimal, idênticos, zeros
- Performance: 30×50 matrix em < 2 segundos
- Use case: sem orders, sem persons, mais orders que persons, vice-versa
- Integration: HTTP 200, 403, 401, unassigned orders
