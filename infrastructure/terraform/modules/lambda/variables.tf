variable "project_name" {
  type = string
}

variable "aws_region" {
  type = string
}

variable "private_subnet_ids" {
  type = list(string)
}

variable "lambda_security_group_id" {
  type = string
}

variable "redis_url" {
  type      = string
  sensitive = true
}

variable "rabbitmq_url" {
  type      = string
  sensitive = true
}

variable "database_urls" {
  type = object({
    auth     = string
    products = string
    orders   = string
    delivery = string
    reports  = string
  })
  sensitive = true
}

variable "jwt_access_secret" {
  type      = string
  sensitive = true
}

variable "jwt_refresh_secret" {
  type      = string
  sensitive = true
}

variable "secret_arns" {
  type = list(string)
}

variable "cors_origin" {
  type    = string
  default = "https://fastmeals.com.br"
}

variable "bedrock_model_id" {
  type    = string
  default = "amazon.nova-pro-v1:0"
}

variable "api_gateway_url" {
  description = "URL do API Gateway (para inter-service communication)"
  type        = string
}

# ==========================================
# Datadog variables (from observability module)
# ==========================================
# These replace the old variables:
#   - datadog_enabled
#   - datadog_api_key
#   - datadog_site
#
# Now provided by module.observability outputs:
#   datadog_layers  = module.observability.lambda_layers
#   datadog_env     = module.observability.lambda_env_vars
#   datadog_handler = module.observability.lambda_handler_wrapper
# ==========================================

variable "datadog_layers" {
  description = "Datadog Lambda layer ARNs (from observability module)"
  type        = list(string)
  default     = []
}

variable "datadog_env" {
  description = "Datadog environment variables (from observability module)"
  type        = map(string)
  default     = {}
  sensitive   = true
}

variable "datadog_handler" {
  description = "Datadog handler wrapper path, null if disabled (from observability module)"
  type        = string
  default     = null
}