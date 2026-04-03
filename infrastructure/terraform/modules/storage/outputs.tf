output "bucket_id" {
  description = "ID do bucket S3"
  value       = aws_s3_bucket.this.id
}

output "bucket_arn" {
  description = "ARN do bucket S3"
  value       = aws_s3_bucket.this.arn
}

output "bucket_regional_domain" {
  description = "Domain name regional do bucket (para CloudFront origin)"
  value       = aws_s3_bucket.this.bucket_regional_domain_name
}

output "bucket_website_endpoint" {
  description = "Endpoint do website S3 (se static-site)"
  value       = try(aws_s3_bucket_website_configuration.this[0].website_endpoint, "")
}
