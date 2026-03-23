output "state_bucket_name" {
  description = "S3 bucket para armazenar o Terraform state"
  value       = aws_s3_bucket.terraform_state.bucket
}

output "state_bucket_arn" {
  description = "ARN do S3 bucket"
  value       = aws_s3_bucket.terraform_state.arn
}

output "lock_table_name" {
  description = "DynamoDB table para state locking"
  value       = aws_dynamodb_table.terraform_lock.name
}

output "lock_table_arn" {
  description = "ARN do DynamoDB table"
  value       = aws_dynamodb_table.terraform_lock.arn
}