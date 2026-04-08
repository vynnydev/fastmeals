#!/usr/bin/env bash
set -e

# ============================================
# FastMeals — Deploy Lambda Functions v4
# Usage:
#   ./scripts/deploy-lambdas.sh              # Interactive menu
#   ./scripts/deploy-lambdas.sh all          # Deploy all
#   ./scripts/deploy-lambdas.sh auth         # Deploy auth only
#   ./scripts/deploy-lambdas.sh products     # Deploy products only
#   ./scripts/deploy-lambdas.sh orders       # Deploy orders only
#   ./scripts/deploy-lambdas.sh delivery     # Deploy delivery only
#   ./scripts/deploy-lambdas.sh optimization # Deploy optimization only
#   ./scripts/deploy-lambdas.sh reports      # Deploy reports only
#   ./scripts/deploy-lambdas.sh auth orders  # Deploy multiple
# ============================================

REGION="us-east-1"
PROJECT="fastmeals"
BUCKET="fastmeals-terraform-state-us-east-1"

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

  npm ci --silent 2>/dev/null

  if [ -f prisma/schema.prisma ]; then
    DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" npx prisma generate --no-hints 2>/dev/null
  fi

  npm run build 2>/dev/null

  echo "  📁 Packaging..."
  rm -rf lambda-package lambda-package.zip
  mkdir -p lambda-package

  cp -r dist lambda-package/
  cp package.json lambda-package/
  cp package-lock.json lambda-package/ 2>/dev/null || true

  cd lambda-package
  npm ci --omit=dev --silent 2>/dev/null

  if [ -d ../generated ]; then
    cp -r ../generated .
    if [ -d dist/generated/prisma ]; then
      find ../generated -name "libquery_engine-rhel-openssl-3.0.x.so.node" -exec cp {} dist/generated/prisma/ \; 2>/dev/null
    fi
    if [ -d dist/src/generated/prisma ]; then
      find ../generated -name "libquery_engine-rhel-openssl-3.0.x.so.node" -exec cp {} dist/src/generated/prisma/ \; 2>/dev/null
    fi
  fi

  # Keep ONLY rhel-openssl-3.0.x engine (Lambda runtime)
  find . -name "libquery_engine-*" ! -name "*rhel-openssl-3.0.x*" -delete 2>/dev/null || true
  # Remove unnecessary Prisma files
  find . -path "*/prisma/engines/*" -delete 2>/dev/null || true
  find . -path "*/@prisma/engines/*" -delete 2>/dev/null || true
  find . -name "*.d.ts" -delete 2>/dev/null || true
  find . -name "*.d.ts.map" -delete 2>/dev/null || true
  find . -name "*.js.map" -delete 2>/dev/null || true
  find . -name "CHANGELOG*" -delete 2>/dev/null || true
  find . -name "LICENSE" -delete 2>/dev/null || true
  find . -name "README.md" -delete 2>/dev/null || true
  find . -name "*.md" -not -path "*/prisma/*" -delete 2>/dev/null || true
  find . -type d -name "docs" -exec rm -rf {} + 2>/dev/null || true
  find . -type d -name "test" -exec rm -rf {} + 2>/dev/null || true
  find . -type d -name "tests" -exec rm -rf {} + 2>/dev/null || true
  find . -type d -name ".github" -exec rm -rf {} + 2>/dev/null || true

  local LAMBDA_PATH="dist/src/lambda"
  if [ ! -d "$LAMBDA_PATH" ] && [ -d "dist/lambda" ]; then
    LAMBDA_PATH="dist/lambda"
  fi

  for FN in "${FUNCTIONS[@]}"; do
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
const { handler } = require('./${LAMBDA_PATH}/${FILE_NAME}.handler');
module.exports = { handler };
WRAPPER
  done

  zip -r ../lambda-package.zip . -x "*.ts" "*.map" > /dev/null
  cd ..

  local SIZE=$(du -sh lambda-package.zip | cut -f1)
  echo "  📦 Size: $SIZE"

  local S3_KEY="lambda-packages/${SERVICE}.zip"
  echo "  ☁️  Uploading to S3..."
  aws s3 cp lambda-package.zip "s3://${BUCKET}/${S3_KEY}" --region $REGION > /dev/null

  for FN in "${FUNCTIONS[@]}"; do
    TOTAL=$((TOTAL + 1))
    echo "  🚀 Deploying ${PROJECT}-${FN}..."

    # Step 1: Update function code
    aws lambda update-function-code \
      --function-name "${PROJECT}-${FN}" \
      --s3-bucket "${BUCKET}" \
      --s3-key "${S3_KEY}" \
      --region "$REGION" \
      --no-cli-pager > /dev/null 2>&1

    aws lambda wait function-updated \
      --function-name "${PROJECT}-${FN}" \
      --region "$REGION" 2>/dev/null

    # Step 2: Update handler — check if Datadog tracing is enabled
    DD_ENABLED=$(aws lambda get-function-configuration \
      --function-name "${PROJECT}-${FN}" \
      --query 'Environment.Variables.DD_TRACE_ENABLED' \
      --output text \
      --region "$REGION" 2>/dev/null)

    if [ "$DD_ENABLED" = "true" ]; then
      # Datadog enabled: use Datadog wrapper handler, real handler goes to DD_LAMBDA_HANDLER
      aws lambda update-function-configuration \
        --function-name "${PROJECT}-${FN}" \
        --handler "/opt/nodejs/node_modules/datadog-lambda-js/handler.handler" \
        --region "$REGION" \
        --no-cli-pager > /dev/null 2>&1
    else
      # No Datadog: set handler directly
      aws lambda update-function-configuration \
        --function-name "${PROJECT}-${FN}" \
        --handler "${FN}-handler.handler" \
        --region "$REGION" \
        --no-cli-pager > /dev/null 2>&1
    fi

    aws lambda wait function-updated \
      --function-name "${PROJECT}-${FN}" \
      --region "$REGION" 2>/dev/null

    local STATUS=$(aws lambda get-function-configuration \
      --function-name "${PROJECT}-${FN}" \
      --query "LastUpdateStatus" \
      --output text \
      --region "$REGION" 2>/dev/null)

    if [ "$STATUS" = "Successful" ]; then
      echo "     ✅ OK $([ "$DD_ENABLED" = "true" ] && echo "(Datadog tracing)")"
      SUCCESS=$((SUCCESS + 1))
    else
      echo "     ❌ FAILED ($STATUS)"
      FAILED=$((FAILED + 1))
    fi
  done

  rm -rf lambda-package lambda-package.zip
  cd ../../..
}

