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

variable "jwt_secret_arn" {
  type = string
}

variable "secret_arns" {
  type = list(string)
}

variable "cors_origin" {
  type    = string
  default = "http://localhost:3000"
}

variable "bedrock_model_id" {
  type    = string
  default = "anthropic.claude-sonnet-4-5-20250514"
}