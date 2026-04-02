# 📖 FastMeals — Referência de Comandos

Documento de referência com todos os comandos utilizados no projeto FastMeals, organizados por ferramenta e contexto.

---

## 📑 Índice

1. [AWS — Geral](#aws--geral)
2. [AWS — Bedrock](#aws--bedrock)
3. [AWS — Amplify](#aws--amplify)
4. [AWS — Lambda](#aws--lambda)
5. [AWS — RDS e Bastion Host](#aws--rds-e-bastion-host)
6. [AWS — Redis (ElastiCache)](#aws--redis-elasticache)
7. [AWS — CloudWatch Logs](#aws--cloudwatch-logs)
8. [Terraform](#terraform)
9. [Docker](#docker)
10. [Git](#git)
11. [Node.js e NPM](#nodejs-e-npm)
12. [Vitest — Testes Backend](#vitest--testes-backend)
13. [Playwright — Testes E2E](#playwright--testes-e2e)
14. [SonarCloud](#sonarcloud)
15. [Prisma ORM](#prisma-orm)
16. [FFmpeg](#ffmpeg)
17. [macOS](#macos)

---

## AWS — Geral

### Verificar identidade da conta AWS

Confirma qual conta e usuário IAM está sendo utilizado no CLI.

```bash
aws sts get-caller-identity
```

### Listar regiões disponíveis

```bash
aws ec2 describe-regions --query "Regions[].RegionName" --output table
```

---

## AWS — Bedrock

### Listar modelos Amazon Nova disponíveis

Lista todos os modelos Nova do catálogo Bedrock com seu status (ACTIVE/LEGACY).

```bash
aws bedrock list-foundation-models \
  --region us-east-1 \
  --query "modelSummaries[?contains(modelId,'nova')].{Model:modelId,Status:modelLifecycle.status}" \
  --output table
```

### Testar acesso ao modelo Bedrock

Testa se a conta tem permissão de on-demand inference no modelo Amazon Nova Pro.

```bash
aws bedrock-runtime invoke-model \
  --model-id amazon.nova-pro-v1:0 \
  --region us-east-1 \
  --content-type application/json \
  --accept application/json \
  --body '{"messages":[{"role":"user","content":[{"text":"Hello"}]}]}' \
  /tmp/bedrock-test.json 2>&1 && cat /tmp/bedrock-test.json | head -5
```

> Se retornar "Operation not allowed", a conta precisa de habilitação de model access via AWS Support.

---

## AWS — Amplify

### Verificar quota de apps do Amplify

Verifica quantos apps Amplify a conta pode criar (padrão: 25).

```bash
aws service-quotas get-service-quota \
  --service-code amplify \
  --quota-code L-1BED97F3 \
  --region us-east-1 \
  --query "{Value:Quota.Value}" --output json
```

### Verificar status do pedido de aumento de quota

Verifica se o pedido de aumento de quota do Amplify foi aprovado.

```bash
aws service-quotas list-requested-service-quota-change-history-by-quota \
  --service-code amplify \
  --quota-code L-1BED97F3 \
  --region us-east-1 \
  --query "RequestedQuotas[0].{Status:Status,DesiredValue:DesiredValue}" --output json
```

### Listar apps Amplify

```bash
aws amplify list-apps --region us-east-1 \
  --query "apps[].{Name:name,Id:appId,Repository:repository}" --output table
```

### Triggar novo build no Amplify

```bash
aws amplify start-job \
  --app-id dom7pekcheg36 \
  --branch-name improvements \
  --job-type RELEASE \
  --region us-east-1
```

---

## AWS — Lambda

### Verificar configuração de uma Lambda (layers, env vars)

```bash
aws lambda get-function-configuration \
  --function-name fastmeals-products-list \
  --query "{Layers:Layers,Runtime:Runtime,MemorySize:MemorySize,Timeout:Timeout}" \
  --output json
```

### Verificar se Datadog Extension está configurado

```bash
aws lambda get-function-configuration \
  --function-name fastmeals-products-list \
  --query "{Layers:Layers,EnvDD:Environment.Variables.DD_API_KEY}" \
  --output json
```

### Invocar Lambda manualmente para gerar dados no Datadog

```bash
# Obter token de autenticação
TOKEN=$(curl -s -X POST https://t2fwiydcrc.execute-api.us-east-1.amazonaws.com/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@fastmeals.com","password":"Admin@123"}' \
  | python3 -c 'import sys,json; print(json.load(sys.stdin).get("accessToken",""))')

# Invocar vários endpoints para gerar métricas
curl -s https://t2fwiydcrc.execute-api.us-east-1.amazonaws.com/api/products \
  -H "Authorization: Bearer $TOKEN" > /dev/null

curl -s https://t2fwiydcrc.execute-api.us-east-1.amazonaws.com/api/orders \
  -H "Authorization: Bearer $TOKEN" > /dev/null

curl -s https://t2fwiydcrc.execute-api.us-east-1.amazonaws.com/api/delivery \
  -H "Authorization: Bearer $TOKEN" > /dev/null

curl -s "https://t2fwiydcrc.execute-api.us-east-1.amazonaws.com/api/reports/revenue?startDate=2025-12-30&endDate=2026-03-31" \
  -H "Authorization: Bearer $TOKEN" > /dev/null

curl -s https://t2fwiydcrc.execute-api.us-east-1.amazonaws.com/api/reports/orders-by-status \
  -H "Authorization: Bearer $TOKEN" > /dev/null
```

### Listar todas as Lambda functions do projeto

```bash
aws lambda list-functions \
  --query "Functions[?starts_with(FunctionName,'fastmeals')].{Name:FunctionName,Runtime:Runtime,Memory:MemorySize}" \
  --output table --region us-east-1
```

---

## AWS — RDS e Bastion Host

### Conectar no Bastion Host via SSH

```bash
ssh -i ~/.ssh/fastmeals-bastion.pem ec2-user@44.204.165.150
```

### Criar túnel SSH para acessar o RDS (DBeaver)

Roda no terminal local. Porta 15432 redireciona para o RDS na porta 5432. Deixe o terminal aberto.

```bash
ssh -i ~/.ssh/fastmeals-bastion.pem \
  -L 15432:fastmeals-postgres.cw3eceym6ad8.us-east-1.rds.amazonaws.com:5432 \
  ec2-user@44.204.165.150
```

> No DBeaver: Host `localhost`, Port `15432`, User `fastmeals_admin`.

### Conectar direto no RDS via Bastion (psql)

Roda dentro do Bastion após conectar via SSH.

```bash
psql -h fastmeals-postgres.cw3eceym6ad8.us-east-1.rds.amazonaws.com \
  -U fastmeals_admin -d orders_db
```

### Comandos úteis dentro do psql

```sql
-- Listar tabelas
\dt

-- Contar registros
SELECT COUNT(*) FROM orders;

-- Listar databases
\l

-- Conectar em outro database
\c auth_db

-- Sair
\q
```

### Verificar segurança do Bastion (security group)

```bash
aws ec2 describe-security-groups \
  --filters "Name=group-name,Values=*bastion*" \
  --query "SecurityGroups[].{GroupId:GroupId,Rules:IpPermissions}" \
  --output json --region us-east-1
```

---

## AWS — Redis (ElastiCache)

### Conectar no Redis via Bastion

Roda dentro do Bastion após conectar via SSH.

```bash
redis-cli -h fastmeals-redis.3gjcuc.0001.use1.cache.amazonaws.com
```

### Comandos úteis dentro do redis-cli

```bash
# Listar todas as chaves
KEYS *

# Listar chaves do FastMeals
KEYS fastmeals:*

# Ver TTL de uma chave
TTL fastmeals:refresh_token:user123

# Verificar se Redis está respondendo
PING
```

---

## AWS — CloudWatch Logs

### Ver logs recentes de uma Lambda

```bash
aws logs tail /aws/lambda/fastmeals-products-list \
  --since 5m --region us-east-1
```

### Ver logs com filtro por texto

```bash
aws logs tail /aws/lambda/fastmeals-products-list \
  --since 30m --region us-east-1 --filter-pattern "ERROR"
```

### Listar log groups do projeto

```bash
aws logs describe-log-groups \
  --log-group-name-prefix /aws/lambda/fastmeals \
  --query "logGroups[].logGroupName" --output table --region us-east-1
```

---

## Terraform

### Inicializar o Terraform

Baixa providers e configura o backend remoto (S3 + DynamoDB).

```bash
cd infrastructure/terraform/environments/production
terraform init
```

### Verificar o plano de mudanças

Mostra o que o Terraform vai criar/modificar/destruir sem aplicar.

```bash
terraform plan -var-file="terraform.tfvars" -var-file="secrets.tfvars"
```

### Aplicar mudanças

Aplica as mudanças na infraestrutura AWS.

```bash
terraform apply -var-file="terraform.tfvars" -var-file="secrets.tfvars"
```

### Aplicar com auto-approve (sem confirmação)

```bash
terraform apply -var-file="terraform.tfvars" -var-file="secrets.tfvars" -auto-approve
```

### Ver outputs do Terraform

```bash
terraform output
terraform output bastion_public_ip
terraform output ssh_command
terraform output rds_tunnel_command
```

### Importar recurso existente no state

Quando um recurso já existe na AWS mas não está no Terraform state.

```bash
terraform import -var-file="terraform.tfvars" -var-file="secrets.tfvars" \
  module.frontend.aws_amplify_app.fastmeals dom7pekcheg36
```

### Destruir infraestrutura (cuidado!)

```bash
terraform destroy -var-file="terraform.tfvars" -var-file="secrets.tfvars"
```

### Verificar state

```bash
terraform state list
terraform state show module.lambda.aws_lambda_function.handlers["products-list"]
```

### Formato do secrets.tfvars

```hcl
rds_master_password  = ""
auth_db_password     = ""
products_db_password = ""
orders_db_password   = ""
delivery_db_password = ""
reports_db_password  = ""
mq_password          = ""
jwt_access_secret    = ""
jwt_refresh_secret   = ""
github_access_token  = ""
domain_name          = "fastmeals.com.br"
datadog_api_key      = ""
```

---

## Docker

### Subir todos os containers (19 containers)

```bash
docker compose up --build -d
```

### Subir apenas infraestrutura (bancos + Redis + RabbitMQ)

```bash
docker compose up auth-db products-db orders-db delivery-db reports-db redis rabbitmq -d
```

### Parar todos os containers

```bash
docker compose down
```

### Parar e remover volumes (reset completo)

```bash
docker compose down -v
```

### Ver logs de um container

```bash
docker compose logs auth-service -f
docker compose logs rabbitmq -f
```

### Acessar terminal de um container

```bash
docker exec -it fastmeals-auth-service sh
```

### Verificar containers rodando

```bash
docker compose ps
```

### Preparar bancos (migrations + seed)

```bash
./scripts/prepare-services-linux-mac.sh
```

---

## Git

### Verificar últimos commits

```bash
git log --oneline -10
```

### Voltar para um commit específico (apagar commits posteriores)

```bash
git reset --hard <commit-hash>
git push --force
```

### Desfazer o último commit (mantendo as mudanças)

```bash
git reset --soft HEAD~1
```

### Voltar apenas um arquivo para uma versão anterior

```bash
git checkout <commit-hash> -- caminho/do/arquivo
```

### Criar branch e trocar

```bash
git checkout -b nome-da-branch
```

### Push forçado (após reset)

```bash
git push --force
```

### Ver diferenças não commitadas

```bash
git diff
git diff --staged
```

### Stash (guardar mudanças temporariamente)

```bash
git stash
git stash pop
git stash list
```

---

## Node.js e NPM

### Instalar dependências

```bash
npm install
npm ci          # Install limpo (usa package-lock.json)
```

### Instalar pacote como devDependency

```bash
npm install -D @vitest/coverage-v8@^3.0.0
```

### Resolver conflito de peer dependencies

```bash
npm install -D @vitest/coverage-v8@^3.0.0    # Versão compatível com vitest 3.x
```

### Rodar servidor de desenvolvimento

```bash
npm run dev
```

### Rodar seed de dados

```bash
npm run seed
```

### Gerar Prisma client

```bash
npx prisma generate
```

---

## Vitest — Testes Backend

### Rodar testes de um serviço

```bash
cd backend/services/auth-service
npm test -- --run
```

### Rodar testes com coverage (gera lcov para SonarCloud)

```bash
npx vitest run --coverage
```

### Verificar se lcov.info foi gerado

```bash
ls -la coverage/lcov.info
```

### Rodar testes de todos os serviços

```bash
cd backend/services/auth-service && npm test -- --run          # 19 testes
cd backend/services/products-service && npm test -- --run      # 24 testes
cd backend/services/orders-service && npm test -- --run        # 43 testes
cd backend/services/delivery-service && npm test -- --run      # 20 testes
cd backend/services/optimization-service && npm test -- --run  # 29 testes
cd backend/services/reports-service && npm test -- --run       # 19 testes
```

### Rodar teste de fluxo completo (requer Docker)

```bash
./scripts/test-flow.sh    # 52 assertions
```

---

## Playwright — Testes E2E

### Instalar Playwright

```bash
cd frontend/microfrontends/shell
npm init playwright@latest
```

### Rodar todos os testes contra produção

```bash
PLAYWRIGHT_BASE_URL=https://fastmeals.com.br npx playwright test --reporter=list
```

### Rodar apenas smoke tests

```bash
PLAYWRIGHT_BASE_URL=https://fastmeals.com.br npx playwright test e2e/smoke.spec.ts --reporter=list
```

### Rodar com browser visível (para gravação)

```bash
PLAYWRIGHT_BASE_URL=https://fastmeals.com.br npx playwright test --headed --project=full-flow
```

### Rodar em modo interativo (UI)

```bash
PLAYWRIGHT_BASE_URL=https://fastmeals.com.br npx playwright test --ui
```

### Rodar em modo debug

```bash
PLAYWRIGHT_BASE_URL=https://fastmeals.com.br npx playwright test --debug
```

### Gerar report HTML

```bash
npx playwright test --reporter=html
npx playwright show-report
```

---

## SonarCloud

### Rodar análise localmente (via CLI)

O SonarCloud roda automaticamente via GitHub Actions, mas pode ser executado localmente:

```bash
npx sonar-scanner \
  -Dsonar.projectKey=vynnydev_fastmeals \
  -Dsonar.organization=vynnydev \
  -Dsonar.host.url=https://sonarcloud.io \
  -Dsonar.token=<SONAR_TOKEN>
```

### Dashboard do SonarCloud

```
https://sonarcloud.io/dashboard?id=vynnydev_fastmeals
```

### Desabilitar/habilitar workflow

```bash
# Desabilitar temporariamente
mv .github/workflows/sonarcloud.yml .github/workflows/sonarcloud.yml.disabled

# Reabilitar
mv .github/workflows/sonarcloud.yml.disabled .github/workflows/sonarcloud.yml
```

---

## Prisma ORM

### Gerar Prisma Client

```bash
npx prisma generate
```

### Rodar migrations em desenvolvimento

```bash
npx prisma migrate dev --name init
```

### Aplicar migrations em produção

```bash
npx prisma migrate deploy
```

### Visualizar banco de dados (Prisma Studio)

```bash
npx prisma studio
```

### Reset do banco (apaga tudo e recria)

```bash
npx prisma migrate reset
```

---

## FFmpeg

### Converter vídeo para GIF

```bash
ffmpeg -i video.mov -vf "fps=15,scale=1280:-1" -loop 0 output.gif
```

### Converter com menor qualidade (arquivo menor)

```bash
ffmpeg -i video.mov -vf "fps=10,scale=960:-1" -loop 0 output.gif
```

---

## macOS

### Alterar reporter de coverage em todos os serviços (sed no macOS)

```bash
for svc in auth-service products-service orders-service delivery-service optimization-service reports-service; do
  sed -i '' "s/reporter: \['text', 'json', 'html'\]/reporter: ['text', 'json', 'html', 'lcov']/" \
    backend/services/$svc/vitest.config.ts
done
```

### Buscar texto em arquivos do projeto

```bash
grep -r "texto" frontend/microfrontends/shell/src/ --include="*.tsx" -l
```

### Encontrar arquivos por nome

```bash
find frontend/microfrontends/shell/src -name "*Login*" -o -name "*auth*"
```

### Ver estrutura de diretórios

```bash
find frontend/microfrontends/remote-orders/src -name "*.tsx" -o -name "*.ts" | head -20
```

---

## URLs Importantes

| Recurso | URL |
|---------|-----|
| **Frontend (Produção)** | https://fastmeals.com.br |
| **API Gateway** | https://t2fwiydcrc.execute-api.us-east-1.amazonaws.com |
| **Datadog Dashboard** | https://us5.datadoghq.com/functions |
| **SonarCloud Dashboard** | https://sonarcloud.io/dashboard?id=vynnydev_fastmeals |
| **GitHub Repository** | https://github.com/vynnydev/fastmeals |
| **RDS Endpoint** | fastmeals-postgres.cw3eceym6ad8.us-east-1.rds.amazonaws.com |
| **Redis Endpoint** | fastmeals-redis.3gjcuc.0001.use1.cache.amazonaws.com |
| **Bastion Host IP** | 44.204.165.150 |

---

## Informações de Infraestrutura

| Recurso | Identificador |
|---------|---------------|
| **Amplify App ID** | dom7pekcheg36 |
| **Amplify Branch** | improvements |
| **Route53 Zone ID** | Z020208712J1359J2BNBP |
| **Bedrock Model ID** | amazon.nova-pro-v1:0 |
| **Datadog Site** | us5.datadoghq.com |
| **Terraform State Bucket** | fastmeals-terraform-state |
| **AWS Region** | us-east-1 |

---

*Documento gerado em Abril 2026 — FastMeals Project*
