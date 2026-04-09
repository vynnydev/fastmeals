# ==========================================
# Dashboard — Production Overview (10 widgets)
# ==========================================

resource "datadog_dashboard_json" "overview" {
  dashboard = jsonencode({
    title       = "${var.project_name} — Production Overview"
    description = "Real-time monitoring of ${var.project_name} Lambda functions, API Gateway, and databases."
    layout_type = "ordered"

    widgets = [
      # --- Header ---
      {
        definition = {
          type             = "note"
          content          = "# 🍔 ${var.project_name} — Production Monitoring\n\n**Environment:** ${var.environment} | **Region:** ${var.aws_region} | **Services:** 6 microservices, 23 Lambda functions"
          background_color = "vivid_blue"
          font_size        = "14"
          text_align       = "left"
          show_tick        = false
        }
      },

      # --- Lambda Invocations ---
      {
        definition = {
          type  = "timeseries"
          title = "Lambda Invocations"
          requests = [{
            q            = "sum:aws.lambda.invocations{env:${var.environment},service:${var.project_name}} by {functionname}.as_count()"
            display_type = "bars"
          }]
        }
      },

      # --- Lambda Errors ---
      {
        definition = {
          type  = "timeseries"
          title = "Lambda Errors"
          requests = [{
            q            = "sum:aws.lambda.errors{env:${var.environment},service:${var.project_name}} by {functionname}.as_count()"
            display_type = "bars"
            style        = { palette = "warm" }
          }]
        }
      },

      # --- Lambda Duration P50/P95/P99 ---
      {
        definition = {
          type  = "timeseries"
          title = "Lambda Duration — P50 / P95 / P99"
          requests = [
            {
              q            = "avg:aws.lambda.duration{env:${var.environment},service:${var.project_name}}"
              display_type = "line"
              style        = { palette = "green" }
            },
            {
              q            = "p95:aws.lambda.duration{env:${var.environment},service:${var.project_name}}"
              display_type = "line"
              style        = { palette = "orange" }
            },
            {
              q            = "p99:aws.lambda.duration{env:${var.environment},service:${var.project_name}}"
              display_type = "line"
              style        = { palette = "red" }
            },
          ]
        }
      },

      # --- Cold Starts ---
      {
        definition = {
          type  = "timeseries"
          title = "Cold Starts"
          requests = [{
            q            = "sum:aws.lambda.enhanced.init_duration.count{env:${var.environment},service:${var.project_name}} by {functionname}.as_count()"
            display_type = "bars"
            style        = { palette = "cool" }
          }]
        }
      },

      # --- Cold Start Duration ---
      {
        definition = {
          type  = "timeseries"
          title = "Cold Start Duration (avg)"
          requests = [{
            q            = "avg:aws.lambda.enhanced.init_duration{env:${var.environment},service:${var.project_name}} by {functionname}"
            display_type = "line"
          }]
        }
      },

      # --- API Gateway Requests + Errors ---
      {
        definition = {
          type  = "timeseries"
          title = "API Gateway — Requests & Errors"
          requests = [
            {
              q            = "sum:aws.apigateway.count{env:${var.environment}}.as_count()"
              display_type = "bars"
            },
            {
              q            = "sum:aws.apigateway.4xx{env:${var.environment}}.as_count()"
              display_type = "line"
              style        = { palette = "orange" }
            },
            {
              q            = "sum:aws.apigateway.5xx{env:${var.environment}}.as_count()"
              display_type = "line"
              style        = { palette = "red" }
            },
          ]
        }
      },

      # --- API Gateway Latency ---
      {
        definition = {
          type  = "timeseries"
          title = "API Gateway — Latency P50 / P95"
          requests = [
            {
              q            = "avg:aws.apigateway.latency{env:${var.environment}}"
              display_type = "line"
              style        = { palette = "green" }
            },
            {
              q            = "p95:aws.apigateway.latency{env:${var.environment}}"
              display_type = "line"
              style        = { palette = "orange" }
            },
          ]
        }
      },

      # --- Memory Usage ---
      {
        definition = {
          type  = "timeseries"
          title = "Lambda Memory Usage (max)"
          requests = [{
            q            = "max:aws.lambda.enhanced.max_memory_used{env:${var.environment},service:${var.project_name}} by {functionname}"
            display_type = "line"
          }]
        }
      },

      # --- Monitor Status ---
      {
        definition = {
          type  = "manage_status"
          title = "Monitor Status"
          query = "tag:(project:${var.project_name})"
          sort  = "status,asc"
        }
      },
    ]
  })
}
