# ============================================
# FastMeals — Lambda Module
# 20 Lambda functions (sem API Gateway)
# ============================================

# --- IAM Role ---
resource "aws_iam_role" "lambda_exec" {
  name = "${var.project_name}-lambda-exec-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy_attachment" "lambda_vpc" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

resource "aws_iam_role_policy" "lambda_secrets" {
  name = "${var.project_name}-lambda-secrets"
  role = aws_iam_role.lambda_exec.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["secretsmanager:GetSecretValue", "secretsmanager:DescribeSecret"]
      Resource = var.secret_arns
    }]
  })
}

resource "aws_iam_role_policy" "lambda_bedrock" {
  name = "${var.project_name}-lambda-bedrock"
  role = aws_iam_role.lambda_exec.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["bedrock:InvokeModel", "bedrock:InvokeModelWithResponseStream"]
      Resource = "arn:aws:bedrock:${var.aws_region}::foundation-model/*"
    }]
  })
}

# --- Function Definitions ---
locals {
  functions = {
    # Auth Service
    "auth-login"           = { handler = "dist/src/lambda/auth-login.handler.handler",          env = { DATABASE_URL = var.database_urls.auth, REDIS_URL = var.redis_url, SERVICE_NAME = "auth-service" } }
    "auth-refresh_token"   = { handler = "dist/src/lambda/auth-refresh-token.handler.handler",  env = { DATABASE_URL = var.database_urls.auth, REDIS_URL = var.redis_url, SERVICE_NAME = "auth-service" } }

    # Products Service
    "products-list"   = { handler = "dist/src/lambda/products-list.handler.handler",   env = { DATABASE_URL = var.database_urls.products, SERVICE_NAME = "products-service" } }
    "products-get"    = { handler = "dist/src/lambda/products-get.handler.handler",    env = { DATABASE_URL = var.database_urls.products, SERVICE_NAME = "products-service" } }
    "products-create" = { handler = "dist/src/lambda/products-create.handler.handler", env = { DATABASE_URL = var.database_urls.products, SERVICE_NAME = "products-service" } }
    "products-update" = { handler = "dist/src/lambda/products-update.handler.handler", env = { DATABASE_URL = var.database_urls.products, SERVICE_NAME = "products-service" } }
    "products-delete" = { handler = "dist/src/lambda/products-delete.handler.handler", env = { DATABASE_URL = var.database_urls.products, SERVICE_NAME = "products-service" } }

    # Orders Service
    "orders-list"          = { handler = "dist/src/lambda/orders-list.handler.handler",              env = { DATABASE_URL = var.database_urls.orders, RABBITMQ_URL = var.rabbitmq_url, SERVICE_NAME = "orders-service" } }
    "orders-get"           = { handler = "dist/src/lambda/orders-get.handler.handler",               env = { DATABASE_URL = var.database_urls.orders, SERVICE_NAME = "orders-service" } }
    "orders-create"        = { handler = "dist/src/lambda/orders-create.handler.handler",            env = { DATABASE_URL = var.database_urls.orders, RABBITMQ_URL = var.rabbitmq_url, SERVICE_NAME = "orders-service" } }
    "orders-update_status" = { handler = "dist/src/lambda/orders-update-status.handler.handler",     env = { DATABASE_URL = var.database_urls.orders, RABBITMQ_URL = var.rabbitmq_url, SERVICE_NAME = "orders-service" } }
    "orders-assign"        = { handler = "dist/src/lambda/orders-assign-delivery.handler.handler",   env = { DATABASE_URL = var.database_urls.orders, SERVICE_NAME = "orders-service" } }

    # Delivery Service
    "delivery-list"   = { handler = "dist/src/lambda/delivery-list.handler.handler",   env = { DATABASE_URL = var.database_urls.delivery, RABBITMQ_URL = var.rabbitmq_url, SERVICE_NAME = "delivery-service" } }
    "delivery-get"    = { handler = "dist/src/lambda/delivery-get.handler.handler",    env = { DATABASE_URL = var.database_urls.delivery, SERVICE_NAME = "delivery-service" } }
    "delivery-create" = { handler = "dist/src/lambda/delivery-create.handler.handler", env = { DATABASE_URL = var.database_urls.delivery, SERVICE_NAME = "delivery-service" } }
    "delivery-update" = { handler = "dist/src/lambda/delivery-update.handler.handler", env = { DATABASE_URL = var.database_urls.delivery, SERVICE_NAME = "delivery-service" } }
    "delivery-delete" = { handler = "dist/src/lambda/delivery-delete.handler.handler", env = { DATABASE_URL = var.database_urls.delivery, SERVICE_NAME = "delivery-service" } }

    # Optimization Service (stateless)
    "optimization-execute" = { handler = "dist/src/lambda/optimization-execute.handler.handler", env = { SERVICE_NAME = "optimization-service" } }

    # Reports Service
    "reports-revenue"       = { handler = "dist/src/lambda/reports-revenue.handler.handler",           env = { DATABASE_URL = var.database_urls.reports, SERVICE_NAME = "reports-service" } }
    "reports-orders_status" = { handler = "dist/src/lambda/reports-orders-by-status.handler.handler",  env = { DATABASE_URL = var.database_urls.reports, SERVICE_NAME = "reports-service" } }
    "reports-top_products"  = { handler = "dist/src/lambda/reports-top-products.handler.handler",      env = { DATABASE_URL = var.database_urls.reports, SERVICE_NAME = "reports-service" } }
    "reports-delivery_time" = { handler = "dist/src/lambda/reports-avg-delivery.handler.handler",      env = { DATABASE_URL = var.database_urls.reports, SERVICE_NAME = "reports-service" } }
    "reports-ai_insights"   = { handler = "dist/src/lambda/reports-ai-insights.handler.handler",       env = { DATABASE_URL = var.database_urls.reports, BEDROCK_MODEL_ID = var.bedrock_model_id, SERVICE_NAME = "reports-service" } }
  }
}

