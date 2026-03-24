#!/usr/bin/env bash
set -e

# ============================================
# FastMeals — Deploy All Lambda Functions
# Handles: index.js wrapper, Prisma Linux engine,
#          S3 upload, correct handler paths
# ============================================

REGION="us-east-1"
PROJECT="fastmeals"
BUCKET="fastmeals-terraform-state-us-east-1"

echo "🚀 FastMeals — Deploy All Lambda Functions"
echo "============================================"
echo ""

TOTAL=0
SUCCESS=0
FAILED=0

deploy_service() {
  local SERVICE=$1
  shift
  local FUNCTIONS=("$@")

  echo ""
  echo "📦 [$SERVICE] Installing + Building..."
  cd backend/services/$SERVICE

  # Install
  npm ci --silent 2>/dev/null

  # Generate Prisma if exists
  if [ -f prisma/schema.prisma ]; then
    DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" npx prisma generate --no-hints 2>/dev/null
  fi

  # Build
  npm run build 2>/dev/null

  # Package
  echo "  📁 Packaging..."
  rm -rf lambda-package lambda-package.zip
  mkdir -p lambda-package

  # Copy compiled code
  cp -r dist lambda-package/
  cp package.json lambda-package/
  cp package-lock.json lambda-package/ 2>/dev/null || true

  # Install production deps only
  cd lambda-package
  npm ci --omit=dev --silent 2>/dev/null

  # Copy Prisma engine for Lambda (Linux)
  if [ -d ../generated ]; then
    cp -r ../generated .
    # Copy Linux engine to dist/generated/prisma/ (where Prisma looks at runtime)
    if [ -d dist/generated/prisma ]; then
      find ../generated -name "libquery_engine-rhel-openssl-3.0.x.so.node" -exec cp {} dist/generated/prisma/ \; 2>/dev/null
    fi
  fi

  # Remove Mac/Windows engines (save space)
  find . -name "libquery_engine-darwin*" -delete 2>/dev/null || true
  find . -name "libquery_engine-windows*" -delete 2>/dev/null || true
  find . -name "query_engine-windows*" -delete 2>/dev/null || true

  # Remove unnecessary files (save space)
  find . -name "*.d.ts" -delete 2>/dev/null || true
  find . -name "*.d.ts.map" -delete 2>/dev/null || true
  find . -name "*.js.map" -delete 2>/dev/null || true
  find . -name "CHANGELOG*" -delete 2>/dev/null || true
  find . -name "LICENSE" -delete 2>/dev/null || true
  find . -name "README.md" -delete 2>/dev/null || true

  # Create index.js wrappers for each function
  for FN in "${FUNCTIONS[@]}"; do
    # Convert function name to file name
    # auth-login -> auth-login
    # auth-refresh_token -> auth-refresh-token
    # orders-update_status -> orders-update-status
    # orders-assign -> orders-assign-delivery
    # reports-orders_status -> reports-orders-by-status
    # reports-delivery_time -> reports-avg-delivery
    # reports-ai_insights -> reports-ai-insights
    local FILE_NAME=""
    case "$FN" in
      "auth-login")            FILE_NAME="auth-login" ;;
      "auth-refresh_token")    FILE_NAME="auth-refresh-token" ;;
      "products-list")         FILE_NAME="products-list" ;;
      "products-get")          FILE_NAME="products-get" ;;
      "products-create")       FILE_NAME="products-create" ;;
      "products-update")       FILE_NAME="products-update" ;;
      "products-delete")       FILE_NAME="products-delete" ;;
      "orders-list")           FILE_NAME="orders-list" ;;
      "orders-get")            FILE_NAME="orders-get" ;;
      "orders-create")         FILE_NAME="orders-create" ;;
      "orders-update_status")  FILE_NAME="orders-update-status" ;;
      "orders-assign")         FILE_NAME="orders-assign-delivery" ;;
      "delivery-list")         FILE_NAME="delivery-list" ;;
      "delivery-get")          FILE_NAME="delivery-get" ;;
      "delivery-create")       FILE_NAME="delivery-create" ;;
      "delivery-update")       FILE_NAME="delivery-update" ;;
      "delivery-delete")       FILE_NAME="delivery-delete" ;;
      "optimization-execute")  FILE_NAME="optimization-execute" ;;
      "reports-revenue")       FILE_NAME="reports-revenue" ;;
      "reports-orders_status") FILE_NAME="reports-orders-by-status" ;;
      "reports-top_products")  FILE_NAME="reports-top-products" ;;
      "reports-delivery_time") FILE_NAME="reports-avg-delivery" ;;
      "reports-ai_insights")   FILE_NAME="reports-ai-insights" ;;
      *) FILE_NAME="$FN" ;;
    esac

    cat > "${FN}-handler.js" << WRAPPER
