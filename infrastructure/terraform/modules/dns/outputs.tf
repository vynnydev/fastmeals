output "zone_id" {
  description = "ID da Hosted Zone"
  value       = aws_route53_zone.main.zone_id
}

output "nameservers" {
  description = "Nameservers do Route53 — configurar na Hostinger"
  value       = aws_route53_zone.main.name_servers
}

output "certificate_arn" {
  description = "ARN do certificado ACM"
  value       = aws_acm_certificate.main.arn
}

output "certificate_status" {
  description = "Status do certificado"
  value       = aws_acm_certificate.main.status
}

output "domain_url" {
  description = "URL do domínio"
  value       = "https://${var.domain_name}"
}