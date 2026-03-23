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