const { handler } = require('./dist/src/lambda/${FILE_NAME}.handler');
module.exports = { handler };
WRAPPER
  done

  # Zip
  zip -r ../lambda-package.zip . -x "*.ts" "*.map" > /dev/null
  cd ..

  local SIZE=$(du -sh lambda-package.zip | cut -f1)
  echo "  📦 Size: $SIZE"

  # Upload to S3
  local S3_KEY="lambda-packages/${SERVICE}.zip"
  echo "  ☁️  Uploading to S3..."
  aws s3 cp lambda-package.zip "s3://${BUCKET}/${S3_KEY}" --region $REGION > /dev/null

  # Deploy each function
  for FN in "${FUNCTIONS[@]}"; do
    TOTAL=$((TOTAL + 1))
    echo "  🚀 Deploying ${PROJECT}-${FN}..."

    # Update code from S3
    aws lambda update-function-code \
      --function-name "${PROJECT}-${FN}" \
      --s3-bucket "${BUCKET}" \
      --s3-key "${S3_KEY}" \
      --region "$REGION" \
      --no-cli-pager > /dev/null 2>&1

    # Wait for code update
    aws lambda wait function-updated \
      --function-name "${PROJECT}-${FN}" \
      --region "$REGION" 2>/dev/null

    # Update handler to use wrapper
    aws lambda update-function-configuration \
      --function-name "${PROJECT}-${FN}" \
      --handler "${FN}-handler.handler" \
      --region "$REGION" \
      --no-cli-pager > /dev/null 2>&1

    # Wait for config update
    aws lambda wait function-updated \
      --function-name "${PROJECT}-${FN}" \
      --region "$REGION" 2>/dev/null

    # Verify
    local STATUS=$(aws lambda get-function-configuration \
      --function-name "${PROJECT}-${FN}" \
      --query "LastUpdateStatus" \
      --output text \
      --region "$REGION" 2>/dev/null)

    if [ "$STATUS" = "Successful" ]; then
      echo "     ✅ OK"
      SUCCESS=$((SUCCESS + 1))
    else
      echo "     ❌ FAILED ($STATUS)"
      FAILED=$((FAILED + 1))
    fi
  done

  # Cleanup
  rm -rf lambda-package lambda-package.zip
  cd ../../..
}

# ============================================
# Deploy all services
# ============================================

deploy_service "auth-service" \
  "auth-login" "auth-refresh_token"

deploy_service "products-service" \
  "products-list" "products-get" "products-create" "products-update" "products-delete"

deploy_service "orders-service" \
  "orders-list" "orders-get" "orders-create" "orders-update_status" "orders-assign"

deploy_service "delivery-service" \
  "delivery-list" "delivery-get" "delivery-create" "delivery-update" "delivery-delete"

deploy_service "optimization-service" \
  "optimization-execute"

deploy_service "reports-service" \
  "reports-revenue" "reports-orders_status" "reports-top_products" "reports-delivery_time" "reports-ai_insights"

echo ""
echo "============================================"
echo "📊 Deploy Summary"
echo "   Total:   $TOTAL functions"
echo "   Success: $SUCCESS"
echo "   Failed:  $FAILED"
echo "============================================"

if [ $FAILED -eq 0 ]; then
  echo ""
  echo "🎉 All functions deployed successfully!"
  echo ""
  echo "Test with:"
  echo "  curl https://j7193c8hbe.execute-api.us-east-1.amazonaws.com/api/products"
  echo "  curl -X POST https://j7193c8hbe.execute-api.us-east-1.amazonaws.com/api/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"admin@fastmeals.com\",\"password\":\"Admin@123\"}'"
fi