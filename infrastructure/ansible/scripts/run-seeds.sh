#!/usr/bin/env bash
# ============================================
# FastMeals — Run Seeds (wrapper)
# ============================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$SCRIPT_DIR"

SERVICE="${1:-}"
RESET="${2:-false}"

echo "🌱 FastMeals — Running Database Seeds"
echo "=========================================="

EXTRA_VARS=""
if [ -n "$SERVICE" ]; then
  EXTRA_VARS="-e target_service=$SERVICE"
  echo "Target: $SERVICE"
else
  echo "Target: ALL services"
fi

if [ "$RESET" = "true" ] || [ "$RESET" = "--reset" ]; then
  EXTRA_VARS="$EXTRA_VARS -e reset_before_seed=true"
  echo "⚠️  Mode: RESET + SEED (will drop data first!)"
fi

echo ""
ansible-playbook playbooks/seed.yml $EXTRA_VARS "$@"