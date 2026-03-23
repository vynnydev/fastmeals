# ============================================
# FastMeals — Production Environment
# ============================================

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

# --- Networking ---
module "networking" {
  source = "../../modules/networking"

  project_name = var.project_name
  vpc_cidr     = var.vpc_cidr
}

# --- Database (próximo módulo) ---
# module "database" {
#   source = "../../modules/database"
#   ...
# }

# --- Cache (próximo módulo) ---
# module "cache" {
#   source = "../../modules/cache"
#   ...
# }

# --- Messaging (próximo módulo) ---
# module "messaging" {
#   source = "../../modules/messaging"
#   ...
# }

# --- Lambda (próximo módulo) ---
# module "lambda" {
#   source = "../../modules/lambda"
#   ...
# }

# --- Frontend (próximo módulo) ---
# module "frontend" {
#   source = "../../modules/frontend"
#   ...
# }