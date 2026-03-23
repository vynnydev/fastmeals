# ============================================
# FastMeals — Secrets Module
# AWS Secrets Manager for all sensitive data
# ============================================

# --- RDS Master Credentials ---
resource "aws_secretsmanager_secret" "rds_master" {
  name                    = "${var.project_name}/rds/master"
  description             = "RDS PostgreSQL master credentials"
  recovery_window_in_days = 0

  tags = {
    Name = "${var.project_name}-rds-master"
  }
}

resource "aws_secretsmanager_secret_version" "rds_master" {
  secret_id = aws_secretsmanager_secret.rds_master.id
  secret_string = jsonencode({
    username = "fastmeals_admin"
    password = var.rds_master_password
  })
}

# --- Service Database Credentials ---
resource "aws_secretsmanager_secret" "db_credentials" {
  for_each = {
    auth     = { user = "auth_user", password = var.auth_db_password, db = "auth_db" }
    products = { user = "products_user", password = var.products_db_password, db = "products_db" }
    orders   = { user = "orders_user", password = var.orders_db_password, db = "orders_db" }
    delivery = { user = "delivery_user", password = var.delivery_db_password, db = "delivery_db" }
    reports  = { user = "reports_user", password = var.reports_db_password, db = "reports_db" }
  }

  name                    = "${var.project_name}/db/${each.key}"
  description             = "Database credentials for ${each.key}-service"
  recovery_window_in_days = 0

  tags = {
    Name    = "${var.project_name}-db-${each.key}"
    Service = "${each.key}-service"
  }
}

resource "aws_secretsmanager_secret_version" "db_credentials" {
  for_each = aws_secretsmanager_secret.db_credentials

  secret_id = each.value.id
  secret_string = jsonencode({
    username = lookup({
      auth     = "auth_user"
      products = "products_user"
      orders   = "orders_user"
      delivery = "delivery_user"
      reports  = "reports_user"
    }, each.key, "")
    password = lookup({
      auth     = var.auth_db_password
      products = var.products_db_password
      orders   = var.orders_db_password
      delivery = var.delivery_db_password
      reports  = var.reports_db_password
    }, each.key, "")
    database = lookup({
      auth     = "auth_db"
      products = "products_db"
      orders   = "orders_db"
      delivery = "delivery_db"
      reports  = "reports_db"
    }, each.key, "")
  })
}

# --- JWT Secrets ---
resource "aws_secretsmanager_secret" "jwt" {
  name                    = "${var.project_name}/jwt"
  description             = "JWT access and refresh token secrets"
  recovery_window_in_days = 0

  tags = {
    Name = "${var.project_name}-jwt"
  }
}

resource "aws_secretsmanager_secret_version" "jwt" {
  secret_id = aws_secretsmanager_secret.jwt.id
  secret_string = jsonencode({
    access_secret  = var.jwt_access_secret
    refresh_secret = var.jwt_refresh_secret
  })
}

# --- RabbitMQ Credentials ---
resource "aws_secretsmanager_secret" "rabbitmq" {
  name                    = "${var.project_name}/rabbitmq"
  description             = "Amazon MQ RabbitMQ credentials"
  recovery_window_in_days = 0

  tags = {
    Name = "${var.project_name}-rabbitmq"
  }
}

resource "aws_secretsmanager_secret_version" "rabbitmq" {
  secret_id = aws_secretsmanager_secret.rabbitmq.id
  secret_string = jsonencode({
    username = var.mq_username
    password = var.mq_password
  })
}

# --- AWS Bedrock (Reports Service) ---
resource "aws_secretsmanager_secret" "bedrock" {
  name                    = "${var.project_name}/bedrock"
  description             = "AWS Bedrock configuration for AI Insights"
  recovery_window_in_days = 0

  tags = {
    Name = "${var.project_name}-bedrock"
  }
}

resource "aws_secretsmanager_secret_version" "bedrock" {
  secret_id = aws_secretsmanager_secret.bedrock.id
  secret_string = jsonencode({
    region   = var.aws_region
    model_id = var.bedrock_model_id
  })
}