# ============================================
# FastMeals — API Gateway Module
# HTTP API com routes para 20 Lambda functions
# ============================================

# --- API Gateway HTTP API ---
resource "aws_apigatewayv2_api" "main" {
  name          = "${var.project_name}-api"
  protocol_type = "HTTP"
  description   = "FastMeals API Gateway — routes to ${length(var.lambda_functions)} Lambda functions"

  cors_configuration {
    allow_origins = var.cors_origins
    allow_methods = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
    allow_headers = ["Content-Type", "Authorization", "X-Requested-With"]
    expose_headers = ["X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset"]
    max_age       = 86400
  }

  tags = {
    Name = "${var.project_name}-api"
  }
}

# --- Stage (auto-deploy) ---
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
      userAgent      = "$context.identity.userAgent"
      errorMessage   = "$context.error.message"
    })
  }

  default_route_settings {
    throttling_burst_limit = 100
    throttling_rate_limit  = 50
  }

  tags = {
    Name = "${var.project_name}-api-default"
  }
}

# --- CloudWatch Log Group ---
resource "aws_cloudwatch_log_group" "api_gw" {
  name              = "/aws/apigateway/${var.project_name}-api"
  retention_in_days = 14

  tags = {
    Name = "${var.project_name}-api-logs"
  }
}

# ============================================
# Routes — Auth Service
# ============================================

resource "aws_apigatewayv2_integration" "auth_login" {
  api_id             = aws_apigatewayv2_api.main.id
  integration_type   = "AWS_PROXY"
  integration_uri    = var.lambda_functions["auth-login"].invoke_arn
  integration_method = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "auth_login" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "POST /api/auth/login"
  target    = "integrations/${aws_apigatewayv2_integration.auth_login.id}"
}

resource "aws_apigatewayv2_integration" "auth_refresh" {
  api_id             = aws_apigatewayv2_api.main.id
  integration_type   = "AWS_PROXY"
  integration_uri    = var.lambda_functions["auth-refresh_token"].invoke_arn
  integration_method = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "auth_refresh" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "POST /api/auth/refresh-token"
  target    = "integrations/${aws_apigatewayv2_integration.auth_refresh.id}"
}

# ============================================
# Routes — Products Service
# ============================================

resource "aws_apigatewayv2_integration" "products_list" {
  api_id             = aws_apigatewayv2_api.main.id
  integration_type   = "AWS_PROXY"
  integration_uri    = var.lambda_functions["products-list"].invoke_arn
  integration_method = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "products_list" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "GET /api/products"
  target    = "integrations/${aws_apigatewayv2_integration.products_list.id}"
}

resource "aws_apigatewayv2_integration" "products_get" {
  api_id             = aws_apigatewayv2_api.main.id
  integration_type   = "AWS_PROXY"
  integration_uri    = var.lambda_functions["products-get"].invoke_arn
  integration_method = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "products_get" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "GET /api/products/{id}"
  target    = "integrations/${aws_apigatewayv2_integration.products_get.id}"
}

resource "aws_apigatewayv2_integration" "products_create" {
  api_id             = aws_apigatewayv2_api.main.id
  integration_type   = "AWS_PROXY"
  integration_uri    = var.lambda_functions["products-create"].invoke_arn
  integration_method = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "products_create" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "POST /api/products"
  target    = "integrations/${aws_apigatewayv2_integration.products_create.id}"
}

resource "aws_apigatewayv2_integration" "products_update" {
  api_id             = aws_apigatewayv2_api.main.id
  integration_type   = "AWS_PROXY"
  integration_uri    = var.lambda_functions["products-update"].invoke_arn
  integration_method = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "products_update" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "PUT /api/products/{id}"
  target    = "integrations/${aws_apigatewayv2_integration.products_update.id}"
}

