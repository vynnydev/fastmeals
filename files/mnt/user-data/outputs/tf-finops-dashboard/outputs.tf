output "dashboard_url" {
  description = "URL do FinOps Dashboard"
  value       = module.cdn.site_url
}

output "cloudfront_distribution_id" {
  description = "CloudFront Distribution ID (para invalidacao no deploy)"
  value       = module.cdn.distribution_id
}

output "s3_bucket_name" {
  description = "S3 bucket name para upload do build"
  value       = module.storage.bucket_id
}

output "cloudfront_domain" {
  description = "CloudFront domain name"
  value       = module.cdn.distribution_domain
}
