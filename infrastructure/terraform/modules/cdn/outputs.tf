output "distribution_id" {
  description = "CloudFront Distribution ID (para invalidacao no deploy)"
  value       = aws_cloudfront_distribution.this.id
}

output "distribution_arn" {
  description = "CloudFront Distribution ARN (para bucket policies)"
  value       = aws_cloudfront_distribution.this.arn
}

output "distribution_domain" {
  description = "CloudFront domain name (xxxxx.cloudfront.net)"
  value       = aws_cloudfront_distribution.this.domain_name
}

output "site_url" {
  description = "URL final do site (custom domain ou CloudFront)"
  value       = var.subdomain != "" && var.domain_name != "" ? "https://${var.subdomain}.${var.domain_name}" : "https://${aws_cloudfront_distribution.this.domain_name}"
}
