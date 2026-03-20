# FastMeals Frontend - Mapeamento de Funcionalidades e Integrações

Este documento lista todas as funcionalidades do frontend e indica se possuem integração com endpoints do backend.

---

## Legenda

| Símbolo | Significado |
|---------|-------------|
| ✅ | Integração existe no backend |
| ⚠️ | Path diferente no backend (requer ajuste) |
| ❌ | Endpoint NÃO existe no backend |

---

## 1. Autenticação (Login)

| Funcionalidade | Descrição | Endpoint no Frontend | Status | Endpoint no Backend |
|----------------|-----------|---------------------|--------|---------------------|
| Login | Autentica usuário com email e senha | `POST /api/auth/login` | ✅ | `POST /api/auth/login` |
| Logout | Encerra sessão do usuário | `POST /api/auth/logout` | ❌ | Não existe |
| Obter usuário atual | Retorna dados do usuário logado | `GET /api/auth/me` | ❌ | Não existe |
| Refresh token | Atualiza token expirado | Não implementado no frontend | ✅ | `POST /api/auth/refresh-token` |

---

## 2. Dashboard (Overview)

| Funcionalidade | Descrição | Endpoint no Frontend | Status | Endpoint no Backend |
|----------------|-----------|---------------------|--------|---------------------|
| Métricas do dashboard | Total pedidos, receita, pendentes, tempo médio | `GET /api/reports/dashboard` | ❌ | Não existe (deve ser calculado a partir de outros endpoints) |
| Últimos pedidos | Lista os 5 pedidos mais recentes | `GET /api/orders?limit=5&sortBy=createdAt&sortOrder=desc` | ✅ | `GET /api/orders` |

---

## 3. Gestão de Pedidos (Orders)

| Funcionalidade | Descrição | Endpoint no Frontend | Status | Endpoint no Backend |
|----------------|-----------|---------------------|--------|---------------------|
| Listar pedidos | Lista todos os pedidos com filtros e paginação | `GET /api/orders` | ✅ | `GET /api/orders` |
| Detalhes do pedido | Exibe detalhes de um pedido específico | `GET /api/orders/:id` | ✅ | `GET /api/orders/:id` |
| Criar pedido | Cria um novo pedido | `POST /api/orders` | ✅ | `POST /api/orders` |
| Atualizar status | Muda o status do pedido (pending → preparing, etc) | `PATCH /api/orders/:id/status` | ✅ | `PATCH /api/orders/:id/status` |
| Atribuir entregador | Associa um entregador ao pedido | `POST /api/orders/:orderId/assign` | ⚠️ | `PATCH /api/orders/:id/assign` (método diferente) |
| Cancelar pedido | Cancela um pedido com motivo | `POST /api/orders/:id/cancel` | ❌ | Não existe (usar `PATCH /api/orders/:id/status` com status "cancelled") |

---

## 4. Gestão de Produtos (Products)

| Funcionalidade | Descrição | Endpoint no Frontend | Status | Endpoint no Backend |
|----------------|-----------|---------------------|--------|---------------------|
| Listar produtos | Lista todos os produtos com filtros | `GET /api/products` | ✅ | `GET /api/products` |
| Detalhes do produto | Exibe detalhes de um produto específico | `GET /api/products/:id` | ✅ | `GET /api/products/:id` |
| Criar produto | Adiciona um novo produto | `POST /api/products` | ✅ | `POST /api/products` |
| Atualizar produto | Edita dados de um produto | `PUT /api/products/:id` | ✅ | `PUT /api/products/:id` |
| Deletar produto | Remove um produto | `DELETE /api/products/:id` | ✅ | `DELETE /api/products/:id` |
| Toggle disponibilidade | Alterna rapidamente se produto está disponível | `PATCH /api/products/:id/toggle-availability` | ❌ | Não existe (usar `PUT /api/products/:id` com isAvailable) |

---

## 5. Gestão de Entregadores (Delivery Persons)

| Funcionalidade | Descrição | Endpoint no Frontend | Status | Endpoint no Backend |
|----------------|-----------|---------------------|--------|---------------------|
| Listar entregadores | Lista todos os entregadores com filtros | `GET /api/delivery-persons` | ✅ | `GET /api/delivery-persons` |
| Detalhes do entregador | Exibe detalhes de um entregador específico | `GET /api/delivery-persons/:id` | ✅ | `GET /api/delivery-persons/:id` |
| Criar entregador | Adiciona um novo entregador | `POST /api/delivery-persons` | ✅ | `POST /api/delivery-persons` |
| Atualizar entregador | Edita dados de um entregador | `PUT /api/delivery-persons/:id` | ✅ | `PUT /api/delivery-persons/:id` |
| Deletar entregador | Remove um entregador | `DELETE /api/delivery-persons/:id` | ✅ | `DELETE /api/delivery-persons/:id` |
| Atualizar status | Muda status do entregador (ativo/inativo) | `PATCH /api/delivery-persons/:id/status` | ❌ | Não existe (usar `PUT /api/delivery-persons/:id` com isActive) |
| Atualizar localização | Atualiza coordenadas GPS do entregador | `PATCH /api/delivery-persons/:id/location` | ❌ | Não existe (usar `PUT /api/delivery-persons/:id`) |

---

## 6. Otimização de Entregas (Optimization)

