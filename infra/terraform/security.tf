resource "aws_security_group" "app" {
  name        = "${var.project}-app-sg"
  description = "ShopSphere app server"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "SSH from my IP only"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.my_ip_cidr]
  }

  ingress {
    description = "HTTP from anywhere"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "Allow all outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project}-app-sg"
  }
}

resource "aws_security_group" "db" {
  name        = "${var.project}-db-sg"
  description = "PostgreSQL from the app server only"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "PostgreSQL from the app security group"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.app.id]
  }

  tags = {
    Name = "${var.project}-db-sg"
  }
}

resource "aws_security_group" "cache" {
  name        = "${var.project}-cache-sg"
  description = "Memcached from the app server only"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "Memcached from the app security group"
    from_port       = 11211
    to_port         = 11211
    protocol        = "tcp"
    security_groups = [aws_security_group.app.id]
  }

  tags = {
    Name = "${var.project}-cache-sg"
  }
}
