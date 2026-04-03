variable "project_name" {
  description = "Nome do projeto"
  type        = string
}

variable "domain_name" {
  description = "Dominio principal (o dashboard ficara em finops.domain)"
  type        = string
  default     = ""
}

variable "route53_zone_id" {
  description = "Route53 Hosted Zone ID para criar o registro DNS"
  type        = string
  default     = ""
}

variable "certificate_arn" {
  description = "ARN do certificado ACM wildcard existente (*.fastmeals.com.br)"
  type        = string
  default     = ""
}
