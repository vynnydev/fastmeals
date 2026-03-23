#!/bin/bash
set -e

REGION="us-east-1"
ACCOUNT_ID="009001720984"
ECR_REPO="fastmeals-frontend"
CLUSTER="fastmeals-cluster"
SERVICE="fastmeals-frontend"
API_URL="https://j7193c8hbe.execute-api.us-east-1.amazonaws.com"

echo "🖥  FastMeals — Frontend Deploy to ECS Fargate"
echo "================================================"

# Login ECR
echo "📦 Step 1: ECR Login..."
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

# Build
echo "🔨 Step 2: Building Docker image..."
cd "$(dirname "$0")/../../frontend"
docker build --build-arg NEXT_PUBLIC_API_URL=$API_URL -t $ECR_REPO .

# Tag + Push
echo "🚀 Step 3: Pushing to ECR..."
docker tag $ECR_REPO:latest $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$ECR_REPO:latest
docker push $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$ECR_REPO:latest

# Force new deployment
echo "♻️  Step 4: Deploying to ECS..."
aws ecs update-service --cluster $CLUSTER --service $SERVICE --force-new-deployment --region $REGION > /dev/null

echo ""
echo "✅ Deploy complete!"
echo "   Frontend will be available in ~2 minutes at the ALB URL"
echo "   Check status: aws ecs describe-services --cluster $CLUSTER --services $SERVICE --query 'services[0].deployments' --region $REGION"