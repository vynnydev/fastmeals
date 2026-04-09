# 🔗 Datadog Integration — Lambda Instrumentation

Módulo que fornece a configuração de **instrumentação Datadog** para as Lambda functions. Não cria nenhum recurso cloud — apenas computa os valores (layers, env vars, handler wrapper) consumidos pelo módulo Lambda.

## O que fornece

| Output | Tipo | Descrição |
|--------|------|-----------|
| `lambda_layers` | list(string) | ARNs das 2 Datadog layers (Node.js Tracer + Extension) |
| `lambda_env_vars` | map(string) | 10 environment variables (DD_API_KEY, DD_TRACE_ENABLED, etc.) |
| `lambda_handler_wrapper` | string | Path do handler wrapper Datadog (`/opt/nodejs/...`) |
| `enabled` | bool | Flag para o módulo Lambda saber se Datadog está ativo |

## Layers

| Layer | Versão | Função |
|-------|--------|--------|
| `Datadog-Node20-x` | 118 | dd-trace-js — APM distributed tracing |
| `Datadog-Extension` | 65 | Telemetry collection and forwarding |

## Como usar

```hcl
module "datadog_integration" {
  source = "../modules/observability/datadog-integration"

  enabled      = true
  project_name = "fastmeals"
  environment  = "production"
  aws_region   = "us-east-1"
  dd_api_key   = var.dd_api_key
  dd_site      = "us5.datadoghq.com"
}

module "lambda" {
  source = "../modules/lambda"

  # ... existing vars ...

  datadog_layers  = module.datadog_integration.lambda_layers
  datadog_env     = module.datadog_integration.lambda_env_vars
  datadog_handler = module.datadog_integration.lambda_handler_wrapper
}
```

## Variáveis

| Variável | Default | Descrição |
|----------|---------|-----------|
| `enabled` | true | Habilitar instrumentação |
| `project_name` | fastmeals | DD_SERVICE tag |
| `environment` | production | DD_ENV tag |
| `aws_region` | us-east-1 | Região das layer ARNs |
| `dd_api_key` | — | API Key (required) |
| `dd_site` | us5.datadoghq.com | Datadog site |
