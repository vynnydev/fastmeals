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