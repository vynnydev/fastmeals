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

# Datadog
variable "datadog_api_key" {
  description = "Datadog API Key for Lambda instrumentation"
  type        = string
  default     = ""
  sensitive   = true
}

variable "datadog_site" {
  description = "Datadog site"
  type        = string
  default     = "us5.datadoghq.com"
}

variable "datadog_enabled" {
  description = "Enable Datadog Lambda instrumentation"
  type        = bool
  default     = false
}