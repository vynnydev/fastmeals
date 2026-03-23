variable "project_name" {
  description = "Nome do projeto"
  type        = string
}

variable "vpc_cidr" {
  description = "CIDR block da VPC"
  type        = string
  default     = "10.0.0.0/16"
}