variable "project_name" {
  description = "Nome do projeto"
  type        = string
}

variable "private_subnet_ids" {
  description = "IDs das subnets privadas"
  type        = list(string)
}

variable "rds_security_group_id" {
  description = "Security group ID para RDS"
  type        = string
}

variable "instance_class" {
  description = "Classe da instância RDS"
  type        = string
  default     = "db.t3.micro"
}

variable "allocated_storage" {
  description = "Storage inicial em GB"
  type        = number
  default     = 20
}

variable "max_allocated_storage" {
  description = "Storage máximo (autoscaling) em GB"
  type        = number
  default     = 50
}

variable "master_username" {
  description = "Username master do RDS"
  type        = string
  default     = "fastmeals_admin"
}

variable "master_password" {
  description = "Password master do RDS"
  type        = string
  sensitive   = true
}

variable "service_passwords" {
  description = "Passwords dos service users"
  type = object({
    auth     = string
    products = string
    orders   = string
    delivery = string
    reports  = string
  })
  sensitive = true
}