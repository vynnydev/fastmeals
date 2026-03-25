#!/usr/bin/env bash
set -e

echo "🚀 FastMeals — Full Production Deploy"
echo "======================================="
echo ""

# Step 1: Terraform
echo "🏗  Step 1/3: Terraform Apply..."
cd infrastructure/terraform/environments/production
terraform init -upgrade > /dev/null
terraform apply -auto-approve -var-file="secrets.tfvars"
cd ../../../..

# Step 2: Deploy Lambdas
echo ""
echo "⚡ Step 2/3: Deploy Lambda Functions..."
bash scripts/deploy-lambdas.sh

# Step 3: Deploy Frontend
echo ""
echo "🖥  Step 3/3: Deploy Frontend..."
bash scripts/deploy-frontend.sh

echo ""
echo "======================================="
echo "🎉 Full deploy complete!"
echo ""
echo "   Frontend: https://fastmeals.com.br"
echo "   API: $(cd infrastructure/terraform/environments/production && terraform output -raw api_gateway_url)"
echo "======================================="