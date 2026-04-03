# ============================================
# FastMeals — CDN Module
# CloudFront distribution + OAC + Route53 record
# Supports S3 origin (static sites) and custom origins
# ============================================

# --- Origin Access Control (for S3 origins) ---
resource "aws_cloudfront_origin_access_control" "this" {
  count = var.origin_type == "s3" ? 1 : 0

  name                              = "${var.project_name}-${var.site_name}-oac"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# --- CloudFront Distribution ---
resource "aws_cloudfront_distribution" "this" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = var.default_root_object
  comment             = "${var.project_name} ${var.site_name}"
  price_class         = var.price_class

  aliases = var.subdomain != "" && var.domain_name != "" ? ["${var.subdomain}.${var.domain_name}"] : []

  origin {
    domain_name              = var.origin_domain
    origin_id                = "origin-${var.site_name}"
    origin_access_control_id = var.origin_type == "s3" ? aws_cloudfront_origin_access_control.this[0].id : null
  }

  default_cache_behavior {
    allowed_methods        = var.allowed_methods
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "origin-${var.site_name}"
    viewer_protocol_policy = "redirect-to-https"
    compress               = true

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    min_ttl     = var.min_ttl
    default_ttl = var.default_ttl
    max_ttl     = var.max_ttl
  }

  # SPA fallback — return index.html for 403/404
  dynamic "custom_error_response" {
    for_each = var.spa_mode ? [403, 404] : []
    content {
      error_code         = custom_error_response.value
      response_code      = 200
      response_page_path = "/${var.default_root_object}"
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = var.geo_restriction_type
      locations        = var.geo_restriction_locations
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = var.certificate_arn == ""
    acm_certificate_arn            = var.certificate_arn != "" ? var.certificate_arn : null
    ssl_support_method             = var.certificate_arn != "" ? "sni-only" : null
    minimum_protocol_version       = var.certificate_arn != "" ? "TLSv1.2_2021" : null
  }

  tags = {
    Name = "${var.project_name}-${var.site_name}-cdn"
  }
}

# --- Route53 Record ---
resource "aws_route53_record" "this" {
  count   = var.subdomain != "" && var.domain_name != "" && var.route53_zone_id != "" ? 1 : 0
  zone_id = var.route53_zone_id
  name    = "${var.subdomain}.${var.domain_name}"
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.this.domain_name
    zone_id                = aws_cloudfront_distribution.this.hosted_zone_id
    evaluate_target_health = false
  }
}
