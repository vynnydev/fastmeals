variable "project_name" {
  description = "Nome do projeto"
  type        = string
  default     = "fastmeals"
}

variable "environment" {
  description = "Ambiente (production, staging, development)"
  type        = string
  default     = "production"
}

variable "repository_url" {
  description = "URL do repositório GitHub"
  type        = string
}

variable "github_access_token" {
  description = "GitHub Personal Access Token para Amplify acessar o repositório"
  type        = string
  sensitive   = true
}

variable "branch_name" {
  description = "Branch para deploy"
  type        = string
  default     = "improvements"
}

variable "api_gateway_url" {
  description = "URL do API Gateway"
  type        = string
}

variable "domain_name" {
  description = "Domínio personalizado (ex: fastmeals.com.br)"
  type        = string
  default     = ""
}