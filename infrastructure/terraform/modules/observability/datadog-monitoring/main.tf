# ==========================================
# Datadog Monitoring — Alerts & Dashboard
# ==========================================
# Creates monitors (alerts) and dashboard
# directly in Datadog via the Datadog provider.
#
# Requires DD_APP_KEY (Application Key) in
# addition to the DD_API_KEY used by integration.
#
# Independent from the integration module —
# can be applied/destroyed without affecting
# Lambda instrumentation.
# ==========================================

terraform {
  required_providers {
    datadog = {
      source  = "DataDog/datadog"
      version = "~> 3.0"
    }
  }
}

locals {
  tags = concat(
    ["env:${var.environment}", "project:${var.project_name}", "managed-by:terraform"],
    var.extra_tags,
  )
}
