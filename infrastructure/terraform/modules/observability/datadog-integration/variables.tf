variable "enabled" {
  description = "Enable Datadog Lambda instrumentation"
  type        = bool
  default     = true
}

variable "project_name" {
  description = "Project name (used for DD_SERVICE tag)"
  type        = string
  default     = "fastmeals"
}

variable "environment" {
  description = "Environment name (used for DD_ENV tag)"
  type        = string
  default     = "production"
}

variable "aws_region" {
  description = "AWS region for Lambda layer ARNs"
  type        = string
  default     = "us-east-1"
}

variable "dd_api_key" {
  description = "Datadog API Key"
  type        = string
  sensitive   = true
}

variable "dd_site" {
  description = "Datadog site URL"
  type        = string
  default     = "us5.datadoghq.com"
}
