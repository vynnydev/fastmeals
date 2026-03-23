output "rds_endpoint" {
  description = "Endpoint do RDS"
  value       = aws_db_instance.main.address
}

output "rds_port" {
  description = "Porta do RDS"
  value       = aws_db_instance.main.port
}

output "database_urls" {
  description = "Connection strings por serviço"
  value = {
    auth     = "postgresql://auth_user:${var.service_passwords.auth}@${aws_db_instance.main.address}:${aws_db_instance.main.port}/auth_db"
    products = "postgresql://products_user:${var.service_passwords.products}@${aws_db_instance.main.address}:${aws_db_instance.main.port}/products_db"
    orders   = "postgresql://orders_user:${var.service_passwords.orders}@${aws_db_instance.main.address}:${aws_db_instance.main.port}/orders_db"
    delivery = "postgresql://delivery_user:${var.service_passwords.delivery}@${aws_db_instance.main.address}:${aws_db_instance.main.port}/delivery_db"
    reports  = "postgresql://reports_user:${var.service_passwords.reports}@${aws_db_instance.main.address}:${aws_db_instance.main.port}/reports_db"
  }
  sensitive = true
}