output "monitor_ids" {
  description = "Map of monitor names to their Datadog IDs"
  value = {
    lambda_errors    = datadog_monitor.lambda_errors.id
    lambda_latency   = datadog_monitor.lambda_latency.id
    cold_start_rate  = datadog_monitor.cold_start_rate.id
    lambda_throttles = datadog_monitor.lambda_throttles.id
    api_5xx          = datadog_monitor.api_5xx.id
  }
}

output "dashboard_url" {
  description = "URL of the production monitoring dashboard"
  value       = datadog_dashboard_json.overview.url
}
