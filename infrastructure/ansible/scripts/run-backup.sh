#!/usr/bin/env bash
# ============================================
# FastMeals — Run Backup (wrapper)
# ============================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$SCRIPT_DIR"

DB="${1:-}"
TAG="${2:-manual}"

echo "💾 FastMeals — Database Backup to S3"
echo "=========================================="

EXTRA_VARS="-e backup_tag=$TAG"
if [ -n "$DB" ]; then
  EXTRA_VARS="$EXTRA_VARS -e target_db=$DB"
  echo "Target: $DB"
else
  echo "Target: ALL databases"
fi
echo "Tag: $TAG"

echo ""
ansible-playbook playbooks/backup.yml $EXTRA_VARS "$@"