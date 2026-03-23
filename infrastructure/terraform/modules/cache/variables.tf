variable "project_name" {
  description = "Nome do projeto"
  type        = string
}

variable "private_subnet_ids" {
  description = "IDs das subnets privadas"
  type        = list(string)
}

variable "redis_security_group_id" {
  description = "Security group ID para Redis"
  type        = string
}

variable "node_type" {
  description = "Tipo de nó do ElastiCache"
  type        = string
  default     = "cache.t3.micro"
}