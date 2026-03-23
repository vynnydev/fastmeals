variable "project_name" {
  description = "Nome do projeto"
  type        = string
}

variable "aws_region" {
  description = "Região AWS"
  type        = string
}

variable "vpc_id" {
  description = "ID da VPC"
  type        = string
}

variable "public_subnet_ids" {
  description = "IDs das subnets públicas (para ALB)"
  type        = list(string)
}

variable "private_subnet_ids" {
  description = "IDs das subnets privadas (para ECS tasks)"
  type        = list(string)
}

variable "api_gateway_url" {
  description = "URL do API Gateway (backend)"
  type        = string
}

variable "task_cpu" {
  description = "CPU do Fargate task (em units: 256 = 0.25 vCPU)"
  type        = number
  default     = 256
}

variable "task_memory" {
  description = "Memória do Fargate task (em MiB)"
  type        = number
  default     = 512
}

variable "desired_count" {
  description = "Número desejado de tasks"
  type        = number
  default     = 1
}

variable "max_count" {
  description = "Número máximo de tasks (auto scaling)"
  type        = number
  default     = 3
}