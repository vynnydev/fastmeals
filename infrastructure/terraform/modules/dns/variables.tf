variable "project_name" {
  description = "Nome do projeto"
  type        = string
}

variable "domain_name" {
  description = "Domínio principal"
  type        = string
}

variable "alb_dns_name" {
  description = "DNS name do ALB"
  type        = string
}

variable "alb_zone_id" {
  description = "Zone ID do ALB"
  type        = string
}

variable "api_gateway_domain_name" {
  description = "Domain name do API Gateway (para subdomínio api.)"
  type        = string
  default     = ""
}