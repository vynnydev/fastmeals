# ============================================
# FastMeals — Messaging Module
# Amazon MQ (RabbitMQ) for event-driven messaging
# ============================================

# --- Amazon MQ Broker ---
resource "aws_mq_broker" "rabbitmq" {
  broker_name = "${var.project_name}-rabbitmq"

  engine_type        = "RabbitMQ"
  engine_version     = "3.13"
  host_instance_type = var.instance_type
  deployment_mode    = "SINGLE_INSTANCE"

  publicly_accessible = false
  subnet_ids          = [var.private_subnet_ids[0]]
  security_groups     = [var.mq_security_group_id]

  auto_minor_version_upgrade = true

  user {
    username = var.mq_username
    password = var.mq_password
  }

  logs {
    general = true
  }

  maintenance_window_start_time {
    day_of_week = "SUNDAY"
    time_of_day = "04:00"
    time_zone   = "UTC"
  }

  tags = {
    Name = "${var.project_name}-rabbitmq"
  }
}