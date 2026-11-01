output "registry" {
  value = split("/", values(aws_ecr_repository.service)[0].repository_url)[0]
}

output "repository_urls" {
  value = { for name, repo in aws_ecr_repository.service : name => repo.repository_url }
}
