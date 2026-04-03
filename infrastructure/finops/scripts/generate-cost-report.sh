#!/usr/bin/env bash
# ============================================
# FastMeals — Generate Local Cost Report
# Runs Infracost locally and generates HTML + table output
# ============================================
# Usage:
#   ./scripts/generate-cost-report.sh              # Table output
#   ./scripts/generate-cost-report.sh --html       # HTML report
#   ./scripts/generate-cost-report.sh --json       # JSON output
# ============================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TF_ROOT="$SCRIPT_DIR/../terraform/environments/production"
USAGE_FILE="$SCRIPT_DIR/infracost.yml"
REPORTS_DIR="$SCRIPT_DIR/reports"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
FORMAT="${1:-}"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}💰 FastMeals — Infrastructure Cost Report${NC}"
echo "=========================================="

# Check Infracost is installed
if ! command -v infracost &> /dev/null; then
  echo "❌ Infracost not installed. Run: brew install infracost && infracost auth login"
  exit 1
fi

# Ensure reports directory exists
mkdir -p "$REPORTS_DIR"

# Generate JSON breakdown (always needed)
echo -e "${GREEN}Analyzing Terraform...${NC}"
infracost breakdown \
  --path="$TF_ROOT" \
  --usage-file="$USAGE_FILE" \
  --format=json \
  --out-file="$REPORTS_DIR/cost-report-$TIMESTAMP.json"

case "$FORMAT" in
  --html)
    echo -e "${GREEN}Generating HTML report...${NC}"
    infracost output \
      --path="$REPORTS_DIR/cost-report-$TIMESTAMP.json" \
      --format=html \
      --out-file="$REPORTS_DIR/cost-report-$TIMESTAMP.html"
    echo ""
    echo -e "✅ HTML report: ${GREEN}$REPORTS_DIR/cost-report-$TIMESTAMP.html${NC}"
    echo "Opening in browser..."
    open "$REPORTS_DIR/cost-report-$TIMESTAMP.html" 2>/dev/null || \
      xdg-open "$REPORTS_DIR/cost-report-$TIMESTAMP.html" 2>/dev/null || \
      echo "Open manually: $REPORTS_DIR/cost-report-$TIMESTAMP.html"
    ;;
  --json)
    echo ""
    cat "$REPORTS_DIR/cost-report-$TIMESTAMP.json" | jq '.totalMonthlyCost, .totalHourlyCost'
    echo -e "\n✅ JSON report: ${GREEN}$REPORTS_DIR/cost-report-$TIMESTAMP.json${NC}"
    ;;
  *)
    # Default: table output
    echo ""
    infracost output \
      --path="$REPORTS_DIR/cost-report-$TIMESTAMP.json" \
      --format=table
    echo ""
    echo -e "✅ JSON saved: ${GREEN}$REPORTS_DIR/cost-report-$TIMESTAMP.json${NC}"
    ;;
esac

echo ""
echo "=========================================="
echo "💡 Tips:"
echo "  --html    Open interactive HTML report in browser"
echo "  --json    Raw JSON for programmatic access"
echo "  (none)    Table summary in terminal"
echo "=========================================="