| Funcionalidade | Descrição | Endpoint no Frontend | Status | Endpoint no Backend |
|----------------|-----------|---------------------|--------|---------------------|
| Sugerir atribuições | Usa algoritmo Hungarian para sugerir atribuições | `POST /api/optimization/suggest` | ⚠️ | `POST /api/orders/optimize-assignment` (path diferente) |
| Aplicar atribuição | Aplica uma sugestão de atribuição | `POST /api/optimization/apply` | ❌ | Não existe (usar `PATCH /api/orders/:id/assign` + `PATCH /api/orders/:id/status`) |
| Aplicar todas | Aplica todas as sugestões de uma vez | `POST /api/optimization/apply-all` | ❌ | Não existe |

---

## 7. Relatórios (Reports)

| Funcionalidade | Descrição | Endpoint no Frontend | Status | Endpoint no Backend |
|----------------|-----------|---------------------|--------|---------------------|
| Métricas do dashboard | Métricas consolidadas | `GET /api/reports/dashboard` | ❌ | Não existe |
| Resumo geral | Resumo com filtros de data | `GET /api/reports/summary` | ❌ | Não existe |
| Receita por período | Receita diária/semanal/mensal | `GET /api/reports/revenue` | ✅ | `GET /api/reports/revenue` |
| Pedidos por status | Contagem de pedidos agrupados por status | `GET /api/reports/orders-by-status` | ✅ | `GET /api/reports/orders-by-status` |
| Top produtos | Produtos mais vendidos | `GET /api/reports/top-products` | ✅ | `GET /api/reports/top-products` |
| Tempos de entrega | Análise de tempos de entrega | `GET /api/reports/delivery-times` | ⚠️ | `GET /api/reports/average-delivery-time` (nome diferente) |
| AI Insights | Análises e recomendações com IA | `GET /api/reports/ai-insights` | ✅ | `GET /api/reports/ai-insights` |

---

## 8. WebSocket (Tempo Real)

| Funcionalidade | Descrição | Status | Observação |
|----------------|-----------|--------|------------|
| Atualizações de pedidos | Recebe notificações em tempo real sobre mudanças de status | ❌ | Frontend preparado, backend não possui WebSocket |
| Movimentação do Kanban | Cards se movem automaticamente entre colunas | ❌ | Depende do WebSocket acima |

---

## Resumo de Endpoints

### Endpoints que Existem e Estão Alinhados (11)
1. `POST /api/auth/login`
2. `GET /api/orders`
3. `GET /api/orders/:id`
4. `POST /api/orders`
5. `PATCH /api/orders/:id/status`
6. `GET /api/products`
7. `GET /api/products/:id`
8. `POST /api/products`
9. `PUT /api/products/:id`
10. `DELETE /api/products/:id`
11. `GET /api/delivery-persons`
12. `GET /api/delivery-persons/:id`
13. `POST /api/delivery-persons`
14. `PUT /api/delivery-persons/:id`
15. `DELETE /api/delivery-persons/:id`
16. `GET /api/reports/revenue`
17. `GET /api/reports/orders-by-status`
18. `GET /api/reports/top-products`
19. `GET /api/reports/ai-insights`

### Endpoints com Path Diferente (3 - Requer Ajuste no Frontend)
1. `POST /api/optimization/suggest` → Backend usa `POST /api/orders/optimize-assignment`
2. `POST /api/orders/:orderId/assign` → Backend usa `PATCH /api/orders/:id/assign`
3. `GET /api/reports/delivery-times` → Backend usa `GET /api/reports/average-delivery-time`

### Endpoints que NÃO Existem no Backend (10 - Requer Criação)
1. `POST /api/auth/logout`
2. `GET /api/auth/me`
3. `GET /api/reports/dashboard`
4. `GET /api/reports/summary`
5. `POST /api/orders/:id/cancel`
6. `PATCH /api/products/:id/toggle-availability`
7. `PATCH /api/delivery-persons/:id/status`
8. `PATCH /api/delivery-persons/:id/location`
9. `POST /api/optimization/apply`
10. `POST /api/optimization/apply-all`
11. WebSocket para atualizações em tempo real

---

## Recomendações

### Ajustes Rápidos no Frontend (Podem ser feitos agora)
1. Mudar `POST /api/optimization/suggest` para `POST /api/orders/optimize-assignment`
2. Mudar `POST /api/orders/:orderId/assign` para `PATCH /api/orders/:orderId/assign`
3. Mudar `GET /api/reports/delivery-times` para `GET /api/reports/average-delivery-time`
4. Remover chamada de `POST /api/auth/logout` (não é crítico)
5. Usar `PUT /api/products/:id` em vez de `PATCH /api/products/:id/toggle-availability`

### Endpoints Recomendados para Criar no Backend (Prioridade Alta)
1. `GET /api/reports/dashboard` - Consolidar métricas para o dashboard
2. `POST /api/optimization/apply` - Aplicar atribuição sugerida
3. WebSocket - Para atualizações em tempo real do Kanban

### Endpoints Opcionais (Prioridade Baixa)
1. `GET /api/auth/me` - Útil para validar token
2. `PATCH /api/products/:id/toggle-availability` - Conveniência
3. `PATCH /api/delivery-persons/:id/status` - Conveniência
4. `PATCH /api/delivery-persons/:id/location` - Para tracking GPS

---

*Documento gerado em: Março 2026*
*Frontend Version: 1.0.0*
