output "vpc_id" {
  value = aws_vpc.main.id
}

output "app_public_ip" {
  value = aws_instance.app.public_ip
}

output "ssh_command" {
  value = "ssh -i ~/.ssh/shopsphere-aws ubuntu@${aws_instance.app.public_ip}"
}

output "db_endpoint" {
  value = aws_db_instance.main.address
}

output "db_password" {
  value     = random_password.db.result
  sensitive = true
}

output "cache_endpoint" {
  value = aws_elasticache_cluster.main.cluster_address
}
