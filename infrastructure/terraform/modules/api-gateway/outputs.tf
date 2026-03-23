output "api_url" {
  description = "URL base do API Gateway"
  value       = aws_apigatewayv2_api.main.api_endpoint
}

output "api_id" {
  description = "ID do API Gateway"
  value       = aws_apigatewayv2_api.main.id
}

output "api_execution_arn" {
  description = "Execution ARN do API Gateway"
  value       = aws_apigatewayv2_api.main.execution_arn
}

output "stage_name" {
  description = "Nome do stage"
  value       = aws_apigatewayv2_stage.default.name
}

output "log_group_name" {
  description = "Nome do CloudWatch Log Group"
  value       = aws_cloudwatch_log_group.api_gw.name
}