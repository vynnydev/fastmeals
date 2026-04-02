#!/usr/bin/env bash
# ============================================
# FastMeals — Run Migrations (wrapper)
# ============================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$SCRIPT_DIR"

SERVICE="${1:-}"
DRY_RUN="${2:-false}"

echo "🔄 FastMeals — Running Prisma Migrations"
echo "=========================================="

EXTRA_VARS=""
if [ -n "$SERVICE" ]; then
  EXTRA_VARS="-e target_service=$SERVICE"
  echo "Target: $SERVICE"
else
  echo "Target: ALL services"
fi

if [ "$DRY_RUN" = "true" ] || [ "$DRY_RUN" = "--dry-run" ]; then
  EXTRA_VARS="$EXTRA_VARS -e dry_run=true"
  echo "Mode: DRY RUN"
fi

echo ""
ansible-playbook playbooks/migrations.yml $EXTRA_VARS "$@"