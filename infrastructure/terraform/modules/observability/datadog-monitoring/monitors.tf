# ==========================================
# Monitors (5 Alerts)
# ==========================================

# --- Lambda Error Rate ---
resource "datadog_monitor" "lambda_errors" {
  name    = "[${var.project_name}] Lambda Error Rate > ${var.error_rate_threshold}%"
  type    = "query alert"
  message = <<-EOT
    ## 🚨 Lambda Error Rate High

    The error rate for ${var.project_name} Lambda functions has exceeded ${var.error_rate_threshold}%.

    **Environment:** ${var.environment}
    **Threshold:** ${var.error_rate_threshold}%

    ### Actions:
    1. Check Datadog APM → Traces → filter by `env:${var.environment}` and `status:error`
    2. Check CloudWatch Logs for the affected function
    3. Verify database connectivity (RDS, Redis, RabbitMQ)

    ${var.notification_targets}
  EOT

  query = "sum(last_5m):sum:aws.lambda.errors{env:${var.environment},service:${var.project_name}}.as_count() / sum:aws.lambda.invocations{env:${var.environment},service:${var.project_name}}.as_count() * 100 > ${var.error_rate_threshold}"

  monitor_thresholds {
    critical = var.error_rate_threshold
    warning  = var.error_rate_threshold * 0.5
  }

  notify_no_data    = false
  renotify_interval = 30
  timeout_h         = 1
  tags              = local.tags
}

# --- Lambda Latency P95 ---
resource "datadog_monitor" "lambda_latency" {
  name    = "[${var.project_name}] Lambda Latency P95 > ${var.latency_p95_threshold}ms"
  type    = "query alert"
  message = <<-EOT
    ## ⏱️ Lambda Latency P95 High

    P95 latency for ${var.project_name} Lambda functions has exceeded ${var.latency_p95_threshold}ms.

    **Environment:** ${var.environment}
    **Threshold:** ${var.latency_p95_threshold}ms

    ### Possible causes:
    - Cold starts (check cold start rate monitor)
    - Database slow queries (check Datadog SQL traces)
    - Network latency to RDS/Redis/RabbitMQ
    - Lambda memory too low (currently 256MB)

    ### Actions:
    1. Check Datadog APM → Service Map → look for slow spans
    2. Check SQL trace durations in APM → Traces
    3. Consider increasing Lambda memory or provisioned concurrency

    ${var.notification_targets}
  EOT

  query = "avg(last_5m):p95:aws.lambda.duration{env:${var.environment},service:${var.project_name}} > ${var.latency_p95_threshold}"

  monitor_thresholds {
    critical = var.latency_p95_threshold
    warning  = var.latency_p95_threshold * 0.7
  }

  notify_no_data    = false
  renotify_interval = 30
  timeout_h         = 1
  tags              = local.tags
}

# --- Cold Start Rate ---
resource "datadog_monitor" "cold_start_rate" {
  name    = "[${var.project_name}] Lambda Cold Start Rate > ${var.cold_start_threshold}%"
  type    = "query alert"
  message = <<-EOT
    ## 🥶 Lambda Cold Start Rate High

    Cold start rate for ${var.project_name} Lambda functions has exceeded ${var.cold_start_threshold}%.

    **Environment:** ${var.environment}
    **Threshold:** ${var.cold_start_threshold}%

    ### Impact:
    - First request after idle period takes 1-3s extra
    - User-facing latency degradation

    ### Actions:
    1. Check Datadog Serverless → Lambda → Cold Start % per function
    2. Consider enabling Provisioned Concurrency for critical functions
    3. Optimize package size (currently ~19MB + Datadog layers)
    4. Review if Lambda memory increase helps init time

    ${var.notification_targets}
  EOT

  query = "avg(last_15m):sum:aws.lambda.enhanced.init_duration.count{env:${var.environment},service:${var.project_name}}.as_count() / sum:aws.lambda.invocations{env:${var.environment},service:${var.project_name}}.as_count() * 100 > ${var.cold_start_threshold}"

  monitor_thresholds {
    critical = var.cold_start_threshold
    warning  = var.cold_start_threshold * 0.5
  }

  notify_no_data    = false
  renotify_interval = 60
  timeout_h         = 2
  tags              = local.tags
}

# --- Lambda Throttles ---
resource "datadog_monitor" "lambda_throttles" {
  name    = "[${var.project_name}] Lambda Throttles Detected"
  type    = "query alert"
  message = <<-EOT
    ## ⚠️ Lambda Throttling Detected

    ${var.project_name} Lambda functions are being throttled by AWS.

    **Environment:** ${var.environment}

    ### Impact:
    - Requests are being rejected (429 Too Many Requests)
    - Users may see errors or timeouts

    ### Actions:
    1. Check AWS Lambda console → Concurrency metrics
    2. Request concurrency limit increase via AWS Support
    3. Consider Reserved Concurrency for critical functions
    4. Check if a traffic spike is causing the issue

    ${var.notification_targets}
  EOT

  query = "sum(last_5m):sum:aws.lambda.throttles{env:${var.environment},service:${var.project_name}}.as_count() > ${var.throttle_threshold}"

  monitor_thresholds {
    critical = var.throttle_threshold
    warning  = 1
  }

  notify_no_data    = false
  renotify_interval = 15
  timeout_h         = 1
  tags              = local.tags
}

# --- API Gateway 5xx ---
resource "datadog_monitor" "api_5xx" {
  name    = "[${var.project_name}] API Gateway 5xx Errors > ${var.api_5xx_threshold}"
  type    = "query alert"
  message = <<-EOT
    ## 🔴 API Gateway 5xx Errors

    Server-side errors detected on the ${var.project_name} API Gateway.

    **Environment:** ${var.environment}
    **Threshold:** ${var.api_5xx_threshold} errors in 5 minutes

    ### Actions:
    1. Check Datadog APM → Error Spans
    2. Check CloudWatch Logs for API Gateway
    3. Verify Lambda function health
    4. Check database connectivity

    ${var.notification_targets}
  EOT

  query = "sum(last_5m):sum:aws.apigateway.5xx{env:${var.environment}}.as_count() > ${var.api_5xx_threshold}"

  monitor_thresholds {
    critical = var.api_5xx_threshold
    warning  = var.api_5xx_threshold / 2
  }

  notify_no_data    = false
  renotify_interval = 15
  timeout_h         = 1
  tags              = local.tags
}
