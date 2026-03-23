variable "project_name" {
  description = "Nome do projeto"
  type        = string
}

variable "aws_region" {
  description = "Região AWS"
  type        = string
}

variable "private_subnet_ids" {
  description = "IDs das subnets privadas"
  type        = list(string)
}

variable "lambda_security_group_id" {
  description = "Security group ID para Lambda"
  type        = string
}

variable "rds_endpoint" {
  description = "Endpoint do RDS"
  type        = string
}

variable "redis_url" {
  description = "URL do Redis"
  type        = string
  sensitive   = true
}

variable "rabbitmq_url" {
  description = "URL do RabbitMQ (AMQPS)"
  type        = string
  sensitive   = true
}

variable "database_urls" {
  description = "Connection strings por serviço"
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
  description = "ARN do secret JWT no Secrets Manager"
  type        = string
}

variable "secret_arns" {
  description = "Lista de ARNs de todos os secrets"
  type        = list(string)
}

variable "cors_origin" {
  description = "Origem CORS permitida"
  type        = string
  default     = "http://localhost:3000"
}

variable "domain_name" {
  description = "Domínio da aplicação"
  type        = string
  default     = "fastmeals.com.br"
}

variable "bedrock_model_id" {
  description = "Model ID do Bedrock"
  type        = string
  default     = "anthropic.claude-sonnet-4-5-20250514"
}