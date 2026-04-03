variable "project_name" {
  description = "Nome do projeto"
  type        = string
}

variable "bucket_name" {
  description = "Nome do bucket (sera prefixado com project_name)"
  type        = string
}

variable "purpose" {
  description = "Proposito do bucket: static-site, backups, assets, logs"
  type        = string
  default     = "general"

  validation {
    condition     = contains(["static-site", "backups", "assets", "logs", "general"], var.purpose)
    error_message = "Purpose must be: static-site, backups, assets, logs, or general"
  }
}

variable "enable_versioning" {
  description = "Habilitar versionamento"
  type        = bool
  default     = false
}

variable "enable_encryption" {
  description = "Habilitar encriptacao AES256"
  type        = bool
  default     = true
}

variable "block_public_access" {
  description = "Bloquear acesso publico ao bucket"
  type        = bool
  default     = true
}

variable "lifecycle_expiration_days" {
  description = "Dias para expirar objetos (0 = desabilitado)"
  type        = number
  default     = 0
}

variable "lifecycle_prefix" {
  description = "Prefixo para a regra de lifecycle"
  type        = string
  default     = ""
}

variable "index_document" {
  description = "Documento index para static-site"
  type        = string
  default     = "index.html"
}

variable "error_document" {
  description = "Documento de erro para static-site"
  type        = string
  default     = "index.html"
}

variable "bucket_policy" {
  description = "Policy JSON customizada para o bucket (vazia = sem policy)"
  type        = string
  default     = ""
}
