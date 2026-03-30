variable "project_name" {
  description = "Nome do projeto"
  type        = string
}

variable "domain_name" {
  description = "Domínio principal"
  type        = string
}

variable "api_gateway_domain_name" {
  description = "Domain name do API Gateway (para subdomínio api.)"
  type        = string
  default     = ""
}