# ============================================
# FastMeals — Frontend Module (Amplify MFE)
# 5 independent SPA apps (shell + 4 remotes)
# Replaces ECS Fargate + ALB
# ============================================

locals {
  mfe_apps = {
    shell = {
      name      = "${var.project_name}-mfe-shell"
      app_root  = "frontend/microfrontends/shell"
      port      = 5000
      subdomain = ""  # root domain: fastmeals.com.br
      env_vars = {
        VITE_API_URL      = var.api_gateway_url
        VITE_ORDERS_URL   = var.domain_name != "" ? "https://orders-mfe.${var.domain_name}/assets/remoteEntry.js" : ""
        # VITE_PRODUCTS_URL = var.domain_name != "" ? "https://products-mfe.${var.domain_name}/assets/remoteEntry.js" : ""
        # VITE_DELIVERY_URL = var.domain_name != "" ? "https://delivery-mfe.${var.domain_name}/assets/remoteEntry.js" : ""
        # VITE_REPORTS_URL  = var.domain_name != "" ? "https://reports-mfe.${var.domain_name}/assets/remoteEntry.js" : ""
      }
    }
    orders = {
      name      = "${var.project_name}-mfe-orders"
      app_root  = "frontend/microfrontends/remote-orders"
      port      = 5001
      subdomain = "orders-mfe"
      env_vars = {
        VITE_API_URL = var.api_gateway_url
      }
    }
    # products = {
    #   name      = "${var.project_name}-mfe-products"
    #   app_root  = "frontend/microfrontends/remote-products"
    #   port      = 5002
    #   subdomain = "products-mfe"
    #   env_vars = {
    #     VITE_API_URL = var.api_gateway_url
    #   }
    # }
    # delivery = {
    #   name      = "${var.project_name}-mfe-delivery"
    #   app_root  = "frontend/microfrontends/remote-delivery"
    #   port      = 5003
    #   subdomain = "delivery-mfe"
    #   env_vars = {
    #     VITE_API_URL = var.api_gateway_url
    #   }
    # }
    # reports = {
    #   name      = "${var.project_name}-mfe-reports"
    #   app_root  = "frontend/microfrontends/remote-reports"
    #   port      = 5004
    #   subdomain = "reports-mfe"
    #   env_vars = {
    #     VITE_API_URL = var.api_gateway_url
    #   }
    # }
  }
}

# --- Amplify Apps (one per microfrontend) ---
resource "aws_amplify_app" "mfe" {
  for_each = local.mfe_apps

  name       = each.value.name
  repository = var.repository_url

  access_token = var.github_access_token

  platform = "WEB"

  custom_headers = <<-HEADERS
    customHeaders:
      - pattern: '**/*'
        headers:
          - key: 'Access-Control-Allow-Origin'
            value: '*'
          - key: 'Access-Control-Allow-Methods'
            value: 'GET, OPTIONS'
          - key: 'Access-Control-Allow-Headers'
            value: 'Content-Type'
  HEADERS

  build_spec = <<-YAML
    version: 1
    frontend:
      phases:
        preBuild:
          commands:
            - cd ${each.value.app_root} && npm install
        build:
          commands:
            - cd ${each.value.app_root} && npm run build
      artifacts:
        baseDirectory: ${each.value.app_root}/dist
        files:
          - '**/*'
      cache:
        paths:
          - ${each.value.app_root}/node_modules/**/*
  YAML

  environment_variables = each.value.env_vars

  custom_rule {
    source = "</^[^.]+$|\\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json)$)([^.]+$)/>"
    status = "200"
    target = "/index.html"
  }

  tags = {
    Name        = each.value.name
    Environment = var.environment
    ManagedBy   = "terraform"
    MFERole     = each.key == "shell" ? "host" : "remote"
  }
}

# --- Branch deployment ---
resource "aws_amplify_branch" "mfe" {
  for_each = local.mfe_apps

  app_id      = aws_amplify_app.mfe[each.key].id
  branch_name = var.branch_name

  framework = "React"
  stage     = var.branch_name == "main" ? "PRODUCTION" : "DEVELOPMENT"

  environment_variables = each.value.env_vars

  tags = {
    Name   = "${each.value.name}-${var.branch_name}"
    Branch = var.branch_name
  }
}

# --- Domain Association ---
# Shell gets root domain (fastmeals.com.br)
# Remotes get subdomains (orders-mfe.fastmeals.com.br, etc.)
resource "aws_amplify_domain_association" "mfe" {
  for_each = var.domain_name != "" ? local.mfe_apps : {}

  app_id      = aws_amplify_app.mfe[each.key].id
  domain_name = var.domain_name

  sub_domain {
    branch_name = aws_amplify_branch.mfe[each.key].branch_name
    prefix      = each.value.subdomain
  }

  wait_for_verification = false
}