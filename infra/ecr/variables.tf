variable "region" {
  type    = string
  default = "us-west-2"
}

variable "project" {
  type    = string
  default = "shopsphere"
}

variable "services" {
  type    = list(string)
  default = ["frontend", "product-service", "order-service", "notification-worker"]
}
