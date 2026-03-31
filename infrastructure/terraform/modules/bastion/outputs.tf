output "bastion_public_ip" {
  description = "IP público do Bastion Host"
  value       = aws_instance.bastion.public_ip
}

output "bastion_instance_id" {
  description = "Instance ID do Bastion"
  value       = aws_instance.bastion.id
}

output "bastion_security_group_id" {
  description = "Security group ID do Bastion"
  value       = aws_security_group.bastion.id
}

output "ssh_command" {
  description = "Comando SSH para conectar ao bastion"
  value       = "ssh -i ~/.ssh/${var.key_name}.pem ec2-user@${aws_instance.bastion.public_ip}"
}

output "rds_tunnel_command" {
  description = "Comando para criar túnel SSH para o RDS"
  value       = "ssh -i ~/.ssh/${var.key_name}.pem -L 5432:${var.rds_endpoint}:5432 ec2-user@${aws_instance.bastion.public_ip}"
}

output "redis_tunnel_command" {
  description = "Comando para criar túnel SSH para o Redis"
  value       = var.rds_endpoint != "" ? "ssh -i ~/.ssh/${var.key_name}.pem -L 6379:<redis-endpoint>:6379 ec2-user@${aws_instance.bastion.public_ip}" : ""
}
