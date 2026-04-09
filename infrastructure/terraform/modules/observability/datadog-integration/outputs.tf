output "lambda_layers" {
  description = "Datadog Lambda layer ARNs (Node.js Tracer + Extension)"
  value       = local.lambda_layers
}

output "lambda_env_vars" {
  description = "Datadog environment variables for Lambda functions"
  value       = local.lambda_env_vars
  sensitive   = true
}

output "lambda_handler_wrapper" {
  description = "Datadog handler wrapper path (null if disabled)"
  value       = local.handler_wrapper
}

output "enabled" {
  description = "Whether Datadog instrumentation is enabled"
  value       = var.enabled
}
