# --- Networking ---
output "vpc_id" {
  value = module.networking.vpc_id
}

output "public_subnet_ids" {
  value = module.networking.public_subnet_ids
}

output "private_subnet_ids" {
  value = module.networking.private_subnet_ids
}

output "nat_gateway_ip" {
  value = module.networking.nat_gateway_ip
}

# --- Database ---
output "rds_endpoint" {
  value = module.database.rds_endpoint
}

# --- Cache ---
output "redis_endpoint" {
  value = module.cache.redis_endpoint
}

# --- Messaging ---
output "mq_console_url" {
  value = module.messaging.console_url
}

output "mq_amqp_endpoint" {
  value = module.messaging.amqp_endpoint
}

# --- Secrets ---
output "secret_names" {
  value = module.secrets.secret_names
}

output "lambda_function_names" {
  value = module.lambda.function_names
}

# --- Frontend ---
output "frontend_url" {
  value = module.frontend.frontend_url
}

output "ecr_repository_url" {
  value = module.frontend.ecr_repository_url
}

output "ecs_cluster_name" {
  value = module.frontend.ecs_cluster_name
}

output "alb_dns_name" {
  value = module.frontend.alb_dns_name
}

# --- API Gateway ---
output "api_gateway_url" {
  value = module.api_gateway.api_url
}

# --- DNS ---
output "nameservers" {
  description = "Configurar estes nameservers na Hostinger"
  value       = module.dns.nameservers
}

output "domain_url" {
  value = module.dns.domain_url
}

output "certificate_status" {
  value = module.dns.certificate_status
}