resource "aws_apigatewayv2_integration" "products_delete" {
  api_id             = aws_apigatewayv2_api.main.id
  integration_type   = "AWS_PROXY"
  integration_uri    = var.lambda_functions["products-delete"].invoke_arn
  integration_method = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "products_delete" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "DELETE /api/products/{id}"
  target    = "integrations/${aws_apigatewayv2_integration.products_delete.id}"
}

# ============================================
# Routes — Orders Service
# ============================================

resource "aws_apigatewayv2_integration" "orders_list" {
  api_id             = aws_apigatewayv2_api.main.id
  integration_type   = "AWS_PROXY"
  integration_uri    = var.lambda_functions["orders-list"].invoke_arn
  integration_method = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "orders_list" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "GET /api/orders"
  target    = "integrations/${aws_apigatewayv2_integration.orders_list.id}"
}

resource "aws_apigatewayv2_integration" "orders_get" {
  api_id             = aws_apigatewayv2_api.main.id
  integration_type   = "AWS_PROXY"
  integration_uri    = var.lambda_functions["orders-get"].invoke_arn
  integration_method = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "orders_get" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "GET /api/orders/{id}"
  target    = "integrations/${aws_apigatewayv2_integration.orders_get.id}"
}

resource "aws_apigatewayv2_integration" "orders_create" {
  api_id             = aws_apigatewayv2_api.main.id
  integration_type   = "AWS_PROXY"
  integration_uri    = var.lambda_functions["orders-create"].invoke_arn
  integration_method = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "orders_create" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "POST /api/orders"
  target    = "integrations/${aws_apigatewayv2_integration.orders_create.id}"
}

resource "aws_apigatewayv2_integration" "orders_update_status" {
  api_id             = aws_apigatewayv2_api.main.id
  integration_type   = "AWS_PROXY"
  integration_uri    = var.lambda_functions["orders-update_status"].invoke_arn
  integration_method = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "orders_update_status" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "PATCH /api/orders/{id}/status"
  target    = "integrations/${aws_apigatewayv2_integration.orders_update_status.id}"
}

resource "aws_apigatewayv2_integration" "orders_assign" {
  api_id             = aws_apigatewayv2_api.main.id
  integration_type   = "AWS_PROXY"
  integration_uri    = var.lambda_functions["orders-assign"].invoke_arn
  integration_method = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "orders_assign" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "PATCH /api/orders/{id}/assign"
  target    = "integrations/${aws_apigatewayv2_integration.orders_assign.id}"
}

# ============================================
# Routes — Optimization Service
# ============================================

resource "aws_apigatewayv2_integration" "optimization_execute" {
  api_id             = aws_apigatewayv2_api.main.id
  integration_type   = "AWS_PROXY"
  integration_uri    = var.lambda_functions["optimization-execute"].invoke_arn
  integration_method = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "optimization_execute" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "POST /api/orders/optimize-assignment"
  target    = "integrations/${aws_apigatewayv2_integration.optimization_execute.id}"
}

# ============================================
# Routes — Delivery Service
# ============================================

resource "aws_apigatewayv2_integration" "delivery_list" {
  api_id             = aws_apigatewayv2_api.main.id
  integration_type   = "AWS_PROXY"
  integration_uri    = var.lambda_functions["delivery-list"].invoke_arn
  integration_method = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "delivery_list" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "GET /api/delivery-persons"
  target    = "integrations/${aws_apigatewayv2_integration.delivery_list.id}"
}

resource "aws_apigatewayv2_integration" "delivery_get" {
  api_id             = aws_apigatewayv2_api.main.id
  integration_type   = "AWS_PROXY"
  integration_uri    = var.lambda_functions["delivery-get"].invoke_arn
  integration_method = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "delivery_get" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "GET /api/delivery-persons/{id}"
  target    = "integrations/${aws_apigatewayv2_integration.delivery_get.id}"
}

