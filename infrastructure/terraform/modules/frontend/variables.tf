variable "project_name" {
  description = "Nome do projeto"
  type        = string
}

variable "github_repository" {
  description = "URL do repositório GitHub"
  type        = string
}

variable "github_access_token" {
  description = "GitHub Personal Access Token para Amplify"
  type        = string
  sensitive   = true
}

variable "branch_name" {
  description = "Branch para deploy"
  type        = string
  default     = "development"
}

variable "api_gateway_url" {
  description = "URL do API Gateway (backend)"
  type        = string
}

variable "domain_name" {
  description = "Domínio customizado (vazio para não configurar)"
  type        = string
  default     = ""
}