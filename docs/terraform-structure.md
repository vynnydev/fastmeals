terraform/
├── bootstrap/                    # Executa PRIMEIRO (estado remoto)
│   ├── main.tf                   # S3 bucket + DynamoDB para tfstate
│   ├── variables.tf
│   └── outputs.tf
│
├── modules/                      # Módulos reutilizáveis
│   ├── networking/               # VPC, Subnets, Security Groups
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── database/                 # RDS PostgreSQL
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── cache/                    # ElastiCache Redis
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── messaging/                # Amazon MQ (RabbitMQ)
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── lambda/                   # Lambda functions + API Gateway
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── frontend/                 # Amplify
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   └── dns/                      # Route53 (fastmeals.com.br)
│       ├── main.tf
│       ├── variables.tf
│       └── outputs.tf
│
├── environments/
│   └── production/
│       ├── main.tf               # Chama os módulos
│       ├── variables.tf
│       ├── terraform.tfvars
│       ├── backend.tf            # Remote state config (S3)
│       └── outputs.tf
│
├── scripts/
│   ├── deploy.sh                 # Script de deploy completo
│   ├── plan.sh                   # terraform plan -out tfplan
│   └── destroy.sh                # Cleanup
│
└── README.md                     # Instruções do Terraform