terraform {
  required_version = ">= 1.5"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = "production"
      ManagedBy   = "terraform"
    }
  }
}

# --- Secrets ---
module "secrets" {
  source = "../../modules/secrets"

  project_name = var.project_name
  aws_region   = var.aws_region

  rds_master_password  = var.rds_master_password
  auth_db_password     = var.auth_db_password
  products_db_password = var.products_db_password
  orders_db_password   = var.orders_db_password
  delivery_db_password = var.delivery_db_password
  reports_db_password  = var.reports_db_password

  jwt_access_secret  = var.jwt_access_secret
  jwt_refresh_secret = var.jwt_refresh_secret

  mq_password = var.mq_password
}

# --- Networking ---
module "networking" {
  source = "../../modules/networking"

  project_name = var.project_name
  vpc_cidr     = var.vpc_cidr
}

# --- Database ---
module "database" {
  source = "../../modules/database"

  project_name          = var.project_name
  private_subnet_ids    = module.networking.private_subnet_ids
  rds_security_group_id = module.networking.rds_security_group_id

  instance_class        = var.rds_instance_class
  allocated_storage     = var.rds_allocated_storage
  max_allocated_storage = var.rds_max_allocated_storage

  master_password = var.rds_master_password
  service_passwords = {
    auth     = var.auth_db_password
    products = var.products_db_password
    orders   = var.orders_db_password
    delivery = var.delivery_db_password
    reports  = var.reports_db_password
  }
}

# --- Cache ---
module "cache" {
  source = "../../modules/cache"

  project_name            = var.project_name
  private_subnet_ids      = module.networking.private_subnet_ids
  redis_security_group_id = module.networking.redis_security_group_id

  node_type = var.redis_node_type
}

# --- Messaging ---
module "messaging" {
  source = "../../modules/messaging"

  project_name         = var.project_name
  private_subnet_ids   = module.networking.private_subnet_ids
  mq_security_group_id = module.networking.mq_security_group_id

  mq_password = var.mq_password
}

# --- Lambda ---
module "lambda" {
  source = "../../modules/lambda"

  project_name             = var.project_name
  aws_region               = var.aws_region
  private_subnet_ids       = module.networking.private_subnet_ids
  lambda_security_group_id = module.networking.lambda_security_group_id

  redis_url     = module.cache.redis_url
  rabbitmq_url  = module.messaging.rabbitmq_url
  database_urls = module.database.database_urls

  jwt_access_secret  = var.jwt_access_secret
  jwt_refresh_secret = var.jwt_refresh_secret
  secret_arns        = module.secrets.all_secret_arns

  cors_origin      = "https://${var.domain_name}"
  bedrock_model_id = var.bedrock_model_id

  api_gateway_url = var.api_gateway_url
  
  # Datadog Observability
  datadog_enabled = true
  datadog_api_key = var.datadog_api_key
  datadog_site    = "us5.datadoghq.com"
}

# --- API Gateway ---
module "api_gateway" {
  source = "../../modules/api-gateway"

  project_name = var.project_name
  cors_origins = [
    "https://${var.domain_name}",
    "https://mfe.${var.domain_name}",
    "https://orders-mfe.${var.domain_name}",
    "https://products-mfe.${var.domain_name}",
    "https://delivery-mfe.${var.domain_name}",
    "https://reports-mfe.${var.domain_name}",
    "http://localhost:5000",
    "http://localhost:3000",
  ]
  lambda_functions = module.lambda.functions_for_api_gw
}

# --- Frontend (Amplify Microfrontends) ---
module "frontend" {
  source = "../../modules/frontend"

  project_name        = var.project_name
  environment         = "production"
  repository_url      = "https://github.com/vynnydev/fastmeals"
  github_access_token = var.github_access_token
  branch_name         = "improvements"
  api_gateway_url     = var.api_gateway_url
  domain_name         = var.domain_name
}

# --- DNS + HTTPS ---
locals {
  # Parse Amplify cert verification record: "_xxx.domain. CNAME _yyy.aws."
  amplify_cert_raw   = try(module.frontend.domain_association.certificate_verification_dns_record, "")
  amplify_cert_parts = length(local.amplify_cert_raw) > 0 ? split(" CNAME ", local.amplify_cert_raw) : ["", ""]
  amplify_cert_name  = length(local.amplify_cert_parts) > 1 ? trimspace(trimsuffix(local.amplify_cert_parts[0], ".")) : ""
  amplify_cert_value = length(local.amplify_cert_parts) > 1 ? trimspace(local.amplify_cert_parts[1]) : ""
}

module "dns" {
  source = "../../modules/dns"

  project_name = var.project_name
  domain_name  = var.domain_name

  # Dynamic Amplify DNS records
  amplify_cert_record_name  = local.amplify_cert_name
  amplify_cert_record_value = local.amplify_cert_value
}

# --- Bastion Host (SSH tunnel to RDS/Redis + Ansible target) ---
module "bastion" {
  source = "../../modules/bastion"

  project_name            = var.project_name
  aws_region              = var.aws_region
  vpc_id                  = module.networking.vpc_id
  public_subnet_id        = module.networking.public_subnet_ids[0]
  rds_security_group_id   = module.networking.rds_security_group_id
  redis_security_group_id = module.networking.redis_security_group_id
  rds_endpoint            = module.database.rds_endpoint
  key_name                = "fastmeals-bastion"
  allowed_ssh_cidrs       = ["0.0.0.0/0"]  # Restrinja para seu IP em produção
}

# --- FinOps Dashboard (S3 + CloudFront) ---
# module "finops_dashboard" {
#   source = "../../modules/finops-dashboard"

#   project_name    = var.project_name
#   domain_name     = var.domain_name
#   route53_zone_id = module.dns.zone_id
#   certificate_arn = module.dns.certificate_arn
# }