# ============================================
# FastMeals — Database Module
# RDS PostgreSQL 16 (1 instância, 5 databases)
# ============================================

# --- Subnet Group ---
resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-db-subnet-group"
  subnet_ids = var.private_subnet_ids

  tags = {
    Name = "${var.project_name}-db-subnet-group"
  }
}

# --- Parameter Group ---
resource "aws_db_parameter_group" "main" {
  family = "postgres16"
  name   = "${var.project_name}-pg16-params"

  parameter {
    name  = "log_connections"
    value = "1"
  }

  parameter {
    name  = "log_disconnections"
    value = "1"
  }

  parameter {
    name  = "log_duration"
    value = "1"
  }

  tags = {
    Name = "${var.project_name}-pg16-params"
  }
}

# --- RDS Instance ---
resource "aws_db_instance" "main" {
  identifier = "${var.project_name}-postgres"

  engine         = "postgres"
  engine_version = "16.4"
  instance_class = var.instance_class

  allocated_storage     = var.allocated_storage
  max_allocated_storage = var.max_allocated_storage
  storage_type          = "gp3"
  storage_encrypted     = true

  db_name  = "fastmeals_main"
  username = var.master_username
  password = var.master_password

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [var.rds_security_group_id]
  parameter_group_name   = aws_db_parameter_group.main.name

  multi_az            = false
  publicly_accessible = false
  skip_final_snapshot = true

  backup_retention_period = 7
  backup_window           = "03:00-04:00"
  maintenance_window      = "sun:04:00-sun:05:00"

  performance_insights_enabled = false
  deletion_protection          = false

  tags = {
    Name = "${var.project_name}-postgres"
  }
}

# --- Create additional databases ---
# Uses a null_resource with local-exec to create the 5 service databases
# --- Create additional databases ---
# resource "null_resource" "create_databases" {
#   depends_on = [aws_db_instance.main]

#   provisioner "local-exec" {
#     command = <<-EOT
#       for DB_NAME in auth_db products_db orders_db delivery_db reports_db; do
#         PGPASSWORD=${var.master_password} psql \
#           -h ${aws_db_instance.main.address} \
#           -U ${var.master_username} \
#           -d fastmeals_main \
#           -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || echo "Database $DB_NAME already exists"
#       done

#       PGPASSWORD=${var.master_password} psql \
#         -h ${aws_db_instance.main.address} \
#         -U ${var.master_username} \
#         -d fastmeals_main \
#         -c "
#           DO \$\$
#           BEGIN
#             IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'auth_user') THEN
#               CREATE ROLE auth_user WITH LOGIN PASSWORD '${var.service_passwords.auth}';
#             END IF;
#             IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'products_user') THEN
#               CREATE ROLE products_user WITH LOGIN PASSWORD '${var.service_passwords.products}';
#             END IF;
#             IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'orders_user') THEN
#               CREATE ROLE orders_user WITH LOGIN PASSWORD '${var.service_passwords.orders}';
#             END IF;
#             IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'delivery_user') THEN
#               CREATE ROLE delivery_user WITH LOGIN PASSWORD '${var.service_passwords.delivery}';
#             END IF;
#             IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'reports_user') THEN
#               CREATE ROLE reports_user WITH LOGIN PASSWORD '${var.service_passwords.reports}';
#             END IF;
#           END
#           \$\$;

#           GRANT ALL PRIVILEGES ON DATABASE auth_db TO auth_user;
#           GRANT ALL PRIVILEGES ON DATABASE products_db TO products_user;
#           GRANT ALL PRIVILEGES ON DATABASE orders_db TO orders_user;
#           GRANT ALL PRIVILEGES ON DATABASE delivery_db TO delivery_user;
#           GRANT ALL PRIVILEGES ON DATABASE reports_db TO reports_user;
#         "
#     EOT
#   }
# }