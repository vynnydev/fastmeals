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

# --- Datadog Lambda Layers ---
locals {
  datadog_layers = var.datadog_enabled ? [
    "arn:aws:lambda:${var.aws_region}:464622532012:layer:Datadog-Node20-x:115",
    "arn:aws:lambda:${var.aws_region}:464622532012:layer:Datadog-Extension:65",
  ] : []

  datadog_env = var.datadog_enabled ? {
    DD_API_KEY                 = var.datadog_api_key
    DD_SITE                    = var.datadog_site
    DD_SERVERLESS_LOGS_ENABLED = "true"
    DD_CAPTURE_LAMBDA_PAYLOAD  = "true"
    DD_TRACE_ENABLED           = "true"
    DD_MERGE_XRAY_TRACES       = "false"
    DD_FLUSH_TO_LOG            = "true"
    DD_ENV                     = "production"
    DD_SERVICE                 = var.project_name
  } : {}
}

# --- Function Definitions ---
locals {
  # Common env vars for all functions
  common_env = {
    NODE_ENV          = "production"
    CORS_ORIGIN       = var.cors_origin
    JWT_ACCESS_SECRET = var.jwt_access_secret
  }

  functions = {
    # Auth Service
    "auth-login" = {
      handler = "auth-login-handler.handler"
      env = merge(local.common_env, {
        DATABASE_URL       = var.database_urls.auth
        REDIS_URL          = var.redis_url
        JWT_REFRESH_SECRET = var.jwt_refresh_secret
        SERVICE_NAME       = "auth-service"
      })
    }
    "auth-refresh_token" = {
      handler = "auth-refresh_token-handler.handler"
      env = merge(local.common_env, {
        DATABASE_URL       = var.database_urls.auth
        REDIS_URL          = var.redis_url
        JWT_REFRESH_SECRET = var.jwt_refresh_secret
        SERVICE_NAME       = "auth-service"
      })
    }

    # Products Service
    "products-list" = {
      handler = "products-list-handler.handler"
      env = merge(local.common_env, {
        DATABASE_URL = var.database_urls.products
        SERVICE_NAME = "products-service"
      })
    }
    "products-get" = {
      handler = "products-get-handler.handler"
      env = merge(local.common_env, {
        DATABASE_URL = var.database_urls.products
        SERVICE_NAME = "products-service"
      })
    }
    "products-create" = {
      handler = "products-create-handler.handler"
      env = merge(local.common_env, {
        DATABASE_URL = var.database_urls.products
        SERVICE_NAME = "products-service"
      })
    }
    "products-update" = {
      handler = "products-update-handler.handler"
      env = merge(local.common_env, {
        DATABASE_URL = var.database_urls.products
        SERVICE_NAME = "products-service"
      })
    }
    "products-delete" = {
      handler = "products-delete-handler.handler"
      env = merge(local.common_env, {
        DATABASE_URL = var.database_urls.products
        SERVICE_NAME = "products-service"
      })
    }

    # Orders Service
    "orders-list" = {
      handler = "orders-list-handler.handler"
      env = merge(local.common_env, {
        DATABASE_URL         = var.database_urls.orders
        RABBITMQ_URL         = var.rabbitmq_url
        PRODUCTS_SERVICE_URL = var.api_gateway_url
        DELIVERY_SERVICE_URL = var.api_gateway_url
        SERVICE_NAME         = "orders-service"
      })
    }
    "orders-get" = {
      handler = "orders-get-handler.handler"
      env = merge(local.common_env, {
        DATABASE_URL = var.database_urls.orders
        SERVICE_NAME = "orders-service"
      })
    }
    "orders-create" = {
      handler = "orders-create-handler.handler"
      env = merge(local.common_env, {
        DATABASE_URL         = var.database_urls.orders
        RABBITMQ_URL         = var.rabbitmq_url
        PRODUCTS_SERVICE_URL = var.api_gateway_url
        DELIVERY_SERVICE_URL = var.api_gateway_url
        SERVICE_NAME         = "orders-service"
      })
    }
    "orders-update_status" = {
      handler = "orders-update_status-handler.handler"
      env = merge(local.common_env, {
        DATABASE_URL         = var.database_urls.orders
        RABBITMQ_URL         = var.rabbitmq_url
        SERVICE_NAME         = "orders-service"
      })
    }
    "orders-assign" = {
      handler = "orders-assign-handler.handler"
      env = merge(local.common_env, {
        DATABASE_URL         = var.database_urls.orders
        DELIVERY_SERVICE_URL = var.api_gateway_url
        SERVICE_NAME         = "orders-service"
      })
    }

    # Delivery Service
    "delivery-list" = {
      handler = "delivery-list-handler.handler"
      env = merge(local.common_env, {
        DATABASE_URL = var.database_urls.delivery
        RABBITMQ_URL = var.rabbitmq_url
        SERVICE_NAME = "delivery-service"
      })
    }
    "delivery-get" = {
      handler = "delivery-get-handler.handler"
      env = merge(local.common_env, {
        DATABASE_URL = var.database_urls.delivery
        SERVICE_NAME = "delivery-service"
      })
    }
    "delivery-create" = {
      handler = "delivery-create-handler.handler"
      env = merge(local.common_env, {
        DATABASE_URL = var.database_urls.delivery
        SERVICE_NAME = "delivery-service"
      })
    }
    "delivery-update" = {
      handler = "delivery-update-handler.handler"
      env = merge(local.common_env, {
        DATABASE_URL = var.database_urls.delivery
        SERVICE_NAME = "delivery-service"
      })
    }
    "delivery-delete" = {
      handler = "delivery-delete-handler.handler"
      env = merge(local.common_env, {
        DATABASE_URL = var.database_urls.delivery
        SERVICE_NAME = "delivery-service"
      })
    }

    # Optimization Service (stateless)
    "optimization-execute" = {
      handler = "optimization-execute-handler.handler"
      env = merge(local.common_env, {
        ORDERS_SERVICE_URL   = var.api_gateway_url
        DELIVERY_SERVICE_URL = var.api_gateway_url
        SERVICE_NAME         = "optimization-service"
      })
    }

    # Reports Service
    "reports-revenue" = {
      handler = "reports-revenue-handler.handler"
      env = merge(local.common_env, {
        DATABASE_URL = var.database_urls.reports
        SERVICE_NAME = "reports-service"
      })
    }
    "reports-orders_status" = {
      handler = "reports-orders_status-handler.handler"
      env = merge(local.common_env, {
        DATABASE_URL = var.database_urls.reports
        SERVICE_NAME = "reports-service"
      })
    }
    "reports-top_products" = {
      handler = "reports-top_products-handler.handler"
      env = merge(local.common_env, {
        DATABASE_URL = var.database_urls.reports
        SERVICE_NAME = "reports-service"
      })
    }
    "reports-delivery_time" = {
      handler = "reports-delivery_time-handler.handler"
      env = merge(local.common_env, {
        DATABASE_URL = var.database_urls.reports
        SERVICE_NAME = "reports-service"
      })
    }
    "reports-ai_insights" = {
      handler = "reports-ai_insights-handler.handler"
      env = merge(local.common_env, {
        DATABASE_URL     = var.database_urls.reports
        BEDROCK_MODEL_ID = var.bedrock_model_id
        SERVICE_NAME     = "reports-service"
      })
    }
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
  handler       = each.value.handler
  runtime       = "nodejs20.x"
  timeout       = 30
  memory_size   = 256

  filename         = data.archive_file.placeholder.output_path
  source_code_hash = data.archive_file.placeholder.output_base64sha256

  vpc_config {
    subnet_ids         = var.private_subnet_ids
    security_group_ids = [var.lambda_security_group_id]
  }

  layers = local.datadog_layers

  environment {
    variables = merge(each.value.env, local.datadog_env)
  }

  # Ignore code changes (managed by deploy script, not Terraform)
  lifecycle {
    ignore_changes = [
      filename,
      source_code_hash,
      layers,
    ]
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