output "vpc_id" {
  value = aws_vpc.main.id
}

output "app_public_ip" {
  value = aws_instance.app.public_ip
}

output "ssh_command" {
  value = "ssh -i ~/.ssh/shopsphere-aws ubuntu@${aws_instance.app.public_ip}"
}
