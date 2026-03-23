output "alb_dns_name" {
  description = "DNS name do ALB (URL para acessar o frontend)"
  value       = aws_lb.frontend.dns_name
}

output "alb_zone_id" {
  description = "Zone ID do ALB (para Route53 alias)"
  value       = aws_lb.frontend.zone_id
}

output "alb_arn" {
  description = "ARN do ALB"
  value       = aws_lb.frontend.arn
}

output "ecr_repository_url" {
  description = "URL do ECR repository"
  value       = aws_ecr_repository.frontend.repository_url
}

output "ecr_repository_name" {
  description = "Nome do ECR repository"
  value       = aws_ecr_repository.frontend.name
}

output "ecs_cluster_name" {
  description = "Nome do ECS cluster"
  value       = aws_ecs_cluster.main.name
}

output "ecs_service_name" {
  description = "Nome do ECS service"
  value       = aws_ecs_service.frontend.name
}

output "frontend_url" {
  description = "URL do frontend"
  value       = "http://${aws_lb.frontend.dns_name}"
}