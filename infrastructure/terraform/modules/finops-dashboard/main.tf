# ============================================
# FastMeals — FinOps Dashboard Module
# Composes storage (S3) + cdn (CloudFront) modules
# ============================================

# --- Storage: S3 bucket for static site ---
module "storage" {
  source = "../storage"

  project_name        = var.project_name
  bucket_name         = "finops-dashboard"
  purpose             = "static-site"
  block_public_access = true
  enable_encryption   = true

  # Policy will be set after CDN is created
  bucket_policy = ""
}

# --- CDN: CloudFront + Route53 ---
module "cdn" {
  source = "../cdn"

  project_name    = var.project_name
  site_name       = "finops"
  origin_domain   = module.storage.bucket_regional_domain
  origin_type     = "s3"
  subdomain       = "finops"
  domain_name     = var.domain_name
  route53_zone_id = var.route53_zone_id
  certificate_arn = var.certificate_arn
  spa_mode        = true
}

# --- S3 Bucket Policy: allow CloudFront OAC ---
resource "aws_s3_bucket_policy" "allow_cloudfront" {
  bucket = module.storage.bucket_id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Sid       = "AllowCloudFrontServicePrincipal"
      Effect    = "Allow"
      Principal = { Service = "cloudfront.amazonaws.com" }
      Action    = "s3:GetObject"
      Resource  = "${module.storage.bucket_arn}/*"
      Condition = {
        StringEquals = {
          "AWS:SourceArn" = module.cdn.distribution_arn
        }
      }
    }]
  })
}
