# ==========================================
# Datadog Integration — Lambda Instrumentation
# ==========================================
# Provides Lambda layer ARNs, environment variables,
# and handler wrapper for Datadog APM tracing.
#
# This module creates NO cloud resources — it only
# computes values consumed by the Lambda module:
#
#   module "lambda" {
#     datadog_layers  = module.datadog_integration.lambda_layers
#     datadog_env     = module.datadog_integration.lambda_env_vars
#     datadog_handler = module.datadog_integration.lambda_handler_wrapper
#   }
# ==========================================

locals {
  # Datadog Lambda Layers (Node.js 20)
  # 1. Datadog-Node20-x:118 — dd-trace-js APM tracer
  # 2. Datadog-Extension:65 — telemetry collection and forwarding
  lambda_layers = var.enabled ? [
    "arn:aws:lambda:${var.aws_region}:464622532012:layer:Datadog-Node20-x:118",
    "arn:aws:lambda:${var.aws_region}:464622532012:layer:Datadog-Extension:65",
  ] : []

  # Environment variables injected into all Lambda functions
  lambda_env_vars = var.enabled ? {
    DD_API_KEY                 = var.dd_api_key
    DD_SITE                    = var.dd_site
    DD_SERVERLESS_LOGS_ENABLED = "true"
    DD_CAPTURE_LAMBDA_PAYLOAD  = "true"
    DD_TRACE_ENABLED           = "true"
    DD_MERGE_XRAY_TRACES       = "false"
    DD_FLUSH_TO_LOG            = "true"
    DD_ENV                     = var.environment
    DD_SERVICE                 = var.project_name
    DD_TRACE_PROPAGATION_STYLE = "datadog"
  } : {}

  # Handler wrapper — Datadog intercepts the original handler
  # When enabled, Lambda handler becomes the Datadog wrapper,
  # and the original handler is set via DD_LAMBDA_HANDLER env var
  handler_wrapper = var.enabled ? "/opt/nodejs/node_modules/datadog-lambda-js/handler.handler" : null
}
