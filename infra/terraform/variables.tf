variable "region" {
  type    = string
  default = "us-west-2"
}

variable "project" {
  type    = string
  default = "shopsphere"
}

variable "vpc_cidr" {
  type    = string
  default = "10.0.0.0/16"
}

variable "my_ip_cidr" {
  type        = string
  description = "Your public IP in CIDR form, e.g. 1.2.3.4/32 (allowed to SSH)"
}

variable "instance_type" {
  type    = string
  default = "t3.micro"
}

variable "public_key_path" {
  type    = string
  default = "~/.ssh/shopsphere-aws.pub"
}
