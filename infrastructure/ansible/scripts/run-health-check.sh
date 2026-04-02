#!/usr/bin/env bash
# ============================================
# FastMeals — Run Health Check (wrapper)
# ============================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$SCRIPT_DIR"

TAG="${1:-}"

echo "🏥 FastMeals — Infrastructure Health Check"
echo "=========================================="

EXTRA_ARGS=""
if [ -n "$TAG" ]; then
  EXTRA_ARGS="--tags $TAG"
  echo "Scope: $TAG"
else
  echo "Scope: FULL (RDS, Redis, API, Bastion)"
fi

echo ""
ansible-playbook playbooks/health-check.yml $EXTRA_ARGS "$@"