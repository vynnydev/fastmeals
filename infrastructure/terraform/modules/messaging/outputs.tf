output "broker_id" {
  description = "ID do broker Amazon MQ"
  value       = aws_mq_broker.rabbitmq.id
}

output "broker_arn" {
  description = "ARN do broker"
  value       = aws_mq_broker.rabbitmq.arn
}

output "amqp_endpoint" {
  description = "Endpoint AMQPS para conexão"
  value       = tolist(aws_mq_broker.rabbitmq.instances)[0].endpoints[0]
}

output "console_url" {
  description = "URL do console de gerenciamento"
  value       = tolist(aws_mq_broker.rabbitmq.instances)[0].console_url
}

output "rabbitmq_url" {
  description = "URL de conexão formatada"
  value       = "amqps://${var.mq_username}:${var.mq_password}@${replace(tolist(aws_mq_broker.rabbitmq.instances)[0].endpoints[0], "amqps://", "")}"
  sensitive   = true
}