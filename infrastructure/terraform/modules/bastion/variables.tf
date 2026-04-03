variable "project_name" {
  description = "Nome do projeto"
  type        = string
}

variable "vpc_id" {
  description = "ID da VPC"
  type        = string
}

variable "public_subnet_id" {
  description = "ID da subnet pública para o bastion"
  type        = string
}

variable "rds_security_group_id" {
  description = "Security group ID do RDS (para adicionar regra de ingress)"
  type        = string
}

variable "redis_security_group_id" {
  description = "Security group ID do Redis (para adicionar regra de ingress)"
  type        = string
}

variable "rds_endpoint" {
  description = "Endpoint do RDS (para scripts de conexão)"
  type        = string
  default     = ""
}

variable "aws_region" {
  description = "AWS region (para IAM policies do Secrets Manager)"
  type        = string
  default     = "us-east-1"
}

variable "key_name" {
  description = "Nome da key pair EC2 para SSH"
  type        = string
  default     = "fastmeals-bastion"
}

variable "instance_type" {
  description = "Tipo da instância EC2"
  type        = string
  default     = "t3.micro"
}

variable "allowed_ssh_cidrs" {
  description = "CIDRs permitidos para SSH (seu IP público)"
  type        = list(string)
  default     = ["0.0.0.0/0"]  # Em produção, restrinja para seu IP
}
