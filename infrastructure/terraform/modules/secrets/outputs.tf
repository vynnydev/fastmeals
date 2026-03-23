# --- Secret ARNs (para IAM policies das Lambdas) ---
output "rds_master_secret_arn" {
  description = "ARN do secret RDS master"
  value       = aws_secretsmanager_secret.rds_master.arn
}

output "db_secret_arns" {
  description = "ARNs dos secrets de database por serviço"
  value = {
    for key, secret in aws_secretsmanager_secret.db_credentials : key => secret.arn
  }
}

output "jwt_secret_arn" {
  description = "ARN do secret JWT"
  value       = aws_secretsmanager_secret.jwt.arn
}

output "rabbitmq_secret_arn" {
  description = "ARN do secret RabbitMQ"
  value       = aws_secretsmanager_secret.rabbitmq.arn
}

output "bedrock_secret_arn" {
  description = "ARN do secret Bedrock"
  value       = aws_secretsmanager_secret.bedrock.arn
}

# --- All secret ARNs (para policy wildcard) ---
output "all_secret_arns" {
  description = "Lista de todos os ARNs de secrets"
  value = concat(
    [aws_secretsmanager_secret.rds_master.arn],
    [for s in aws_secretsmanager_secret.db_credentials : s.arn],
    [aws_secretsmanager_secret.jwt.arn],
    [aws_secretsmanager_secret.rabbitmq.arn],
    [aws_secretsmanager_secret.bedrock.arn],
  )
}

# --- Secret Names (para referência) ---
output "secret_names" {
  description = "Nomes dos secrets criados"
  value = {
    rds_master = aws_secretsmanager_secret.rds_master.name
    jwt        = aws_secretsmanager_secret.jwt.name
    rabbitmq   = aws_secretsmanager_secret.rabbitmq.name
    bedrock    = aws_secretsmanager_secret.bedrock.name
    db = {
      for key, secret in aws_secretsmanager_secret.db_credentials : key => secret.name
    }
  }
}