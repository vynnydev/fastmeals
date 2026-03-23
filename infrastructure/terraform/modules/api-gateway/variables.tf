variable "project_name" {
  description = "Nome do projeto"
  type        = string
}

variable "cors_origins" {
  description = "Origens CORS permitidas"
  type        = list(string)
  default     = ["http://localhost:3000"]
}

variable "lambda_functions" {
  description = "Map de Lambda functions com invoke_arn e function_name"
  type = map(object({
    invoke_arn    = string
    function_name = string
  }))
}