#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

echo "⚠️  FastMeals — Destroy Infrastructure"
echo "======================================="
echo ""
read -p "Are you sure you want to destroy all resources? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
  echo "Cancelled."
  exit 0
fi

cd "$ROOT_DIR/environments/production"
terraform init -input=false
terraform destroy -auto-approve

echo ""
echo "✅ All production resources destroyed."
echo ""
echo "⚠️  Bootstrap (S3 + DynamoDB) was NOT destroyed."
echo "   To destroy: cd bootstrap && terraform destroy"