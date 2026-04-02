# 🛠 FastMeals — Guia de Tecnologias

Documento de referência com todas as tecnologias utilizadas no projeto FastMeals, explicando o propósito de cada uma, suas vantagens e desvantagens, e os comandos mais úteis.

---

## 📑 Índice

1. [Runtime & Linguagem](#runtime--linguagem)
2. [Frontend](#frontend)
3. [Backend](#backend)
4. [Banco de Dados & Cache](#banco-de-dados--cache)
5. [Mensageria](#mensageria)
6. [Infraestrutura & Cloud](#infraestrutura--cloud)
7. [CI/CD & Qualidade](#cicd--qualidade)
8. [Observabilidade](#observabilidade)
9. [Testes](#testes)
10. [Ferramentas de Desenvolvimento](#ferramentas-de-desenvolvimento)

---

## Runtime & Linguagem

### Node.js 20 LTS

**O que é:** Runtime JavaScript server-side baseado no V8 engine do Chrome. Permite executar JavaScript fora do navegador.

**Para que usamos:** Runtime de todos os 6 microserviços backend e build tool dos 5 microfrontends.

| Vantagens | Desvantagens |
|-----------|-------------|
| Ecossistema NPM enorme (2M+ pacotes) | Single-threaded (não ideal para CPU-bound) |
| Non-blocking I/O — excelente para APIs | Callback hell (mitigado com async/await) |
| Mesma linguagem no frontend e backend | Tipagem fraca sem TypeScript |
| LTS com suporte de longo prazo | Gerenciamento de memória pode ser desafiador |
| Excelente performance para I/O-bound | Cold start em Lambda (~300ms) |

**Comandos úteis:**

```bash
node --version                    # Verificar versão
node -e "console.log('hello')"   # Executar inline
node --inspect app.js             # Debug mode
```

&nbsp;

---

### TypeScript 5.7

**O que é:** Superset do JavaScript que adiciona tipagem estática, interfaces e tipos genéricos. Compila para JavaScript.

**Para que usamos:** Tipagem estrita em todo o projeto — backend e frontend — com `strict: true` e zero `any`.

| Vantagens | Desvantagens |
|-----------|-------------|
| Detecção de erros em compile time | Curva de aprendizado inicial |
| IntelliSense e autocompletion no IDE | Tempo de compilação adicional |
| Refactoring seguro | Configuração de tsconfig pode ser complexa |
| Interfaces para contratos (Clean Architecture) | Tipagem de libs externas nem sempre completa |
| Documentação embutida nos tipos | Bundle size ligeiramente maior |

**Comandos úteis:**

```bash
npx tsc --noEmit                  # Type check sem compilar
npx tsc --init                    # Gerar tsconfig.json
npx tsc -w                        # Watch mode
```

&nbsp;

---

## Frontend

### Vite 6

**O que é:** Build tool e dev server de próxima geração. Usa ESBuild para transformação e Rollup para bundling.

**Para que usamos:** Build tool de todos os 5 microfrontends (shell + 4 remotes), dev server com HMR instantâneo.

| Vantagens | Desvantagens |
|-----------|-------------|
| Dev server instantâneo (ESBuild) | Ecossistema de plugins menor que Webpack |
| HMR em millisegundos | Algumas libs CJS precisam de otimização |
| Configuração mínima | Module Federation requer plugin externo |
| Build de produção otimizado (Rollup) | Menos maduro que Webpack para enterprise |
| Suporte nativo a TypeScript e JSX | — |

**Comandos úteis:**

```bash
npm run dev                       # Dev server com HMR
npm run build                     # Build de produção
npm run preview                   # Preview do build
npx vite --port 3000              # Dev server em porta específica
```

&nbsp;

---

### React 18

**O que é:** Biblioteca JavaScript para construção de interfaces de usuário baseada em componentes.

**Para que usamos:** UI library em todos os 5 microfrontends. Hooks, Context e Suspense para loading states.

| Vantagens | Desvantagens |
|-----------|-------------|
| Component-based architecture | Apenas view layer (precisa de libs complementares) |
| Virtual DOM eficiente | JSX pode confundir iniciantes |
| Ecossistema maduro e vasto | Re-renders desnecessários se mal otimizado |
| React Hooks simplificam estado | Dual instance crashes com Module Federation |
| Grande comunidade e documentação | — |

**Comandos úteis:**

```bash
npx create-vite my-app --template react-ts    # Criar projeto
npm run dev                                     # Dev server
```

&nbsp;

---

### Module Federation (@originjs/vite-plugin-federation)

**O que é:** Arquitetura que permite carregar módulos de aplicações independentes em runtime. Cada microfrontend é buildado e deployado separadamente.

**Para que usamos:** Compor 5 SPAs independentes (shell host + 4 remotes) que são carregadas em runtime via `remoteEntry.js`.

| Vantagens | Desvantagens |
|-----------|-------------|
| Deploy independente por equipe/domínio | Complexidade de configuração |
| Tecnologias diferentes por remote | Shared dependencies precisam de versão compatível |
| Escalabilidade organizacional | Debug mais difícil (erros em runtime) |
| Cache granular por remote | Latência adicional no carregamento |
| Lazy loading nativo | Problemas com dual React instances |

**Comandos úteis:**

```bash
npm run dev:fed                   # Build com federation plugin
npm run preview                   # Serve o remoteEntry.js
```

&nbsp;

---

### Tailwind CSS 4

**O que é:** Framework CSS utility-first que permite estilizar diretamente no HTML com classes utilitárias.

**Para que usamos:** Estilização de toda a UI. Gerenciado exclusivamente pelo shell via `@source` directives para evitar conflitos entre microfrontends.

| Vantagens | Desvantagens |
|-----------|-------------|
| Desenvolvimento rápido | HTML pode ficar verboso |
| Sem CSS custom (zero conflitos) | Curva de aprendizado das classes |
| Purge automático (bundle mínimo) | Difícil de customizar sem config |
| Dark mode nativo | Sem componentes prontos (precisa de shadcn/ui) |
| Design system consistente | — |

**Comandos úteis:**

```bash
npx tailwindcss init              # Gerar config
npx tailwindcss --watch           # Watch mode
```

&nbsp;

---

### shadcn/ui

**O que é:** Coleção de componentes React acessíveis e customizáveis baseados em Radix UI. Os componentes são copiados para o projeto (não é uma dependência NPM).

**Para que usamos:** Componentes de UI (Button, Dialog, Card, Table, Badge, Select, etc.) em todos os microfrontends.

| Vantagens | Desvantagens |
|-----------|-------------|
| Componentes acessíveis (Radix UI) | Componentes copiados (não atualizáveis automaticamente) |
| Totalmente customizáveis | Precisa instalar em cada microfrontend |
| Sem dependência externa de runtime | Alguns componentes (AvatarImage) conflitam com Module Federation |
| Integração nativa com Tailwind | — |
| TypeScript first | — |

**Comandos úteis:**

```bash
npx shadcn-ui@latest init         # Inicializar no projeto
npx shadcn-ui@latest add button   # Adicionar componente
npx shadcn-ui@latest add dialog   # Adicionar Dialog
```

&nbsp;

---

### Zustand 5

**O que é:** Biblioteca de gerenciamento de estado minimalista para React. Alternativa leve ao Redux.

**Para que usamos:** Estado global de autenticação (auth-store), UI (sidebar state), e estado de dados por remote (orders-store, products-store, delivery-store).

| Vantagens | Desvantagens |
|-----------|-------------|
| API simples (create + hooks) | Sem devtools tão robustas quanto Redux |
| Sem boilerplate | Menos estruturado para apps muito grandes |
| Funciona fora de componentes React | Comunidade menor que Redux |
| Persist middleware (localStorage) | — |
| Compatível com Module Federation | — |

**Comandos úteis:**

```bash
npm install zustand               # Instalar
```

&nbsp;

---

### Recharts 3

**O que é:** Biblioteca de gráficos para React baseada em D3.js. Componentes declarativos para BarChart, LineChart, AreaChart, etc.

**Para que usamos:** Gráficos no dashboard e no remote-reports (receita diária, pedidos por status, top produtos, tempo de entrega).

| Vantagens | Desvantagens |
|-----------|-------------|
| API declarativa (componentes React) | Bundle size considerável (~200KB) |
| Tooltips e legends nativos | Customização avançada é complexa |
| Responsivo por padrão | Performance com muitos data points |
| Animações suaves | Precisa estar no `shared` do Module Federation |

**Comandos úteis:**

```bash
npm install recharts              # Instalar
```

&nbsp;

---

## Backend

### Express 4.21

**O que é:** Framework web minimalista para Node.js. Middleware-based para HTTP handling.

**Para que usamos:** HTTP server de todos os 6 microserviços. Controllers, middlewares de auth, rate limiting e error handling.

| Vantagens | Desvantagens |
|-----------|-------------|
| Leve e minimalista | Sem opinião (precisa estruturar manualmente) |
| Middleware pipeline flexível | Sem TypeScript nativo |
| Ecossistema maduro (10+ anos) | Sem suporte nativo a WebSocket |
| Fácil de aprender | Error handling async requer wrappers |
| Compatível com Lambda (via adapter) | — |

**Comandos úteis:**

```bash
npm install express               # Instalar
npm install @types/express -D     # Tipos TypeScript
```

&nbsp;

---

### Prisma 6.19

**O que é:** ORM (Object-Relational Mapping) de próxima geração para Node.js e TypeScript. Schema-first com geração automática de client tipado.

**Para que usamos:** Acesso ao PostgreSQL em 5 microserviços. Migrations, schema management, queries tipadas e seed data.

| Vantagens | Desvantagens |
|-----------|-------------|
| Schema declarativo (.prisma) | Bundle size grande (~15MB client) |
| Client auto-gerado com tipos | Query engine binário (aumenta Lambda package) |
| Migrations automáticas | Raw SQL mais verboso que ORMs tradicionais |
| Prisma Studio (GUI) | Não suporta todas as features do PostgreSQL |
| Excelente DX com autocomplete | Cold start em Lambda mais lento |

**Comandos úteis:**

```bash
npx prisma generate               # Gerar client tipado
npx prisma migrate dev --name init # Criar migration
npx prisma migrate deploy         # Aplicar migrations (produção)
npx prisma studio                 # GUI para visualizar dados
npx prisma migrate reset          # Reset completo do banco
npx prisma db seed                # Rodar seed
npx prisma format                 # Formatar schema.prisma
```

&nbsp;

---

### Zod 3.24

**O que é:** Biblioteca de validação de schemas TypeScript-first. Valida dados em runtime com inferência de tipos.

**Para que usamos:** Validação de entrada em todos os endpoints (request body, query params) e nos formulários do frontend.

| Vantagens | Desvantagens |
|-----------|-------------|
| TypeScript-first (infere tipos) | Bundle size (~50KB) |
| API fluente e composável | Mensagens de erro padrão em inglês |
| Zero dependências | Menos performante que joi para schemas muito grandes |
| Funciona em browser e Node.js | — |
| Integra com react-hook-form | — |

**Comandos úteis:**

```bash
npm install zod                   # Instalar
```

&nbsp;

---

### Pino 10

**O que é:** Logger JSON de alta performance para Node.js. 5x mais rápido que Winston.

**Para que usamos:** Logs estruturados (JSON) em todos os microserviços. Facilita busca e filtragem no CloudWatch.

| Vantagens | Desvantagens |
|-----------|-------------|
| Altíssima performance | Output JSON não é human-friendly (precisa de pino-pretty) |
| Logs estruturados (JSON) | Menos features que Winston |
| Low overhead | — |
| Integração nativa com CloudWatch | — |

**Comandos úteis:**

```bash
npm install pino                  # Instalar
npm install pino-pretty -D        # Pretty print para dev
```

&nbsp;

---

## Banco de Dados & Cache

### PostgreSQL 16

**O que é:** Banco de dados relacional open-source, robusto e extensível. Suporta JSON, full-text search, window functions e mais.

**Para que usamos:** 5 databases isolados (auth_db, products_db, orders_db, delivery_db, reports_db) rodando em uma instância RDS.

| Vantagens | Desvantagens |
|-----------|-------------|
| ACID compliant | Mais complexo que MySQL para setup |
| JSON e JSONB nativos | Consumo de memória maior |
| Window functions e CTEs | Replicação mais complexa |
| Extensível (PostGIS, pgvector) | — |
| Comunidade ativa e documentação | — |

**Comandos úteis (psql):**

```sql
\l                                -- Listar databases
\dt                               -- Listar tabelas
\d orders                         -- Descrever tabela
\c auth_db                        -- Trocar de database
SELECT COUNT(*) FROM orders;      -- Contar registros
SELECT * FROM orders LIMIT 5;     -- Ver primeiros registros
\q                                -- Sair
```

&nbsp;

---

### Redis 7

**O que é:** Banco de dados in-memory (chave-valor) de alta performance. Suporta strings, hashes, lists, sets e mais.

**Para que usamos:** Token store para JWT refresh tokens no auth-service. Permite revogação instantânea de sessões.

| Vantagens | Desvantagens |
|-----------|-------------|
| Latência sub-millisecond | Dados em memória (limitado por RAM) |
| TTL nativo (expiração automática) | Persistência requer configuração |
| Operações atômicas | Sem queries complexas (SQL) |
| Pub/Sub nativo | — |
| Clustering e replicação | — |

**Comandos úteis (redis-cli):**

```bash
PING                              # Testar conexão
KEYS fastmeals:*                  # Listar chaves
GET fastmeals:refresh_token:123   # Obter valor
TTL fastmeals:refresh_token:123   # Ver tempo de expiração
SET key value EX 3600             # Setar com TTL de 1h
DEL key                           # Deletar chave
DBSIZE                            # Número total de chaves
FLUSHALL                          # Apagar tudo (cuidado!)
```

&nbsp;

---

## Mensageria

### RabbitMQ 3.13

**O que é:** Message broker open-source que implementa o protocolo AMQP. Permite comunicação assíncrona entre serviços.

**Para que usamos:** Comunicação event-driven entre microserviços. O orders-service publica eventos (`order.created`, `order.status.changed`) e o delivery-service consome para atualizar status dos entregadores.

| Vantagens | Desvantagens |
|-----------|-------------|
| Protocolo AMQP robusto | Mais complexo que SQS/SNS |
| Topic exchange (roteamento flexível) | Requer gerenciamento do broker |
| Management UI (porta 15672) | Consumo de memória com muitas filas |
| Dead letter queues | — |
| Confirmação de entrega (ack/nack) | — |

**Comandos úteis:**

```bash
# Management UI
http://localhost:15672             # user: guest / password: guest

# Via rabbitmqctl (dentro do container)
rabbitmqctl list_queues           # Listar filas
rabbitmqctl list_exchanges        # Listar exchanges
rabbitmqctl list_connections      # Listar conexões
```

&nbsp;

---

## Infraestrutura & Cloud

### Terraform 1.7

**O que é:** Ferramenta de Infrastructure as Code (IaC) que permite definir, provisionar e gerenciar infraestrutura em cloud providers de forma declarativa.

**Para que usamos:** Gerenciar toda a infraestrutura AWS do FastMeals — 9 módulos (networking, database, cache, messaging, lambda, api-gateway, frontend, dns, bastion, secrets).

| Vantagens | Desvantagens |
|-----------|-------------|
| Declarativo (desired state) | HCL tem curva de aprendizado |
| Multi-cloud (AWS, GCP, Azure) | State management requer cuidado |
| Plan antes de apply (review) | Drift detection não é automático |
| Módulos reutilizáveis | Destruir recursos pode ser perigoso |
| Estado remoto (S3 + DynamoDB) | — |

**Comandos úteis:**

```bash
terraform init                    # Inicializar (baixar providers)
terraform plan                    # Ver mudanças sem aplicar
terraform apply                   # Aplicar mudanças
terraform destroy                 # Destruir infraestrutura
terraform output                  # Ver outputs
terraform state list              # Listar recursos no state
terraform import <addr> <id>      # Importar recurso existente
terraform fmt                     # Formatar arquivos .tf
terraform validate                # Validar configuração
```

&nbsp;

---

### AWS Lambda

**O que é:** Serviço serverless da AWS que executa código em resposta a eventos sem gerenciar servidores. Paga-se apenas pelo tempo de execução.

**Para que usamos:** 23 funções Lambda (Node.js 20, 256MB) — uma por use case, seguindo o padrão Lambda per Use Case.

| Vantagens | Desvantagens |
|-----------|-------------|
| Zero gerenciamento de servidor | Cold start (~300ms-1.5s) |
| Escala automática | Limite de 262MB (code + layers) |
| Pay-per-use (custo zero em idle) | Timeout máximo 15min |
| Integração nativa com API Gateway | Debug/logging mais complexo |
| VPC access para RDS/Redis | Latência adicional com VPC |

&nbsp;

---

### AWS API Gateway (HTTP)

**O que é:** Serviço gerenciado que cria, publica e gerencia APIs HTTP. Roteia requests para backends (Lambda, HTTP, etc.).

**Para que usamos:** 23 rotas HTTP roteando para as 23 Lambda functions, com CORS configurado e logging habilitado.

| Vantagens | Desvantagens |
|-----------|-------------|
| Gerenciado (zero infra) | Limite de 10MB no payload |
| CORS nativo | Timeout máximo 30s |
| Integração direta com Lambda | Cold start da Lambda soma ao tempo |
| Logging integrado com CloudWatch | Custo por request em alto volume |
| Custom domains com ACM | — |

&nbsp;

---

### AWS Amplify

**O que é:** Plataforma de deploy para aplicações web e mobile. CDN global, SSL automático, deploy via Git.

**Para que usamos:** Deploy dos 5 microfrontends como um app consolidado. Build automático via webhook do GitHub, domínio customizado `fastmeals.com.br`.

| Vantagens | Desvantagens |
|-----------|-------------|
| Deploy automático via Git | Limite de 25 apps por conta |
| CDN global (CloudFront) | Build pode ser lento (~3min) |
| SSL automático (ACM) | Customização limitada do build |
| Custom domains | Preço escala com tráfego |
| Preview branches | — |

&nbsp;

---

### AWS RDS (PostgreSQL)

**O que é:** Serviço de banco de dados relacional gerenciado. Backups automáticos, patches, replicação e failover.

**Para que usamos:** Instância PostgreSQL 16 (db.t3.micro) com 5 databases isolados na subnet privada da VPC.

| Vantagens | Desvantagens |
|-----------|-------------|
| Backups automáticos (7 dias) | Custo contínuo (mesmo idle) |
| Encryption at rest | Acesso apenas via VPC (precisa de Bastion) |
| Multi-AZ para alta disponibilidade | Scaling vertical (precisa resize) |
| Patches automáticos | — |

&nbsp;

---

### AWS Bedrock (Amazon Nova)

**O que é:** Serviço gerenciado da AWS para acessar foundation models (LLMs) via API. Suporta modelos da Amazon, Anthropic, Meta e outros.

**Para que usamos:** AI Insights no reports-service — gera resumo, recomendações e destaques a partir dos dados analíticos usando o modelo Amazon Nova Pro.

| Vantagens | Desvantagens |
|-----------|-------------|
| Modelos gerenciados (sem hosting) | Custo por token |
| API unificada (Converse API) | Quotas podem bloquear acesso |
| Dados não usados para treinamento | Latência variável (2-10s) |
| IAM integrado (sem API keys) | Nem todos os modelos disponíveis em todas as regiões |

&nbsp;

---

### Docker 28

**O que é:** Plataforma de containerização que empacota aplicações e suas dependências em containers isolados.

**Para que usamos:** Orquestração local de 19 containers (7 infra + 6 backend + 5 frontend + 1 gateway) via Docker Compose.

| Vantagens | Desvantagens |
|-----------|-------------|
| Ambiente consistente (dev = prod) | Consumo de recursos (RAM, CPU) |
| Isolamento de serviços | Curva de aprendizado |
| Docker Compose para orquestração | Networking entre containers pode ser complexo |
| Imagens leves (Alpine) | Build inicial demorado |
| Portabilidade total | — |

**Comandos úteis:**

```bash
docker compose up --build -d      # Subir todos os containers
docker compose down               # Parar todos
docker compose down -v            # Parar e remover volumes
docker compose ps                 # Ver containers rodando
docker compose logs service -f    # Ver logs de um serviço
docker exec -it container sh      # Acessar terminal
docker system prune -a            # Limpar tudo não utilizado
```

&nbsp;

---

### Nginx (Alpine)

**O que é:** Web server e reverse proxy de alta performance. Usado como API Gateway e load balancer.

**Para que usamos:** API Gateway local — roteia requests HTTP para os 6 microserviços baseado no path (`/api/auth/*` → auth-service, `/api/products/*` → products-service, etc.).

| Vantagens | Desvantagens |
|-----------|-------------|
| Alta performance (C-based) | Configuração pode ser verbosa |
| Reverse proxy eficiente | Sem service discovery nativo |
| Static file serving | Reload necessário para mudanças |
| SSL termination | — |
| Imagem Alpine (~5MB) | — |

&nbsp;

---

## CI/CD & Qualidade

### GitHub Actions

**O que é:** Plataforma de CI/CD integrada ao GitHub. Workflows definidos em YAML executam em runners gerenciados.

**Para que usamos:** 6 workflows — CI Backend, CI Frontend, SonarCloud, Deploy Lambdas, Deploy Frontend, Terraform.

| Vantagens | Desvantagens |
|-----------|-------------|
| Integrado ao GitHub (zero setup) | Minutos limitados no free tier |
| YAML declarativo | Debug de workflows é lento |
| Matrix strategy (paralelismo) | Secrets management básico |
| Marketplace de actions | Runners compartilhados podem ser lentos |
| Free para repos públicos | — |

**Comandos úteis:**

```bash
# Desabilitar workflow
mv .github/workflows/sonarcloud.yml .github/workflows/sonarcloud.yml.disabled

# Reabilitar
mv .github/workflows/sonarcloud.yml.disabled .github/workflows/sonarcloud.yml
```

&nbsp;

---

### SonarCloud

**O que é:** Plataforma SaaS de análise estática de código. Detecta bugs, vulnerabilidades, code smells e mede cobertura de testes.

**Para que usamos:** Quality Gate no CI — analisa 360 arquivos TypeScript, mede cobertura via lcov e detecta code smells.

| Vantagens | Desvantagens |
|-----------|-------------|
| Análise automática no CI | Quality Gate padrão restritivo (80% coverage) |
| Detecta security hotspots | Customização de gates requer plano pago |
| Mede duplicação de código | Pode ser lento (~1.5min) |
| Integração GitHub (PR decoration) | False positives em código gerado |
| Dashboard visual | — |

&nbsp;

---

## Observabilidade

### Datadog

**O que é:** Plataforma de observabilidade SaaS com monitoramento de infraestrutura, APM, logs e métricas.

**Para que usamos:** Monitoramento das 23 Lambda functions — invocações, duração, cold starts, erros, custo estimado e logs.

| Vantagens | Desvantagens |
|-----------|-------------|
| Dashboard unificado | Custo por host/function |
| Lambda Extension Layer (sem código) | Trial de 14 dias |
| Métricas em tempo real | Node.js tracing layer grande (~30MB) |
| Alertas configuráveis | — |
| Integração Terraform nativa | — |

**Dashboard:** https://us5.datadoghq.com/functions

&nbsp;

---

## Testes

### Vitest 3.x

**O que é:** Framework de testes para Vite. Compatível com a API do Jest mas significativamente mais rápido.

**Para que usamos:** 155+ testes unitários e de integração em todos os 6 microserviços backend. Coverage via `@vitest/coverage-v8` gerando lcov.

| Vantagens | Desvantagens |
|-----------|-------------|
| Rápido (usa Vite transform) | Menos maduro que Jest |
| API compatível com Jest | Ecossistema de plugins menor |
| HMR nos testes (watch mode) | — |
| Coverage v8 nativo | — |
| TypeScript sem configuração extra | — |

**Comandos úteis:**

```bash
npm test -- --run                 # Rodar testes
npx vitest run --coverage         # Com coverage (gera lcov)
npx vitest --watch                # Watch mode
npx vitest --ui                   # UI mode
```

&nbsp;

---

### Playwright

**O que é:** Framework de testes end-to-end da Microsoft. Suporta Chromium, Firefox e WebKit. Auto-wait, screenshots e video recording.

**Para que usamos:** 28 testes E2E validando o fluxo completo da aplicação (login, navegação, todos os microfrontends) contra produção.

| Vantagens | Desvantagens |
|-----------|-------------|
| Multi-browser (Chromium, Firefox, WebKit) | Requer browsers instalados (~500MB) |
| Auto-wait inteligente | Testes mais lentos que unitários |
| Screenshots e video on failure | Seletores precisam ser exatos |
| Codegen (gera testes automaticamente) | Debug pode ser complexo |
| Paralelismo nativo | — |

**Comandos úteis:**

```bash
npx playwright test --reporter=list     # Rodar todos
npx playwright test --headed            # Com browser visível
npx playwright test --ui                # Modo interativo
npx playwright test --debug             # Debug step-by-step
npx playwright codegen                  # Gerar testes gravando ações
npx playwright show-report              # Ver report HTML
npx playwright test --project=smoke     # Rodar projeto específico
```

&nbsp;

---

## Ferramentas de Desenvolvimento

### Git

**O que é:** Sistema de controle de versão distribuído. Permite rastrear mudanças, criar branches e colaborar em equipe.

**Para que usamos:** Versionamento do código em `github.com/vynnydev/fastmeals`, branch `improvements`.

**Comandos úteis:**

```bash
git log --oneline -10             # Últimos 10 commits
git status                        # Ver mudanças
git diff                          # Ver diferenças
git stash                         # Guardar mudanças temporariamente
git stash pop                     # Restaurar mudanças
git reset --hard <hash>           # Voltar para commit (perder mudanças)
git reset --soft HEAD~1           # Desfazer último commit (manter mudanças)
git push --force                  # Push forçado (após reset)
git checkout -b feature/x        # Criar branch
```

&nbsp;

---

### FFmpeg

**O que é:** Ferramenta de linha de comando para processamento de áudio e vídeo. Converte, comprime e manipula mídia.

**Para que usamos:** Converter gravações de tela (.mov) para GIF para incluir no README (demo do Playwright, demo da aplicação).

**Comandos úteis:**

```bash
# Converter vídeo para GIF (boa qualidade)
ffmpeg -i video.mov -vf "fps=15,scale=1280:-1" -loop 0 output.gif

# Converter com menor qualidade (arquivo menor)
ffmpeg -i video.mov -vf "fps=10,scale=960:-1" -loop 0 output.gif

# Cortar vídeo (primeiros 30 segundos)
ffmpeg -i video.mov -t 30 -c copy output.mov

# Comprimir vídeo
ffmpeg -i video.mov -crf 28 output.mp4
```

&nbsp;

---

*Documento gerado em Abril 2026 — FastMeals Project*
