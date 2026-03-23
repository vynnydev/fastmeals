# ============================================
# FastMeals — Lambda Module
# 20 Lambda functions + API Gateway HTTP API
# ============================================

# --- IAM Role for Lambda ---
resource "aws_iam_role" "lambda_exec" {
  name = "${var.project_name}-lambda-exec-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "${var.project_name}-lambda-exec-role"
  }
}

# --- IAM Policy: CloudWatch Logs ---
resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# --- IAM Policy: VPC Access ---
resource "aws_iam_role_policy_attachment" "lambda_vpc" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

# --- IAM Policy: Secrets Manager ---
resource "aws_iam_role_policy" "lambda_secrets" {
  name = "${var.project_name}-lambda-secrets-policy"
  role = aws_iam_role.lambda_exec.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ]
        Resource = var.secret_arns
      }
    ]
  })
}

# --- IAM Policy: Bedrock (for reports-service) ---
resource "aws_iam_role_policy" "lambda_bedrock" {
  name = "${var.project_name}-lambda-bedrock-policy"
  role = aws_iam_role.lambda_exec.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "bedrock:InvokeModel",
          "bedrock:InvokeModelWithResponseStream"
        ]
        Resource = "arn:aws:bedrock:${var.aws_region}::foundation-model/*"
      }
    ]
  })
}

# --- CloudWatch Log Groups ---
resource "aws_cloudwatch_log_group" "lambda" {
  for_each = toset(local.all_function_names)

  name              = "/aws/lambda/${each.value}"
  retention_in_days = 14

  tags = {
    Name = each.value
  }
}

# ============================================
# Lambda Functions — Definitions
# ============================================

locals {
  common_env = {
    NODE_ENV           = "production"
    AWS_REGION_CUSTOM  = var.aws_region
    RDS_ENDPOINT       = var.rds_endpoint
    REDIS_URL          = var.redis_url
    RABBITMQ_URL       = var.rabbitmq_url
    JWT_SECRET_ARN     = var.jwt_secret_arn
    CORS_ORIGIN        = var.cors_origin
  }

  services = {
    auth = {
      handlers = {
        login         = { method = "POST", path = "/api/auth/login" }
        refresh_token = { method = "POST", path = "/api/auth/refresh-token" }
      }
      env_extra = {
        DATABASE_URL    = var.database_urls.auth
        REDIS_URL       = var.redis_url
        SERVICE_NAME    = "auth-service"
      }
    }
    products = {
      handlers = {
        list   = { method = "GET",    path = "/api/products" }
        get    = { method = "GET",    path = "/api/products/{id}" }
        create = { method = "POST",   path = "/api/products" }
        update = { method = "PUT",    path = "/api/products/{id}" }
        delete = { method = "DELETE", path = "/api/products/{id}" }
      }
      env_extra = {
        DATABASE_URL = var.database_urls.products
        SERVICE_NAME = "products-service"
      }
    }
    orders = {
      handlers = {
        list          = { method = "GET",   path = "/api/orders" }
        get           = { method = "GET",   path = "/api/orders/{id}" }
        create        = { method = "POST",  path = "/api/orders" }
        update_status = { method = "PATCH", path = "/api/orders/{id}/status" }
        assign        = { method = "PATCH", path = "/api/orders/{id}/assign" }
      }
      env_extra = {
        DATABASE_URL         = var.database_urls.orders
        PRODUCTS_SERVICE_URL = "https://${aws_apigatewayv2_api.main.id}.execute-api.${var.aws_region}.amazonaws.com"
        DELIVERY_SERVICE_URL = "https://${aws_apigatewayv2_api.main.id}.execute-api.${var.aws_region}.amazonaws.com"
        RABBITMQ_URL         = var.rabbitmq_url
        SERVICE_NAME         = "orders-service"
      }
    }
    delivery = {
      handlers = {
        list   = { method = "GET",    path = "/api/delivery-persons" }
        get    = { method = "GET",    path = "/api/delivery-persons/{id}" }
        create = { method = "POST",   path = "/api/delivery-persons" }
        update = { method = "PUT",    path = "/api/delivery-persons/{id}" }
        delete = { method = "DELETE", path = "/api/delivery-persons/{id}" }
      }
      env_extra = {
        DATABASE_URL       = var.database_urls.delivery
        ORDERS_SERVICE_URL = "https://${aws_apigatewayv2_api.main.id}.execute-api.${var.aws_region}.amazonaws.com"
        RABBITMQ_URL       = var.rabbitmq_url
        SERVICE_NAME       = "delivery-service"
      }
    }
    optimization = {
      handlers = {
        execute = { method = "POST", path = "/api/orders/optimize-assignment" }
      }
      env_extra = {
        ORDERS_SERVICE_URL   = "https://${aws_apigatewayv2_api.main.id}.execute-api.${var.aws_region}.amazonaws.com"
        DELIVERY_SERVICE_URL = "https://${aws_apigatewayv2_api.main.id}.execute-api.${var.aws_region}.amazonaws.com"
        SERVICE_NAME         = "optimization-service"
      }
    }
    reports = {
      handlers = {
        revenue       = { method = "GET", path = "/api/reports/revenue" }
        orders_status = { method = "GET", path = "/api/reports/orders-by-status" }
        top_products  = { method = "GET", path = "/api/reports/top-products" }
        delivery_time = { method = "GET", path = "/api/reports/average-delivery-time" }
        ai_insights   = { method = "GET", path = "/api/reports/ai-insights" }
      }
      env_extra = {
        DATABASE_URL     = var.database_urls.reports
        BEDROCK_MODEL_ID = var.bedrock_model_id
        SERVICE_NAME     = "reports-service"
      }
    }
  }

  # Flatten all functions into a single map
  all_functions = merge([
    for service_key, service in local.services : {
      for handler_key, handler in service.handlers :
      "${service_key}-${handler_key}" => {
        service      = service_key
        handler_key  = handler_key
        method       = handler.method
        path         = handler.path
        env_extra    = service.env_extra
      }
    }
  ]...)

  all_function_names = [for k, v in local.all_functions : "${var.project_name}-${k}"]
}

