# ============================================
# FastMeals — DNS Module
# Route53 + ACM Certificate + Amplify DNS
# ============================================

# --- Route53 Hosted Zone ---
resource "aws_route53_zone" "main" {
  name    = var.domain_name
  comment = "FastMeals - managed by Terraform"

  tags = {
    Name = "${var.project_name}-zone"
  }
}

# --- ACM Certificate ---
resource "aws_acm_certificate" "main" {
  domain_name               = var.domain_name
  subject_alternative_names = ["*.${var.domain_name}"]
  validation_method         = "DNS"

  tags = {
    Name = "${var.project_name}-cert"
  }

  lifecycle {
    create_before_destroy = true
  }
}

# --- DNS Validation Records ---
resource "aws_route53_record" "cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.main.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = aws_route53_zone.main.zone_id
}

# --- Certificate Validation ---
resource "aws_acm_certificate_validation" "main" {
  certificate_arn         = aws_acm_certificate.main.arn
  validation_record_fqdns = [for record in aws_route53_record.cert_validation : record.fqdn]

  timeouts {
    create = "30m"
  }
}

# --- Amplify Certificate Verification ---
resource "aws_route53_record" "amplify_cert" {
  count = var.amplify_cert_record_name != "" ? 1 : 0

  zone_id         = aws_route53_zone.main.zone_id
  name            = var.amplify_cert_record_name
  type            = "CNAME"
  ttl             = 300
  records         = [var.amplify_cert_record_value]
  allow_overwrite = true
}

# --- Root Domain → Amplify CloudFront ---
# NOTE: O A record ALIAS para o root domain (fastmeals.com.br)
# é gerenciado automaticamente pelo Amplify Domain Association.
# NÃO criar CNAME aqui — CNAME não é permitido no apex.
# O Amplify cria um A record ALIAS para o CloudFront distribution.

# --- Root Domain → Amplify CloudFront ---
# resource "aws_route53_record" "root" {
#   count = var.amplify_cloudfront_domain != "" ? 1 : 0

#   zone_id         = aws_route53_zone.main.zone_id
#   name            = var.domain_name
#   type            = "CNAME"
#   ttl             = 300
#   records         = [var.amplify_cloudfront_domain]
#   allow_overwrite = true
# }

# --- API Gateway subdomain ---
resource "aws_route53_record" "api" {
  count = var.api_gateway_domain_name != "" ? 1 : 0

  zone_id = aws_route53_zone.main.zone_id
  name    = "api.${var.domain_name}"
  type    = "CNAME"
  ttl     = 300
  records = [var.api_gateway_domain_name]
}