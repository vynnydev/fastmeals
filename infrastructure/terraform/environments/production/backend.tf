# Remote state — requer bootstrap executado primeiro
terraform {
  backend "s3" {
    bucket         = "fastmeals-terraform-state-us-east-1"
    key            = "production/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "fastmeals-terraform-lock"
    encrypt        = true
  }
}