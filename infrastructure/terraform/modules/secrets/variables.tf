variable "project_name" {
  description = "Nome do projeto"
  type        = string
}

variable "aws_region" {
  description = "Região AWS"
  type        = string
  default     = "us-east-1"
}

# --- RDS ---
variable "rds_master_password" {
  description = "Password master do RDS"
  type        = string
  sensitive   = true
}

variable "auth_db_password" {
  description = "Password do auth_user"
  type        = string
  sensitive   = true
}

variable "products_db_password" {
  description = "Password do products_user"
  type        = string
  sensitive   = true
}

variable "orders_db_password" {
  description = "Password do orders_user"
  type        = string
  sensitive   = true
}

variable "delivery_db_password" {
  description = "Password do delivery_user"
  type        = string
  sensitive   = true
}

variable "reports_db_password" {
  description = "Password do reports_user"
  type        = string
  sensitive   = true
}

# --- JWT ---
variable "jwt_access_secret" {
  description = "JWT access token secret"
  type        = string
  sensitive   = true
}

variable "jwt_refresh_secret" {
  description = "JWT refresh token secret"
  type        = string
  sensitive   = true
}

# --- RabbitMQ ---
variable "mq_username" {
  description = "Username do RabbitMQ"
  type        = string
  default     = "fastmeals"
}

variable "mq_password" {
  description = "Password do RabbitMQ"
  type        = string
  sensitive   = true
}

# --- Bedrock ---
variable "bedrock_model_id" {
  description = "Model ID do Bedrock"
  type        = string
  default     = "anthropic.claude-sonnet-4-5-20250514"
}