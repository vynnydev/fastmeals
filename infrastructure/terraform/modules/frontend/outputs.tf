output "amplify_app_id" {
  description = "ID do Amplify App"
  value       = aws_amplify_app.frontend.id
}

output "amplify_default_domain" {
  description = "Domínio padrão do Amplify"
  value       = aws_amplify_app.frontend.default_domain
}

output "amplify_branch_url" {
  description = "URL da branch deployada"
  value       = "https://${aws_amplify_branch.main.branch_name}.${aws_amplify_app.frontend.default_domain}"
}

output "custom_domain" {
  description = "Domínio customizado (se configurado)"
  value       = var.domain_name != "" ? "https://${var.domain_name}" : "N/A"
}