# --- Placeholder Lambda (zip vazio — será atualizado via CI/CD) ---
data "archive_file" "placeholder" {
  type        = "zip"
  output_path = "${path.module}/placeholder.zip"

  source {
    content  = "exports.handler = async () => ({ statusCode: 501, body: JSON.stringify({ message: 'Not deployed yet' }) });"
    filename = "index.js"
  }
}

# --- Lambda Functions ---
resource "aws_lambda_function" "handlers" {
  for_each = local.all_functions

  function_name = "${var.project_name}-${each.key}"
  role          = aws_iam_role.lambda_exec.arn
  handler       = "dist/src/lambda/${each.value.service}-${each.value.handler_key}.handler.handler"
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
    variables = merge(local.common_env, each.value.env_extra)
  }

  depends_on = [
    aws_cloudwatch_log_group.lambda,
    aws_iam_role_policy_attachment.lambda_logs,
    aws_iam_role_policy_attachment.lambda_vpc,
  ]

  tags = {
    Name    = "${var.project_name}-${each.key}"
    Service = "${each.value.service}-service"
  }
}

# ============================================
# API Gateway HTTP API
# ============================================

resource "aws_apigatewayv2_api" "main" {
  name          = "${var.project_name}-api"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = [var.cors_origin, "https://${var.domain_name}"]
    allow_methods = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
    allow_headers = ["Content-Type", "Authorization"]
    max_age       = 86400
  }

  tags = {
    Name = "${var.project_name}-api"
  }
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.main.id
  name        = "$default"
  auto_deploy = true

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_gw.arn
    format = jsonencode({
      requestId      = "$context.requestId"
      ip             = "$context.identity.sourceIp"
      method         = "$context.httpMethod"
      path           = "$context.path"
      status         = "$context.status"
      responseLength = "$context.responseLength"
      latency        = "$context.responseLatency"
    })
  }
}

resource "aws_cloudwatch_log_group" "api_gw" {
  name              = "/aws/apigateway/${var.project_name}-api"
  retention_in_days = 14
}

# --- Integrations + Routes ---
resource "aws_apigatewayv2_integration" "lambda" {
  for_each = local.all_functions

  api_id             = aws_apigatewayv2_api.main.id
  integration_type   = "AWS_PROXY"
  integration_uri    = aws_lambda_function.handlers[each.key].invoke_arn
  integration_method = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "lambda" {
  for_each = local.all_functions

  api_id    = aws_apigatewayv2_api.main.id
  route_key = "${each.value.method} ${each.value.path}"
  target    = "integrations/${aws_apigatewayv2_integration.lambda[each.key].id}"
}

# --- Lambda Permissions for API Gateway ---
resource "aws_lambda_permission" "api_gw" {
  for_each = local.all_functions

  statement_id  = "AllowAPIGateway-${each.key}"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.handlers[each.key].function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}