resource "aws_apigatewayv2_integration" "delivery_create" {
  api_id             = aws_apigatewayv2_api.main.id
  integration_type   = "AWS_PROXY"
  integration_uri    = var.lambda_functions["delivery-create"].invoke_arn
  integration_method = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "delivery_create" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "POST /api/delivery-persons"
  target    = "integrations/${aws_apigatewayv2_integration.delivery_create.id}"
}

resource "aws_apigatewayv2_integration" "delivery_update" {
  api_id             = aws_apigatewayv2_api.main.id
  integration_type   = "AWS_PROXY"
  integration_uri    = var.lambda_functions["delivery-update"].invoke_arn
  integration_method = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "delivery_update" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "PUT /api/delivery-persons/{id}"
  target    = "integrations/${aws_apigatewayv2_integration.delivery_update.id}"
}

resource "aws_apigatewayv2_integration" "delivery_delete" {
  api_id             = aws_apigatewayv2_api.main.id
  integration_type   = "AWS_PROXY"
  integration_uri    = var.lambda_functions["delivery-delete"].invoke_arn
  integration_method = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "delivery_delete" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "DELETE /api/delivery-persons/{id}"
  target    = "integrations/${aws_apigatewayv2_integration.delivery_delete.id}"
}

# ============================================
# Routes — Reports Service
# ============================================

resource "aws_apigatewayv2_integration" "reports_revenue" {
  api_id             = aws_apigatewayv2_api.main.id
  integration_type   = "AWS_PROXY"
  integration_uri    = var.lambda_functions["reports-revenue"].invoke_arn
  integration_method = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "reports_revenue" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "GET /api/reports/revenue"
  target    = "integrations/${aws_apigatewayv2_integration.reports_revenue.id}"
}

resource "aws_apigatewayv2_integration" "reports_orders_status" {
  api_id             = aws_apigatewayv2_api.main.id
  integration_type   = "AWS_PROXY"
  integration_uri    = var.lambda_functions["reports-orders_status"].invoke_arn
  integration_method = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "reports_orders_status" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "GET /api/reports/orders-by-status"
  target    = "integrations/${aws_apigatewayv2_integration.reports_orders_status.id}"
}

resource "aws_apigatewayv2_integration" "reports_top_products" {
  api_id             = aws_apigatewayv2_api.main.id
  integration_type   = "AWS_PROXY"
  integration_uri    = var.lambda_functions["reports-top_products"].invoke_arn
  integration_method = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "reports_top_products" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "GET /api/reports/top-products"
  target    = "integrations/${aws_apigatewayv2_integration.reports_top_products.id}"
}

resource "aws_apigatewayv2_integration" "reports_delivery_time" {
  api_id             = aws_apigatewayv2_api.main.id
  integration_type   = "AWS_PROXY"
  integration_uri    = var.lambda_functions["reports-delivery_time"].invoke_arn
  integration_method = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "reports_delivery_time" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "GET /api/reports/average-delivery-time"
  target    = "integrations/${aws_apigatewayv2_integration.reports_delivery_time.id}"
}

resource "aws_apigatewayv2_integration" "reports_ai_insights" {
  api_id             = aws_apigatewayv2_api.main.id
  integration_type   = "AWS_PROXY"
  integration_uri    = var.lambda_functions["reports-ai_insights"].invoke_arn
  integration_method = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "reports_ai_insights" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "GET /api/reports/ai-insights"
  target    = "integrations/${aws_apigatewayv2_integration.reports_ai_insights.id}"
}

# ============================================
# Lambda Permissions — Allow API Gateway invoke
# ============================================

resource "aws_lambda_permission" "api_gw" {
  for_each = var.lambda_functions

  statement_id  = "AllowAPIGateway-${each.key}"
  action        = "lambda:InvokeFunction"
  function_name = each.value.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}

# ============================================
# Health Check Route (sem Lambda)
# ============================================

resource "aws_apigatewayv2_route" "health" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "GET /health"
  target    = "integrations/${aws_apigatewayv2_integration.auth_login.id}"
}