variable "project_name" {
  description = "Nome do projeto"
  type        = string
}

variable "private_subnet_ids" {
  description = "IDs das subnets privadas"
  type        = list(string)
}

variable "mq_security_group_id" {
  description = "Security group ID para Amazon MQ"
  type        = string
}

variable "instance_type" {
  description = "Tipo de instância do Amazon MQ"
  type        = string
  default     = "mq.t3.micro"
}

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