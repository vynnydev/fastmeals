output "api_gateway_url" {
  description = "URL do API Gateway"
  value       = aws_apigatewayv2_api.main.api_endpoint
}

output "api_gateway_id" {
  description = "ID do API Gateway"
  value       = aws_apigatewayv2_api.main.id
}

output "api_gateway_execution_arn" {
  description = "Execution ARN do API Gateway"
  value       = aws_apigatewayv2_api.main.execution_arn
}

output "lambda_role_arn" {
  description = "ARN da role Lambda"
  value       = aws_iam_role.lambda_exec.arn
}

output "function_names" {
  description = "Nomes de todas as Lambda functions"
  value       = { for k, v in aws_lambda_function.handlers : k => v.function_name }
}

output "function_arns" {
  description = "ARNs de todas as Lambda functions"
  value       = { for k, v in aws_lambda_function.handlers : k => v.arn }
}