#!/usr/bin/env bash
# ============================================
# FastMeals — Run Disaster Recovery (wrapper)
# ============================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$SCRIPT_DIR"

DB="${1:-}"
PREFIX="${2:-}"

echo "🔄 FastMeals — Disaster Recovery"
echo "=========================================="
echo "⚠️  WARNING: This will DROP and RECREATE databases!"
echo ""

EXTRA_VARS=""
if [ -n "$DB" ]; then
  EXTRA_VARS="-e target_db=$DB"
  echo "Target: $DB"
else
  echo "Target: ALL databases"
fi

if [ -n "$PREFIX" ]; then
  EXTRA_VARS="$EXTRA_VARS -e restore_prefix=$PREFIX"
  echo "Source: $PREFIX"
else
  echo "Source: Latest backup"
fi

echo ""
ansible-playbook playbooks/disaster-recovery.yml $EXTRA_VARS "$@"