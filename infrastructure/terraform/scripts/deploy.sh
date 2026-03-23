#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

echo "🏗  FastMeals — AWS Infrastructure Deploy"
echo "=========================================="
echo ""

# --- Step 1: Bootstrap ---
echo "📦 Step 1: Bootstrap (S3 + DynamoDB for state)..."
cd "$ROOT_DIR/bootstrap"

if terraform output -json 2>/dev/null | grep -q "state_bucket_name"; then
  echo "   ✅ Bootstrap already exists, skipping."
else
  echo "   Initializing..."
  terraform init -input=false
  echo "   Planning..."
  terraform plan -out tfplan
  echo "   Applying..."
  terraform apply tfplan
  rm -f tfplan
  echo "   ✅ Bootstrap created."
fi

echo ""

# --- Step 2: Production ---
echo "🚀 Step 2: Production infrastructure..."
cd "$ROOT_DIR/environments/production"

echo "   Initializing..."
terraform init -input=false

echo "   Planning..."
terraform plan -out tfplan

echo ""
read -p "   Apply changes? (yes/no): " confirm
if [ "$confirm" = "yes" ]; then
  terraform apply tfplan
  rm -f tfplan
  echo ""
  echo "✅ Deploy complete!"
  echo ""
  terraform output
else
  echo "   ❌ Cancelled."
  rm -f tfplan
fi