# ============================================
# FastMeals — Storage Module
# Generic S3 bucket for any purpose:
#   static-site, backups, assets, logs
# ============================================

# --- S3 Bucket ---
resource "aws_s3_bucket" "this" {
  bucket = "${var.project_name}-${var.bucket_name}"

  tags = {
    Name    = "${var.project_name}-${var.bucket_name}"
    Purpose = var.purpose
  }
}

# --- Versioning ---
resource "aws_s3_bucket_versioning" "this" {
  count  = var.enable_versioning ? 1 : 0
  bucket = aws_s3_bucket.this.id

  versioning_configuration {
    status = "Enabled"
  }
}

# --- Lifecycle Rules ---
resource "aws_s3_bucket_lifecycle_configuration" "this" {
  count  = var.lifecycle_expiration_days > 0 ? 1 : 0
  bucket = aws_s3_bucket.this.id

  rule {
    id     = "expire-old-objects"
    status = "Enabled"

    filter {
      prefix = var.lifecycle_prefix
    }

    expiration {
      days = var.lifecycle_expiration_days
    }
  }
}

# --- Website Configuration (for static sites) ---
resource "aws_s3_bucket_website_configuration" "this" {
  count  = var.purpose == "static-site" ? 1 : 0
  bucket = aws_s3_bucket.this.id

  index_document {
    suffix = var.index_document
  }

  error_document {
    key = var.error_document
  }
}

# --- Block Public Access ---
resource "aws_s3_bucket_public_access_block" "this" {
  bucket = aws_s3_bucket.this.id

  block_public_acls       = var.block_public_access
  block_public_policy     = var.block_public_access
  ignore_public_acls      = var.block_public_access
  restrict_public_buckets = var.block_public_access
}

# --- Bucket Policy (optional — for CloudFront OAC or custom policies) ---
resource "aws_s3_bucket_policy" "this" {
  count  = var.bucket_policy != "" ? 1 : 0
  bucket = aws_s3_bucket.this.id
  policy = var.bucket_policy
}

# --- Encryption ---
resource "aws_s3_bucket_server_side_encryption_configuration" "this" {
  count  = var.enable_encryption ? 1 : 0
  bucket = aws_s3_bucket.this.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}
