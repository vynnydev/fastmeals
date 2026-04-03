# ============================================
# FastMeals — Bastion Host Module
# EC2 t3.micro for SSH tunnel to RDS/Redis/MQ
# + Ansible target (Node.js, Prisma, AWS CLI)
# ============================================

# --- Latest Amazon Linux 2023 AMI ---
data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# --- Security Group ---
resource "aws_security_group" "bastion" {
  name_prefix = "${var.project_name}-bastion-"
  vpc_id      = var.vpc_id
  description = "Security group for Bastion Host - SSH access"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = var.allowed_ssh_cidrs
    description = "SSH from allowed IPs"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound"
  }

  tags = {
    Name = "${var.project_name}-bastion-sg"
  }

  lifecycle {
    create_before_destroy = true
  }
}

# --- Allow Bastion to access RDS ---
resource "aws_security_group_rule" "rds_from_bastion" {
  type                     = "ingress"
  from_port                = 5432
  to_port                  = 5432
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.bastion.id
  security_group_id        = var.rds_security_group_id
  description              = "PostgreSQL from Bastion"
}

# --- Allow Bastion to access Redis ---
resource "aws_security_group_rule" "redis_from_bastion" {
  type                     = "ingress"
  from_port                = 6379
  to_port                  = 6379
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.bastion.id
  security_group_id        = var.redis_security_group_id
  description              = "Redis from Bastion"
}

# --- IAM Role (SSM + S3 backups + Secrets Manager) ---
resource "aws_iam_role" "bastion" {
  name = "${var.project_name}-bastion-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
    }]
  })

  tags = {
    Name = "${var.project_name}-bastion-role"
  }
}

resource "aws_iam_role_policy_attachment" "bastion_ssm" {
  role       = aws_iam_role.bastion.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

# --- S3 access for database backups (Ansible backup/restore playbooks) ---
resource "aws_iam_role_policy" "bastion_s3_backups" {
  name = "${var.project_name}-bastion-s3-backups"
  role = aws_iam_role.bastion.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:DeleteObject",
          "s3:ListBucket",
          "s3:GetBucketLocation"
        ]
        Resource = [
          "arn:aws:s3:::${var.project_name}-db-backups",
          "arn:aws:s3:::${var.project_name}-db-backups/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "s3:CreateBucket",
          "s3:PutBucketVersioning",
          "s3:PutLifecycleConfiguration",
          "s3:HeadBucket"
        ]
        Resource = "arn:aws:s3:::${var.project_name}-db-backups"
      }
    ]
  })
}

# --- Secrets Manager read access (for Ansible to fetch credentials) ---
resource "aws_iam_role_policy" "bastion_secrets_read" {
  name = "${var.project_name}-bastion-secrets-read"
  role = aws_iam_role.bastion.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "secretsmanager:GetSecretValue",
        "secretsmanager:DescribeSecret"
      ]
      Resource = "arn:aws:secretsmanager:${var.aws_region}:*:secret:${var.project_name}/*"
    }]
  })
}

resource "aws_iam_instance_profile" "bastion" {
  name = "${var.project_name}-bastion-profile"
  role = aws_iam_role.bastion.name
}

# --- EC2 Instance ---
resource "aws_instance" "bastion" {
  ami                    = data.aws_ami.amazon_linux.id
  instance_type          = var.instance_type
  key_name               = var.key_name
  subnet_id              = var.public_subnet_id
  vpc_security_group_ids = [aws_security_group.bastion.id]
  iam_instance_profile   = aws_iam_instance_profile.bastion.name

  associate_public_ip_address = true

  root_block_device {
    volume_size = 30
    volume_type = "gp3"
    encrypted   = true
  }

  user_data = <<-EOF
    #!/bin/bash
    yum update -y
    yum install -y postgresql16 redis6

    # Create connection helper scripts
    cat > /home/ec2-user/connect-rds.sh << 'SCRIPT'
    #!/bin/bash
    echo "Connecting to FastMeals RDS..."
    echo "Databases: auth_db, products_db, orders_db, delivery_db, reports_db"
    echo ""
    echo "Usage: psql -h ${var.rds_endpoint} -U <user> -d <database>"
    echo ""
    echo "Example:"
    echo "  psql -h ${var.rds_endpoint} -U auth_user -d auth_db"
    echo "  psql -h ${var.rds_endpoint} -U reports_user -d reports_db"
    SCRIPT
    chmod +x /home/ec2-user/connect-rds.sh
    chown ec2-user:ec2-user /home/ec2-user/connect-rds.sh
  EOF

  tags = {
    Name        = "${var.project_name}-bastion"
    AnsibleRole = "bastion"
  }
}
