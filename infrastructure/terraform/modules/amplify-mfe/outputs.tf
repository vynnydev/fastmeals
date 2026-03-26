output "amplify_app_ids" {
  description = "Amplify App IDs"
  value = {
    for key, app in aws_amplify_app.mfe : key => app.id
  }
}

output "amplify_default_domains" {
  description = "Amplify default domains"
  value = {
    for key, app in aws_amplify_app.mfe : key => "https://${aws_amplify_branch.mfe[key].branch_name}.${app.default_domain}"
  }
}

output "amplify_custom_domains" {
  description = "Custom domain URLs"
  value = var.domain_name != "" ? {
    for key, app in local.mfe_apps : key => "https://${app.subdomain}.${var.domain_name}"
  } : {}
}

output "shell_url" {
  description = "Shell (Host) URL"
  value = var.domain_name != "" ? "https://mfe.${var.domain_name}" : "https://${aws_amplify_branch.mfe["shell"].branch_name}.${aws_amplify_app.mfe["shell"].default_domain}"
}

output "remote_entry_urls" {
  description = "Remote entry URLs for Module Federation"
  value = var.domain_name != "" ? {
    orders   = "https://orders-mfe.${var.domain_name}/assets/remoteEntry.js"
    products = "https://products-mfe.${var.domain_name}/assets/remoteEntry.js"
    delivery = "https://delivery-mfe.${var.domain_name}/assets/remoteEntry.js"
    reports  = "https://reports-mfe.${var.domain_name}/assets/remoteEntry.js"
  } : {
    for key, app in aws_amplify_app.mfe : key => "https://${aws_amplify_branch.mfe[key].branch_name}.${app.default_domain}/assets/remoteEntry.js"
    if key != "shell"
  }
}
