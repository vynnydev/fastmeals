# 📈 Datadog Monitoring — Alerts & Dashboard

Módulo Terraform que cria **5 monitors (alertas)** e **1 dashboard** diretamente no Datadog para monitoramento proativo da FastMeals.

> Este módulo é independente do `datadog-integration`. Pode ser aplicado/destruído sem afetar a instrumentação das Lambda functions.

## Monitors (5 alertas)

| Monitor | Métrica | Threshold | Janela |
|---------|---------|-----------|--------|
| **Lambda Error Rate** | % de invocações com erro | > 5% | 5 min |
| **Lambda Latency P95** | Duração P95 | > 3000ms | 5 min |
| **Cold Start Rate** | % de cold starts | > 30% | 15 min |
| **Lambda Throttles** | Invocações rejeitadas | > 5 | 5 min |
| **API Gateway 5xx** | Erros server-side | > 10 | 5 min |

Cada monitor inclui mensagem detalhada com causa provável e ações recomendadas.

## Dashboard (10 widgets)

1. Header com info do ambiente
2. Lambda Invocations por função
3. Lambda Errors por função
4. Lambda Duration P50/P95/P99
5. Cold Starts por função
6. Cold Start Duration média
7. API Gateway Requests + 4xx + 5xx
8. API Gateway Latency P50/P95
9. Lambda Memory Usage (max)
10. Monitor Status overview

## Pré-requisito

Requer **DD_APP_KEY** (Application Key) — obter em Datadog → Organization Settings → Application Keys.

## Como usar

```hcl
provider "datadog" {
  api_key = var.dd_api_key
  app_key = var.dd_app_key
  api_url = "https://api.us5.datadoghq.com/"
}

module "datadog_monitoring" {
  source = "../modules/observability/datadog-monitoring"

  project_name = "fastmeals"
  environment  = "production"
  aws_region   = "us-east-1"

  # Thresholds (optional — defaults shown)
  error_rate_threshold  = 5
  latency_p95_threshold = 3000
  cold_start_threshold  = 30
  throttle_threshold    = 5
  api_5xx_threshold     = 10

  notification_targets = "@vynnydev"
}
```

## Variáveis

| Variável | Default | Descrição |
|----------|---------|-----------|
| `project_name` | fastmeals | Nome nos monitors e tags |
| `environment` | production | Filtro de ambiente |
| `aws_region` | us-east-1 | Header do dashboard |
| `error_rate_threshold` | 5 | % erro para alertar |
| `latency_p95_threshold` | 3000 | P95 latência ms |
| `cold_start_threshold` | 30 | % cold starts |
| `throttle_threshold` | 5 | Throttles em 5min |
| `api_5xx_threshold` | 10 | 5xx em 5min |
| `notification_targets` | "" | @user, @slack-channel |
| `extra_tags` | [] | Tags adicionais |

## Outputs

| Output | Descrição |
|--------|-----------|
| `monitor_ids` | Map com IDs dos 5 monitors |
| `dashboard_url` | URL direta para o dashboard |
