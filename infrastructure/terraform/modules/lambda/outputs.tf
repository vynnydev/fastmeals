output "lambda_role_arn" {
  value = aws_iam_role.lambda_exec.arn
}

output "function_names" {
  value = { for k, v in aws_lambda_function.handlers : k => v.function_name }
}

output "function_arns" {
  value = { for k, v in aws_lambda_function.handlers : k => v.arn }
}

# Output para o API Gateway consumir
output "functions_for_api_gw" {
  description = "Map com invoke_arn e function_name para o API Gateway"
  value = {
    for k, v in aws_lambda_function.handlers : k => {
      invoke_arn    = v.invoke_arn
      function_name = v.function_name
    }
  }
}