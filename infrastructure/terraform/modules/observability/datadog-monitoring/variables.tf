variable "project_name" {
  description = "Project name used for monitor names and tags"
  type        = string
  default     = "fastmeals"
}

variable "environment" {
  description = "Environment name (e.g., production, staging)"
  type        = string
  default     = "production"
}

variable "aws_region" {
  description = "AWS region (used in dashboard header)"
  type        = string
  default     = "us-east-1"
}

# ==========================================
# Monitor Thresholds
# ==========================================

variable "error_rate_threshold" {
  description = "Lambda error rate percentage threshold"
  type        = number
  default     = 5
}

variable "latency_p95_threshold" {
  description = "Lambda P95 latency threshold in milliseconds"
  type        = number
  default     = 3000
}

variable "cold_start_threshold" {
  description = "Lambda cold start rate percentage threshold"
  type        = number
  default     = 30
}

variable "throttle_threshold" {
  description = "Lambda throttle count threshold (in 5 min window)"
  type        = number
  default     = 5
}

variable "api_5xx_threshold" {
  description = "API Gateway 5xx error count threshold (in 5 min window)"
  type        = number
  default     = 10
}

# ==========================================
# Notifications
# ==========================================

variable "notification_targets" {
  description = "Datadog notification targets (e.g., @slack-channel, @email)"
  type        = string
  default     = ""
}

variable "extra_tags" {
  description = "Additional tags for all monitors"
  type        = list(string)
  default     = []
}
