variable "project_name" {
  description = "Nome do projeto"
  type        = string
}

variable "site_name" {
  description = "Nome do site (usado em tags e OAC name)"
  type        = string
}

# --- Origin ---

variable "origin_domain" {
  description = "Domain name da origin (S3 bucket_regional_domain ou custom domain)"
  type        = string
}

variable "origin_type" {
  description = "Tipo da origin: s3 ou custom"
  type        = string
  default     = "s3"

  validation {
    condition     = contains(["s3", "custom"], var.origin_type)
    error_message = "Origin type must be: s3 or custom"
  }
}

# --- Domain ---

variable "subdomain" {
  description = "Subdominio (ex: finops, docs). Vazio = sem custom domain"
  type        = string
  default     = ""
}

variable "domain_name" {
  description = "Dominio principal (ex: fastmeals.com.br)"
  type        = string
  default     = ""
}

variable "route53_zone_id" {
  description = "Route53 Hosted Zone ID"
  type        = string
  default     = ""
}

variable "certificate_arn" {
  description = "ARN do certificado ACM (wildcard ou especifico)"
  type        = string
  default     = ""
}

# --- Cache ---

variable "default_root_object" {
  description = "Objeto root padrao"
  type        = string
  default     = "index.html"
}

variable "min_ttl" {
  description = "TTL minimo em segundos"
  type        = number
  default     = 0
}

variable "default_ttl" {
  description = "TTL padrao em segundos"
  type        = number
  default     = 3600
}

variable "max_ttl" {
  description = "TTL maximo em segundos"
  type        = number
  default     = 86400
}

# --- Behavior ---

variable "spa_mode" {
  description = "Habilitar SPA mode (redireciona 403/404 para index.html)"
  type        = bool
  default     = true
}

variable "allowed_methods" {
  description = "Metodos HTTP permitidos"
  type        = list(string)
  default     = ["GET", "HEAD", "OPTIONS"]
}

variable "price_class" {
  description = "CloudFront price class"
  type        = string
  default     = "PriceClass_100"
}

# --- Geo Restriction ---

variable "geo_restriction_type" {
  description = "Tipo de restricao geografica: none, whitelist, blacklist"
  type        = string
  default     = "none"
}

variable "geo_restriction_locations" {
  description = "Lista de paises (ISO 3166-1 alpha-2) para restricao"
  type        = list(string)
  default     = []
}
