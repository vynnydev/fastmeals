output "amplify_app_id" {
  description = "Amplify App ID"
  value       = aws_amplify_app.frontend.id
}

output "amplify_default_domain" {
  description = "Amplify default domain"
  value       = "https://${aws_amplify_branch.frontend.branch_name}.${aws_amplify_app.frontend.default_domain}"
}

output "amplify_custom_domain" {
  description = "Custom domain URL"
  value       = var.domain_name != "" ? "https://${var.domain_name}" : ""
}

output "shell_url" {
  description = "Shell (Host) URL"
  value       = var.domain_name != "" ? "https://${var.domain_name}" : "https://${aws_amplify_branch.frontend.branch_name}.${aws_amplify_app.frontend.default_domain}"
}

output "domain_association" {
  description = "Amplify domain association"
  value       = var.domain_name != "" ? aws_amplify_domain_association.frontend[0] : null
}

output "cert_verification_record" {
  description = "Certificate verification DNS record from Amplify"
  value = var.domain_name != "" ? {
    name  = try(aws_amplify_domain_association.frontend[0].certificate_verification_dns_record, "")
  } : { name = "" }
}