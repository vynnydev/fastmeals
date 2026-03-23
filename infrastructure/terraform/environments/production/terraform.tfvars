project_name = "fastmeals"
aws_region   = "us-east-1"
vpc_cidr     = "10.0.0.0/16"

# RDS
rds_instance_class        = "db.t3.micro"
rds_allocated_storage     = 20
rds_max_allocated_storage = 50

# Redis
redis_node_type = "cache.t3.micro"

# ⚠️ SENSITIVE — passar via CLI:
# terraform plan -out tfplan \
#   -var="rds_master_password=FastMeals2026!" \
#   -var="auth_db_password=auth_pass_2026" \
#   -var="products_db_password=products_pass_2026" \
#   -var="orders_db_password=orders_pass_2026" \
#   -var="delivery_db_password=delivery_pass_2026" \
#   -var="reports_db_password=reports_pass_2026" \
#   -var="mq_password=RabbitMQ2026!" \
#   -var="jwt_access_secret=prod-access-secret-fastmeals-2026" \
#   -var="jwt_refresh_secret=prod-refresh-secret-fastmeals-2026"