# --- Placeholder zip ---
data "archive_file" "placeholder" {
  type        = "zip"
  output_path = "${path.module}/placeholder.zip"

  source {
    content  = "exports.handler = async () => ({ statusCode: 501, body: JSON.stringify({ message: 'Not deployed yet' }) });"
    filename = "index.js"
  }
}

# --- CloudWatch Log Groups ---
resource "aws_cloudwatch_log_group" "lambda" {
  for_each = local.functions

  name              = "/aws/lambda/${var.project_name}-${each.key}"
  retention_in_days = 14
}

# --- Lambda Functions ---
resource "aws_lambda_function" "handlers" {
  for_each = local.functions

  function_name = "${var.project_name}-${each.key}"
  role          = aws_iam_role.lambda_exec.arn
  handler       = "dist/src/lambda/${each.value.handler}"
  runtime       = "nodejs20.x"
  timeout       = 30
  memory_size   = 256

  filename         = data.archive_file.placeholder.output_path
  source_code_hash = data.archive_file.placeholder.output_base64sha256

  vpc_config {
    subnet_ids         = var.private_subnet_ids
    security_group_ids = [var.lambda_security_group_id]
  }

  environment {
    variables = merge(
      {
        NODE_ENV          = "production"
        AWS_REGION_CUSTOM = var.aws_region
        CORS_ORIGIN       = var.cors_origin
        JWT_SECRET_ARN    = var.jwt_secret_arn
      },
      each.value.env
    )
  }

  depends_on = [
    aws_cloudwatch_log_group.lambda,
    aws_iam_role_policy_attachment.lambda_logs,
    aws_iam_role_policy_attachment.lambda_vpc,
  ]

  tags = {
    Name    = "${var.project_name}-${each.key}"
    Service = split("-", each.key)[0]
  }
}