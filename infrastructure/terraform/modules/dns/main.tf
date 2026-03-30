# ============================================
# FastMeals — DNS Module
# Route53 + ACM Certificate
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

# --- A Record: api.fastmeals.com.br → API Gateway ---
resource "aws_route53_record" "api" {
  count = var.api_gateway_domain_name != "" ? 1 : 0

  zone_id = aws_route53_zone.main.zone_id
  name    = "api.${var.domain_name}"
  type    = "CNAME"
  ttl     = 300
  records = [var.api_gateway_domain_name]
}

# NOTE: Os records para fastmeals.com.br, www., orders-mfe., etc.
# são gerenciados automaticamente pelo Amplify Domain Association.
# O Amplify cria os CNAMEs de verificação e o CloudFront distribution.
# NÃO crie A records manuais aqui para evitar conflito.