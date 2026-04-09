variable "project_name" {
  description = "Nome do projeto"
  type        = string
  default     = "fastmeals"
}

variable "aws_region" {
  description = "Região AWS"
  type        = string
  default     = "us-east-1"
}

variable "vpc_cidr" {
  description = "CIDR block da VPC"
  type        = string
  default     = "10.0.0.0/16"
}

# --- RDS ---
variable "rds_instance_class" {
  type    = string
  default = "db.t3.micro"
}

variable "rds_allocated_storage" {
  type    = number
  default = 20
}

variable "rds_max_allocated_storage" {
  type    = number
  default = 50
}

variable "rds_master_password" {
  type      = string
  sensitive = true
}

variable "auth_db_password" {
  type      = string
  sensitive = true
}

variable "products_db_password" {
  type      = string
  sensitive = true
}

variable "orders_db_password" {
  type      = string
  sensitive = true
}

variable "delivery_db_password" {
  type      = string
  sensitive = true
}

variable "reports_db_password" {
  type      = string
  sensitive = true
}

# --- Redis ---
variable "redis_node_type" {
  type    = string
  default = "cache.t3.micro"
}

# --- MQ ---
variable "mq_password" {
  type      = string
  sensitive = true
}

# --- JWT ---
variable "jwt_access_secret" {
  type      = string
  sensitive = true
}

variable "jwt_refresh_secret" {
  type      = string
  sensitive = true
}

# --- Lambda ---
variable "bedrock_model_id" {
  type    = string
  default = "amazon.nova-pro-v1:0"
}

# --- Frontend ---
# variable "github_repository" {
#   description = "URL do repositório GitHub"
#   type        = string
# }

# variable "github_access_token" {
#   description = "GitHub PAT para Amplify"
#   type        = string
#   sensitive   = true
# }

# variable "amplify_branch" {
#   description = "Branch para deploy"
#   type        = string
#   default     = "development"
# }

# variable "domain_name" {
#   description = "Domínio customizado"
#   type        = string
#   default     = "fastmeals.com.br"
# }

variable "domain_name" {
  description = "Domínio customizado"
  type        = string
  default     = "fastmeals.com.br"
}

variable "api_gateway_url" {
  description = "URL do API Gateway para inter-service communication"
  type        = string
  default     = "https://t2fwiydcrc.execute-api.us-east-1.amazonaws.com"
}

variable "github_access_token" {
  type      = string
  sensitive = true
}

# Datadog
variable "datadog_api_key" {
  description = "Datadog API Key"
  type        = string
  default     = ""
  sensitive   = true
}

variable "datadog_app_key" {
  description = "Datadog App Key"
  type        = string
  default     = ""
  sensitive   = true
}