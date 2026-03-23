output "vpc_id" {
  description = "ID da VPC"
  value       = aws_vpc.main.id
}

output "vpc_cidr" {
  description = "CIDR da VPC"
  value       = aws_vpc.main.cidr_block
}

output "public_subnet_ids" {
  description = "IDs das subnets públicas"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "IDs das subnets privadas"
  value       = aws_subnet.private[*].id
}

output "lambda_security_group_id" {
  description = "Security group ID para Lambda"
  value       = aws_security_group.lambda.id
}

output "rds_security_group_id" {
  description = "Security group ID para RDS"
  value       = aws_security_group.rds.id
}

output "redis_security_group_id" {
  description = "Security group ID para ElastiCache Redis"
  value       = aws_security_group.redis.id
}

output "mq_security_group_id" {
  description = "Security group ID para Amazon MQ"
  value       = aws_security_group.mq.id
}

output "nat_gateway_ip" {
  description = "IP público do NAT Gateway"
  value       = aws_eip.nat.public_ip
}