# ============================================
# Service definitions
# ============================================

deploy_auth()         { deploy_service "auth-service" "auth-login" "auth-refresh_token"; }
deploy_products()     { deploy_service "products-service" "products-list" "products-get" "products-create" "products-update" "products-delete"; }
deploy_orders()       { deploy_service "orders-service" "orders-list" "orders-get" "orders-create" "orders-update_status" "orders-assign"; }
deploy_delivery()     { deploy_service "delivery-service" "delivery-list" "delivery-get" "delivery-create" "delivery-update" "delivery-delete"; }
deploy_optimization() { deploy_service "optimization-service" "optimization-execute"; }
deploy_reports()      { deploy_service "reports-service" "reports-revenue" "reports-orders_status" "reports-top_products" "reports-delivery_time" "reports-ai_insights"; }

deploy_all() {
  deploy_auth
  deploy_products
  deploy_orders
  deploy_delivery
  deploy_optimization
  deploy_reports
}

# ============================================
# Interactive menu or CLI arguments
# ============================================

show_menu() {
  echo "🚀 FastMeals — Deploy Lambda Functions"
  echo "======================================="
  echo ""
  echo "Qual serviço deseja deployar?"
  echo ""
  echo "  1) auth-service        (2 functions)"
  echo "  2) products-service    (5 functions)"
  echo "  3) orders-service      (5 functions)"
  echo "  4) delivery-service    (5 functions)"
  echo "  5) optimization-service (1 function)"
  echo "  6) reports-service     (5 functions)"
  echo "  7) Todos               (23 functions)"
  echo "  0) Sair"
  echo ""
  read -p "Escolha (0-7, ou múltiplos separados por espaço): " CHOICES

  for choice in $CHOICES; do
    case $choice in
      1) deploy_auth ;;
      2) deploy_products ;;
      3) deploy_orders ;;
      4) deploy_delivery ;;
      5) deploy_optimization ;;
      6) deploy_reports ;;
      7) deploy_all ;;
      0) echo "👋 Bye!"; exit 0 ;;
      *) echo "❌ Opção inválida: $choice" ;;
    esac
  done
}

# ============================================
# Main
# ============================================

if [ $# -eq 0 ]; then
  # No arguments — show interactive menu
  show_menu
else
  echo "🚀 FastMeals — Deploy Lambda Functions"
  echo "======================================="

  for arg in "$@"; do
    case $arg in
      all)          deploy_all ;;
      auth)         deploy_auth ;;
      products)     deploy_products ;;
      orders)       deploy_orders ;;
      delivery)     deploy_delivery ;;
      optimization) deploy_optimization ;;
      reports)      deploy_reports ;;
      *)            echo "❌ Serviço desconhecido: $arg. Use: auth|products|orders|delivery|optimization|reports|all" ;;
    esac
  done
fi

echo ""
echo "============================================"
echo "📊 Deploy Summary"
echo "   Total:   $TOTAL functions"
echo "   Success: $SUCCESS"
echo "   Failed:  $FAILED"
echo "============================================"

if [ $FAILED -eq 0 ] && [ $TOTAL -gt 0 ]; then
  echo ""
  echo "🎉 Deploy complete!"
fi