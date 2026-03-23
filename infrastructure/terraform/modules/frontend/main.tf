# ============================================
# FastMeals — Frontend Module
# AWS Amplify for Next.js 15
# ============================================

# --- Amplify App ---
resource "aws_amplify_app" "frontend" {
  name       = "${var.project_name}-frontend"
  repository = var.github_repository

  access_token = var.github_access_token

build_spec = <<-EOT
    version: 1
    applications:
      - appRoot: frontend
        frontend:
          phases:
            preBuild:
              commands:
                - nvm use 20
                - node -v
                - npm ci
            build:
              commands:
                - NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL npm run build
          artifacts:
            baseDirectory: .next
            files:
              - '**/*'
          cache:
            paths:
              - node_modules/**/*
              - .next/cache/**/*
  EOT

  platform = "WEB_COMPUTE"

  environment_variables = {
    NEXT_PUBLIC_API_URL       = var.api_gateway_url
    NODE_ENV                  = "production"
    AMPLIFY_MONOREPO_APP_ROOT = "frontend"
    _CUSTOM_IMAGE             = "amplify:al2023"
    AMPLIFY_NODE_VERSION      = "20"
  }

  custom_rule {
    source = "/<*>"
    status = "404-200"
    target = "/index.html"
  }

  tags = {
    Name = "${var.project_name}-frontend"
  }
}

# --- Branch: main/development ---
resource "aws_amplify_branch" "main" {
  app_id      = aws_amplify_app.frontend.id
  branch_name = var.branch_name

  framework = "Next.js - SSR"

  environment_variables = {
    NEXT_PUBLIC_API_URL = var.api_gateway_url
  }

  tags = {
    Name = "${var.project_name}-${var.branch_name}"
  }
}

# --- Custom Domain (optional) ---
resource "aws_amplify_domain_association" "main" {
  count = var.domain_name != "" ? 1 : 0

  app_id      = aws_amplify_app.frontend.id
  domain_name = var.domain_name

  sub_domain {
    branch_name = aws_amplify_branch.main.branch_name
    prefix      = ""
  }

  sub_domain {
    branch_name = aws_amplify_branch.main.branch_name
    prefix      = "www"
  }
}