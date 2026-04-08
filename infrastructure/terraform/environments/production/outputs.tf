# --- Frontend (Amplify) ---
output "shell_url" {
  description = "URL do frontend (shell)"
  value       = module.frontend.shell_url
}

output "amplify_app_id" {
  description = "Amplify App ID"
  value       = module.frontend.amplify_app_id
}

output "amplify_custom_domain" {
  description = "Custom domain URL"
  value       = module.frontend.amplify_custom_domain
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

# --- Bastion ---
output "bastion_public_ip" {
  description = "IP do Bastion Host"
  value       = module.bastion.bastion_public_ip
}

output "ssh_command" {
  description = "Comando SSH"
  value       = module.bastion.ssh_command
}

output "rds_tunnel_command" {
  description = "Comando para túnel SSH ao RDS"
  value       = module.bastion.rds_tunnel_command
}

# --- FinOps Dashboard ---
# output "finops_dashboard_url" {
#   description = "URL do FinOps Dashboard"
#   value       = module.finops_dashboard.dashboard_url
# }

# output "finops_cloudfront_id" {
#   description = "CloudFront Distribution ID do FinOps Dashboard"
#   value       = module.finops_dashboard.cloudfront_distribution_id
# }
