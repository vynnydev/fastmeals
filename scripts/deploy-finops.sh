#!/usr/bin/env bash
# ============================================
# FastMeals — Deploy FinOps Dashboard
# Builds React SPA and deploys to S3 + CloudFront
# ============================================
# Usage:
#   ./scripts/deploy-finops.sh
# ============================================
set -euo pipefail

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

DASHBOARD_DIR="infrastructure/finops/dashboard"
S3_BUCKET="fastmeals-finops-dashboard"
DISTRIBUTION_ID=""

echo -e "${BLUE}💰 FastMeals — Deploying FinOps Dashboard${NC}"
echo "=========================================="

# --- Get CloudFront Distribution ID ---
echo -e "${GREEN}[1/5] Getting CloudFront Distribution ID...${NC}"
DISTRIBUTION_ID=$(aws cloudfront list-distributions \
  --query "DistributionList.Items[?Comment=='FastMeals FinOps Dashboard'].Id | [0]" \
  --output text 2>/dev/null || echo "")

if [ -z "$DISTRIBUTION_ID" ] || [ "$DISTRIBUTION_ID" = "None" ]; then
  echo "⚠️  CloudFront distribution not found. Deploying to S3 only."
  echo "   Run 'terraform apply' first to create the infrastructure."
fi

# --- Install dependencies ---
echo -e "${GREEN}[2/5] Installing dependencies...${NC}"
cd "$DASHBOARD_DIR"
npm ci --silent

# --- Build ---
echo -e "${GREEN}[3/5] Building dashboard...${NC}"
npm run build
echo "  Build output: $(du -sh dist | cut -f1)"

# --- Upload to S3 ---
echo -e "${GREEN}[4/5] Uploading to S3...${NC}"
aws s3 sync dist/ "s3://${S3_BUCKET}/" \
  --delete \
  --cache-control "public, max-age=3600" \
  --quiet

# Cache-bust index.html
aws s3 cp dist/index.html "s3://${S3_BUCKET}/index.html" \
  --cache-control "no-cache, no-store, must-revalidate" \
  --quiet

echo "  ✅ Uploaded to s3://${S3_BUCKET}/"

# --- Invalidate CloudFront ---
if [ -n "$DISTRIBUTION_ID" ] && [ "$DISTRIBUTION_ID" != "None" ]; then
  echo -e "${GREEN}[5/5] Invalidating CloudFront cache...${NC}"
  INVALIDATION_ID=$(aws cloudfront create-invalidation \
    --distribution-id "$DISTRIBUTION_ID" \
    --paths "/*" \
    --query 'Invalidation.Id' \
    --output text)
  echo "  ✅ Invalidation: $INVALIDATION_ID"
else
  echo -e "${GREEN}[5/5] Skipping CloudFront invalidation (no distribution found)${NC}"
fi

cd - > /dev/null

echo ""
echo "=========================================="
echo -e "${GREEN}✅ Deploy complete!${NC}"
if [ -n "$DISTRIBUTION_ID" ] && [ "$DISTRIBUTION_ID" != "None" ]; then
  DOMAIN=$(aws cloudfront get-distribution --id "$DISTRIBUTION_ID" \
    --query 'Distribution.DomainName' --output text 2>/dev/null || echo "")
  echo "  URL: https://${DOMAIN}"
fi
echo "  S3:  s3://${S3_BUCKET}/"
echo "=========================================="
