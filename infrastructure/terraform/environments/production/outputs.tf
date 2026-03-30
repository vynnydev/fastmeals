# --- Frontend (Amplify) ---
output "shell_url" {
  description = "URL do frontend (shell)"
  value       = module.frontend.shell_url
}

output "amplify_app_ids" {
  description = "Amplify App IDs"
  value       = module.frontend.amplify_app_ids
}

output "amplify_custom_domains" {
  description = "Custom domain URLs"
  value       = module.frontend.amplify_custom_domains
}

output "remote_entry_urls" {
  description = "Remote entry URLs for Module Federation"
  value       = module.frontend.remote_entry_urls
}

# --- API ---
output "api_gateway_url" {
  description = "URL do API Gateway"
  value       = module.api_gateway.api_url
}

# --- DNS ---
output "domain_url" {
  description = "URL do domínio"
  value       = module.dns.domain_url
}

output "nameservers" {
  description = "Nameservers — configurar na Hostinger"
  value       = module.dns.nameservers
}

output "certificate_arn" {
  description = "ARN do certificado ACM"
  value       = module.dns.certificate_arn
}

# --- Database ---
output "database_endpoint" {
  description = "RDS endpoint"
  value       = module.database.rds_endpoint
}

# --- Cache ---
output "redis_endpoint" {
  description = "Redis endpoint"
  value       = module.cache.redis_endpoint
}