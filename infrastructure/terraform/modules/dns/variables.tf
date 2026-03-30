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

variable "amplify_cert_record_name" {
  description = "Nome do record CNAME para validação do certificado Amplify"
  type        = string
  default     = ""
}

variable "amplify_cert_record_value" {
  description = "Valor do record CNAME para validação do certificado Amplify"
  type        = string
  default     = ""
}

# variable "amplify_cloudfront_domain" {
#   description = "Domínio CloudFront do Amplify para o root domain"
#   type        = string
#   default     = ""
# }