#!/usr/bin/env bash
set -e

# ============================================
# FastMeals — Deploy Frontend to ECS Fargate
# ============================================

REGION="us-east-1"
ACCOUNT_ID="009001720984"
ECR_REPO="fastmeals-frontend"
CLUSTER="fastmeals-cluster"
SERVICE="fastmeals-frontend"

# Get API URL from Terraform
API_URL=$(cd infrastructure/terraform/environments/production && terraform output -raw api_gateway_url 2>/dev/null || echo "")
if [ -z "$API_URL" ]; then
  echo "⚠️  Could not get API Gateway URL. Using default."
  API_URL="https://t2fwiydcrc.execute-api.us-east-1.amazonaws.com"
fi

echo "🖥  FastMeals — Frontend Deploy to ECS Fargate"
echo "================================================"
echo "🔗 API URL: $API_URL"
echo ""

# Login ECR
echo "📦 Step 1: ECR Login..."
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

# Build
echo "🔨 Step 2: Building Docker image (linux/amd64)..."
cd frontend
docker build \
  --platform linux/amd64 \
  --build-arg NEXT_PUBLIC_API_URL=$API_URL \
  -t $ECR_REPO .

# Tag + Push
echo "🚀 Step 3: Pushing to ECR..."
docker tag $ECR_REPO:latest $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$ECR_REPO:latest
docker push $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$ECR_REPO:latest

# Deploy
echo "♻️  Step 4: Deploying to ECS..."
aws ecs update-service --cluster $CLUSTER --service $SERVICE --force-new-deployment --region $REGION > /dev/null

echo ""
echo "✅ Deploy complete!"
echo "   Frontend will be available in ~2 minutes"
echo "   URL: https://fastmeals.com.br"
echo ""
echo "   Check: aws ecs describe-services --cluster $CLUSTER --services $SERVICE --query 'services[0].{running:runningCount,desired:desiredCount}' --region $REGION"