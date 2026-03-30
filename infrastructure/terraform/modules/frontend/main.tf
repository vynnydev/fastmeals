# ============================================
# FastMeals — Frontend Module (Amplify MFE)
# Single Amplify app that builds all 5 microfrontends
# Shell + 4 remotes consolidated in one build
# ============================================
# NOTE: When Amplify quota is increased (>25 apps),
# this can be split into 5 independent apps.
# ============================================

resource "aws_amplify_app" "frontend" {
  name       = "${var.project_name}-mfe-shell"
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

  # Consolidated build: builds all 4 remotes + shell,
  # then copies remote assets into shell/dist/remotes/
  build_spec = <<-YAML
    version: 1
    frontend:
      phases:
        preBuild:
          commands:
            - cd $CODEBUILD_SRC_DIR/fastmeals/frontend/microfrontends/remote-orders && npm install
            - cd $CODEBUILD_SRC_DIR/fastmeals/frontend/microfrontends/remote-products && npm install
            - cd $CODEBUILD_SRC_DIR/fastmeals/frontend/microfrontends/remote-delivery && npm install
            - cd $CODEBUILD_SRC_DIR/fastmeals/frontend/microfrontends/remote-reports && npm install
            - cd $CODEBUILD_SRC_DIR/fastmeals/frontend/microfrontends/shell && npm install
        build:
          commands:
            - cd $CODEBUILD_SRC_DIR/fastmeals/frontend/microfrontends/remote-orders && npm run build
            - cd $CODEBUILD_SRC_DIR/fastmeals/frontend/microfrontends/remote-products && npm run build
            - cd $CODEBUILD_SRC_DIR/fastmeals/frontend/microfrontends/remote-delivery && npm run build
            - cd $CODEBUILD_SRC_DIR/fastmeals/frontend/microfrontends/remote-reports && npm run build
            - cd $CODEBUILD_SRC_DIR/fastmeals/frontend/microfrontends/shell && npm run build
            - mkdir -p $CODEBUILD_SRC_DIR/fastmeals/frontend/microfrontends/shell/dist/remotes/orders/assets
            - mkdir -p $CODEBUILD_SRC_DIR/fastmeals/frontend/microfrontends/shell/dist/remotes/products/assets
            - mkdir -p $CODEBUILD_SRC_DIR/fastmeals/frontend/microfrontends/shell/dist/remotes/delivery/assets
            - mkdir -p $CODEBUILD_SRC_DIR/fastmeals/frontend/microfrontends/shell/dist/remotes/reports/assets
            - cp -r $CODEBUILD_SRC_DIR/fastmeals/frontend/microfrontends/remote-orders/dist/assets/* $CODEBUILD_SRC_DIR/fastmeals/frontend/microfrontends/shell/dist/remotes/orders/assets/
            - cp -r $CODEBUILD_SRC_DIR/fastmeals/frontend/microfrontends/remote-products/dist/assets/* $CODEBUILD_SRC_DIR/fastmeals/frontend/microfrontends/shell/dist/remotes/products/assets/
            - cp -r $CODEBUILD_SRC_DIR/fastmeals/frontend/microfrontends/remote-delivery/dist/assets/* $CODEBUILD_SRC_DIR/fastmeals/frontend/microfrontends/shell/dist/remotes/delivery/assets/
            - cp -r $CODEBUILD_SRC_DIR/fastmeals/frontend/microfrontends/remote-reports/dist/assets/* $CODEBUILD_SRC_DIR/fastmeals/frontend/microfrontends/shell/dist/remotes/reports/assets/
      artifacts:
        baseDirectory: frontend/microfrontends/shell/dist
        files:
          - '**/*'
      cache:
        paths:
          - frontend/microfrontends/shell/node_modules/**/*
          - frontend/microfrontends/remote-orders/node_modules/**/*
          - frontend/microfrontends/remote-products/node_modules/**/*
          - frontend/microfrontends/remote-delivery/node_modules/**/*
          - frontend/microfrontends/remote-reports/node_modules/**/*
  YAML

  environment_variables = {
    VITE_API_URL      = var.api_gateway_url
    VITE_ORDERS_URL   = "/remotes/orders/assets/remoteEntry.js"
    VITE_PRODUCTS_URL = "/remotes/products/assets/remoteEntry.js"
    VITE_DELIVERY_URL = "/remotes/delivery/assets/remoteEntry.js"
    VITE_REPORTS_URL  = "/remotes/reports/assets/remoteEntry.js"
  }

  custom_rule {
    source = "</^[^.]+$|\\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json)$)([^.]+$)/>"
    status = "200"
    target = "/index.html"
  }

  tags = {
    Name        = "${var.project_name}-mfe-shell"
    Environment = var.environment
    ManagedBy   = "terraform"
    MFERole     = "consolidated-host"
  }
}

# --- Branch deployment ---
resource "aws_amplify_branch" "frontend" {
  app_id      = aws_amplify_app.frontend.id
  branch_name = var.branch_name

  framework = "React"
  stage     = var.branch_name == "main" ? "PRODUCTION" : "DEVELOPMENT"

  environment_variables = {
    VITE_API_URL      = var.api_gateway_url
    VITE_ORDERS_URL   = "/remotes/orders/assets/remoteEntry.js"
    VITE_PRODUCTS_URL = "/remotes/products/assets/remoteEntry.js"
    VITE_DELIVERY_URL = "/remotes/delivery/assets/remoteEntry.js"
    VITE_REPORTS_URL  = "/remotes/reports/assets/remoteEntry.js"
  }

  tags = {
    Name   = "${var.project_name}-mfe-${var.branch_name}"
    Branch = var.branch_name
  }
}

# --- Domain Association ---
resource "aws_amplify_domain_association" "frontend" {
  count = var.domain_name != "" ? 1 : 0

  app_id      = aws_amplify_app.frontend.id
  domain_name = var.domain_name

  sub_domain {
    branch_name = aws_amplify_branch.frontend.branch_name
    prefix      = ""
  }

  wait_for_verification = false
}
