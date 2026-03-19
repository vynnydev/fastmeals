#!/bin/bash

# ============================================
# FastMeals — Full Flow Test (Evaluator Script)
# ============================================
# This script tests the complete platform flow.
# Run AFTER 'docker-compose up --build'
#
# Usage:
#   chmod +x scripts/test-flow.sh
#   ./scripts/test-flow.sh
#
# Prerequisites:
#   - Docker containers running (docker-compose up --build)
#   - curl (pre-installed on macOS/Linux)
#   - jq (JSON parser)
# ============================================

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

PASSED=0
FAILED=0
TOTAL=0

# ──────────────────────────────────
# Helper functions
# ──────────────────────────────────

print_header() {
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}  $1${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_step() {
    echo ""
    echo -e "${YELLOW}▸ $1${NC}"
}

assert_status() {
    local description=$1
    local expected=$2
    local actual=$3
    TOTAL=$((TOTAL + 1))

    if [ "$expected" = "$actual" ]; then
        echo -e "  ${GREEN}✅ PASS${NC} — $description (HTTP $actual)"
        PASSED=$((PASSED + 1))
    else
        echo -e "  ${RED}❌ FAIL${NC} — $description (expected HTTP $expected, got HTTP $actual)"
        FAILED=$((FAILED + 1))
    fi
}

assert_json_field() {
    local description=$1
    local json=$2
    local field=$3
    local expected=$4
    TOTAL=$((TOTAL + 1))

    local actual=$(echo "$json" | jq -r "$field" 2>/dev/null)

    if [ "$actual" = "$expected" ]; then
        echo -e "  ${GREEN}✅ PASS${NC} — $description ($field = $actual)"
        PASSED=$((PASSED + 1))
    else
        echo -e "  ${RED}❌ FAIL${NC} — $description (expected $field = $expected, got $actual)"
        FAILED=$((FAILED + 1))
    fi
}

assert_json_exists() {
    local description=$1
    local json=$2
    local field=$3
    TOTAL=$((TOTAL + 1))

    local actual=$(echo "$json" | jq -r "$field" 2>/dev/null)

    if [ "$actual" != "null" ] && [ -n "$actual" ]; then
        echo -e "  ${GREEN}✅ PASS${NC} — $description ($field exists)"
        PASSED=$((PASSED + 1))
    else
        echo -e "  ${RED}❌ FAIL${NC} — $description ($field not found)"
        FAILED=$((FAILED + 1))
    fi
}

wait_step() {
    local seconds=$1
    echo -e "  ${CYAN}⏳ Waiting ${seconds}s...${NC}"
    sleep $seconds
}

# ══════════════════════════════════════════
# STEP 0: Check Prerequisites
# ══════════════════════════════════════════

print_header "Step 0: Checking prerequisites"

# Check curl
if command -v curl &> /dev/null; then
    CURL_VERSION=$(curl --version | head -1 | awk '{print $2}')
    echo -e "  ${GREEN}✅ curl found (v$CURL_VERSION)${NC}"
else
    echo -e "  ${RED}❌ curl not found. Please install curl.${NC}"
    echo "     macOS: pre-installed"
    echo "     Ubuntu: sudo apt install curl"
    exit 1
fi

# Check jq
if command -v jq &> /dev/null; then
    JQ_VERSION=$(jq --version 2>&1)
    echo -e "  ${GREEN}✅ jq found ($JQ_VERSION)${NC}"
else
    echo -e "  ${RED}❌ jq not found. Please install jq.${NC}"
    echo "     macOS: brew install jq"
    echo "     Ubuntu: sudo apt install jq"
    echo "     Windows: choco install jq"
    exit 1
fi

# Check Docker
if command -v docker &> /dev/null; then
    if docker info &> /dev/null; then
        echo -e "  ${GREEN}✅ Docker is running${NC}"
    else
        echo -e "  ${RED}❌ Docker is installed but not running. Please start Docker Desktop.${NC}"
        exit 1
    fi
else
    echo -e "  ${RED}❌ Docker not found. Please install Docker.${NC}"
    exit 1
fi

# Check if containers are running
RUNNING_CONTAINERS=$(docker ps --format '{{.Names}}' | grep fastmeals | wc -l | tr -d ' ')
if [ "$RUNNING_CONTAINERS" -lt 5 ]; then
    echo -e "  ${RED}❌ FastMeals containers not running ($RUNNING_CONTAINERS found).${NC}"
    echo "     Please run: docker-compose up --build"
    exit 1
fi
echo -e "  ${GREEN}✅ $RUNNING_CONTAINERS FastMeals containers running${NC}"

echo ""
echo -e "${GREEN}All prerequisites met. Starting tests...${NC}"
wait_step 2

# ══════════════════════════════════════════
# STEP 1: Health Checks
# ══════════════════════════════════════════

print_header "Step 1: Health Checks — All 6 microservices"

SERVICES=(
    "Auth Service|http://localhost:3001/health"
    "Products Service|http://localhost:3002/health"
    "Orders Service|http://localhost:3003/health"
    "Delivery Service|http://localhost:3004/health"
    "Optimization Service|http://localhost:3005/health"
    "Reports Service|http://localhost:3006/health"
)

for SERVICE in "${SERVICES[@]}"; do
    IFS='|' read -r NAME URL <<< "$SERVICE"
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$URL" 2>/dev/null || echo "000")
    assert_status "$NAME health check" "200" "$STATUS"
done

wait_step 2

# ══════════════════════════════════════════
# STEP 2: Authentication
# ══════════════════════════════════════════

print_header "Step 2: Authentication — JWT Login + Token Validation"

print_step "2.1 Admin login (valid credentials)"
ADMIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@fastmeals.com", "password": "Admin@123"}')

ADMIN_STATUS=$(echo "$ADMIN_RESPONSE" | tail -1)
ADMIN_BODY=$(echo "$ADMIN_RESPONSE" | sed '$d')
TOKEN=$(echo "$ADMIN_BODY" | jq -r '.accessToken')

assert_status "Admin login" "200" "$ADMIN_STATUS"
assert_json_exists "Access token returned" "$ADMIN_BODY" ".accessToken"
assert_json_field "User role is admin" "$ADMIN_BODY" ".user.role" "admin"

print_step "2.2 Viewer login (valid credentials)"
VIEWER_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "viewer@fastmeals.com", "password": "Viewer@123"}')

VIEWER_STATUS=$(echo "$VIEWER_RESPONSE" | tail -1)
VIEWER_BODY=$(echo "$VIEWER_RESPONSE" | sed '$d')
VIEWER_TOKEN=$(echo "$VIEWER_BODY" | jq -r '.accessToken')

assert_status "Viewer login" "200" "$VIEWER_STATUS"
assert_json_field "User role is viewer" "$VIEWER_BODY" ".user.role" "viewer"

print_step "2.3 Invalid credentials (should return 401)"
INVALID_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@fastmeals.com", "password": "wrongpassword"}')

INVALID_STATUS=$(echo "$INVALID_RESPONSE" | tail -1)
INVALID_BODY=$(echo "$INVALID_RESPONSE" | sed '$d')

assert_status "Invalid credentials rejected" "401" "$INVALID_STATUS"
assert_json_field "Error code is INVALID_CREDENTIALS" "$INVALID_BODY" ".error.code" "INVALID_CREDENTIALS"

print_step "2.4 Missing fields (should return 400)"
MISSING_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@fastmeals.com"}')

assert_status "Missing password rejected" "400" "$MISSING_RESPONSE"

wait_step 2

# ══════════════════════════════════════════
# STEP 3: Products CRUD
# ══════════════════════════════════════════

print_header "Step 3: Products — CRUD Operations + Authorization"

print_step "3.1 List products (admin)"
PRODUCTS_RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:3002/api/products \
  -H "Authorization: Bearer $TOKEN")

PRODUCTS_STATUS=$(echo "$PRODUCTS_RESPONSE" | tail -1)
PRODUCTS_BODY=$(echo "$PRODUCTS_RESPONSE" | sed '$d')

assert_status "List products" "200" "$PRODUCTS_STATUS"
assert_json_exists "Pagination returned" "$PRODUCTS_BODY" ".pagination.total"

PRODUCT1_ID=$(echo "$PRODUCTS_BODY" | jq -r '.data[0].id')
PRODUCT2_ID=$(echo "$PRODUCTS_BODY" | jq -r '.data[1].id')
PRODUCT_COUNT=$(echo "$PRODUCTS_BODY" | jq '.data | length')
echo -e "  ${CYAN}ℹ️  Found $PRODUCT_COUNT products${NC}"

print_step "3.2 Create product (admin)"
CREATE_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://localhost:3002/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Coxinha de Frango","description":"Coxinha crocante recheada com frango desfiado e catupiry cremoso","price":8.50,"category":"side","preparationTime":5}')

CREATE_STATUS=$(echo "$CREATE_RESPONSE" | tail -1)
CREATE_BODY=$(echo "$CREATE_RESPONSE" | sed '$d')
NEW_PRODUCT_ID=$(echo "$CREATE_BODY" | jq -r '.id')

assert_status "Create product" "201" "$CREATE_STATUS"
assert_json_field "Product name correct" "$CREATE_BODY" ".name" "Coxinha de Frango"

print_step "3.3 Viewer cannot create product (should return 403)"
FORBIDDEN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3002/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $VIEWER_TOKEN" \
  -d '{"name":"Test","description":"Test product desc","price":10,"category":"meal","preparationTime":10}')

assert_status "Viewer write access denied" "403" "$FORBIDDEN_STATUS"

print_step "3.4 Access without token (should return 401)"
NO_TOKEN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3002/api/products)

assert_status "No token rejected" "401" "$NO_TOKEN_STATUS"

print_step "3.5 Validation error (should return 400)"
VALIDATION_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3002/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"AB","price":-10,"category":"invalid"}')

assert_status "Validation error" "400" "$VALIDATION_STATUS"

wait_step 2

# ══════════════════════════════════════════
# STEP 4: Delivery Persons
# ══════════════════════════════════════════

print_header "Step 4: Delivery Persons — CRUD"

print_step "4.1 List delivery persons"
DP_RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:3004/api/delivery-persons \
  -H "Authorization: Bearer $TOKEN")

DP_STATUS=$(echo "$DP_RESPONSE" | tail -1)
DP_BODY=$(echo "$DP_RESPONSE" | sed '$d')

assert_status "List delivery persons" "200" "$DP_STATUS"

DP1_ID=$(echo "$DP_BODY" | jq -r '.data[0].id')
DP1_NAME=$(echo "$DP_BODY" | jq -r '.data[0].name')
DP_COUNT=$(echo "$DP_BODY" | jq '.data | length')
echo -e "  ${CYAN}ℹ️  Found $DP_COUNT delivery persons${NC}"

wait_step 2

# ══════════════════════════════════════════
# STEP 5: Order Lifecycle (State Machine)
# ══════════════════════════════════════════

print_header "Step 5: Order Lifecycle — Full State Machine"

print_step "5.1 Create order"
ORDER_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://localhost:3003/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"customerName\": \"João Silva\",
    \"customerPhone\": \"(11) 99999-1234\",
    \"deliveryAddress\": \"Rua das Flores, 123, Vila Mariana, São Paulo - SP\",
    \"latitude\": -23.5891,
    \"longitude\": -46.6378,
    \"items\": [
      { \"productId\": \"$PRODUCT1_ID\", \"quantity\": 2 },
      { \"productId\": \"$PRODUCT2_ID\", \"quantity\": 1 }
    ]
  }")

ORDER_STATUS=$(echo "$ORDER_RESPONSE" | tail -1)
ORDER_BODY=$(echo "$ORDER_RESPONSE" | sed '$d')
ORDER_ID=$(echo "$ORDER_BODY" | jq -r '.id')
ORDER_TOTAL=$(echo "$ORDER_BODY" | jq -r '.totalAmount')

assert_status "Create order" "201" "$ORDER_STATUS"
assert_json_field "Order status is pending" "$ORDER_BODY" ".status" "pending"
assert_json_exists "Total amount calculated" "$ORDER_BODY" ".totalAmount"
echo -e "  ${CYAN}ℹ️  Order ID: $ORDER_ID | Total: R$ $ORDER_TOTAL${NC}"

wait_step 1

print_step "5.2 Transition: pending → preparing"
PREP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X PATCH "http://localhost:3003/api/orders/$ORDER_ID/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"status": "preparing"}')

assert_status "pending → preparing" "200" "$PREP_STATUS"

wait_step 1

print_step "5.3 Transition: preparing → ready"
READY_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X PATCH "http://localhost:3003/api/orders/$ORDER_ID/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"status": "ready"}')

assert_status "preparing → ready" "200" "$READY_STATUS"

wait_step 1

print_step "5.4 Assign delivery person"
ASSIGN_RESPONSE=$(curl -s -w "\n%{http_code}" -X PATCH "http://localhost:3003/api/orders/$ORDER_ID/assign" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"deliveryPersonId\": \"$DP1_ID\"}")

ASSIGN_STATUS=$(echo "$ASSIGN_RESPONSE" | tail -1)
ASSIGN_BODY=$(echo "$ASSIGN_RESPONSE" | sed '$d')

assert_status "Assign delivery person" "200" "$ASSIGN_STATUS"
echo -e "  ${CYAN}ℹ️  Assigned to: $DP1_NAME${NC}"

wait_step 1

print_step "5.5 Transition: ready → delivering"
DELIVERING_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X PATCH "http://localhost:3003/api/orders/$ORDER_ID/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"status": "delivering"}')

assert_status "ready → delivering" "200" "$DELIVERING_STATUS"

wait_step 1

print_step "5.6 Transition: delivering → delivered"
DELIVERED_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X PATCH "http://localhost:3003/api/orders/$ORDER_ID/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"status": "delivered"}')

assert_status "delivering → delivered" "200" "$DELIVERED_STATUS"

wait_step 1

print_step "5.7 Invalid transition: delivered → pending (should return 422)"
INVALID_TRANS_RESPONSE=$(curl -s -w "\n%{http_code}" -X PATCH "http://localhost:3003/api/orders/$ORDER_ID/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"status": "pending"}')

INVALID_TRANS_STATUS=$(echo "$INVALID_TRANS_RESPONSE" | tail -1)
INVALID_TRANS_BODY=$(echo "$INVALID_TRANS_RESPONSE" | sed '$d')

assert_status "Invalid transition rejected" "422" "$INVALID_TRANS_STATUS"
assert_json_field "Error code INVALID_STATUS_TRANSITION" "$INVALID_TRANS_BODY" ".error.code" "INVALID_STATUS_TRANSITION"

wait_step 2

# ══════════════════════════════════════════
# STEP 6: Optimization Algorithm
# ══════════════════════════════════════════

print_header "Step 6: Optimization — Hungarian Algorithm + Haversine"

print_step "6.1 Execute optimization"
OPT_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://localhost:3005/api/orders/optimize-assignment \
  -H "Authorization: Bearer $TOKEN")

OPT_STATUS=$(echo "$OPT_RESPONSE" | tail -1)
OPT_BODY=$(echo "$OPT_RESPONSE" | sed '$d')

assert_status "Optimization executed" "200" "$OPT_STATUS"
assert_json_field "Algorithm is Hungarian" "$OPT_BODY" ".algorithm" "hungarian"
assert_json_exists "Execution time tracked" "$OPT_BODY" ".executionTimeMs"

ASSIGNMENTS=$(echo "$OPT_BODY" | jq '.assignments | length')
UNASSIGNED=$(echo "$OPT_BODY" | jq '.unassigned | length')
EXEC_TIME=$(echo "$OPT_BODY" | jq -r '.executionTimeMs')
TOTAL_DIST=$(echo "$OPT_BODY" | jq -r '.totalDistanceKm')

echo -e "  ${CYAN}ℹ️  Assignments: $ASSIGNMENTS | Unassigned: $UNASSIGNED${NC}"
echo -e "  ${CYAN}ℹ️  Total distance: ${TOTAL_DIST} km | Execution: ${EXEC_TIME}ms${NC}"

print_step "6.2 Viewer cannot execute optimization (should return 403)"
OPT_FORBIDDEN=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3005/api/orders/optimize-assignment \
  -H "Authorization: Bearer $VIEWER_TOKEN")

assert_status "Viewer optimization denied" "403" "$OPT_FORBIDDEN"

wait_step 2

# ══════════════════════════════════════════
# STEP 7: Reports & Analytics
# ══════════════════════════════════════════

print_header "Step 7: Reports — Analytics + AI Insights"

print_step "7.1 Revenue report"
REV_RESPONSE=$(curl -s -w "\n%{http_code}" \
  "http://localhost:3006/api/reports/revenue?startDate=2025-01-01&endDate=2027-12-31" \
  -H "Authorization: Bearer $TOKEN")

REV_STATUS=$(echo "$REV_RESPONSE" | tail -1)
REV_BODY=$(echo "$REV_RESPONSE" | sed '$d')

assert_status "Revenue report" "200" "$REV_STATUS"
assert_json_exists "Total revenue returned" "$REV_BODY" ".totalRevenue"
assert_json_exists "Total orders returned" "$REV_BODY" ".totalOrders"

TOTAL_REVENUE=$(echo "$REV_BODY" | jq -r '.totalRevenue')
TOTAL_ORDERS=$(echo "$REV_BODY" | jq -r '.totalOrders')
echo -e "  ${CYAN}ℹ️  Revenue: R$ $TOTAL_REVENUE | Orders: $TOTAL_ORDERS${NC}"

print_step "7.2 Orders by status"
STATUS_RESPONSE=$(curl -s -w "\n%{http_code}" \
  "http://localhost:3006/api/reports/orders-by-status" \
  -H "Authorization: Bearer $TOKEN")

STATUS_STATUS=$(echo "$STATUS_RESPONSE" | tail -1)
STATUS_BODY=$(echo "$STATUS_RESPONSE" | sed '$d')

assert_status "Orders by status" "200" "$STATUS_STATUS"
assert_json_exists "Status data returned" "$STATUS_BODY" ".data"
assert_json_exists "Total count returned" "$STATUS_BODY" ".total"

print_step "7.3 Top products"
TOP_RESPONSE=$(curl -s -w "\n%{http_code}" \
  "http://localhost:3006/api/reports/top-products?limit=5" \
  -H "Authorization: Bearer $TOKEN")

TOP_STATUS=$(echo "$TOP_RESPONSE" | tail -1)
TOP_BODY=$(echo "$TOP_RESPONSE" | sed '$d')

assert_status "Top products" "200" "$TOP_STATUS"
assert_json_exists "Product data returned" "$TOP_BODY" ".data"

TOP_NAME=$(echo "$TOP_BODY" | jq -r '.data[0].productName // "N/A"')
echo -e "  ${CYAN}ℹ️  Top product: $TOP_NAME${NC}"

print_step "7.4 Average delivery time"
DELTIME_RESPONSE=$(curl -s -w "\n%{http_code}" \
  "http://localhost:3006/api/reports/average-delivery-time" \
  -H "Authorization: Bearer $TOKEN")

DELTIME_STATUS=$(echo "$DELTIME_RESPONSE" | tail -1)
DELTIME_BODY=$(echo "$DELTIME_RESPONSE" | sed '$d')

assert_status "Average delivery time" "200" "$DELTIME_STATUS"
assert_json_exists "Average minutes returned" "$DELTIME_BODY" ".averageMinutes"
assert_json_exists "By vehicle type returned" "$DELTIME_BODY" ".byVehicleType"

print_step "7.5 AI Insights (AWS Bedrock — Claude)"
echo -e "  ${CYAN}ℹ️  Requesting AI analysis... (may take a few seconds)${NC}"

AI_RESPONSE=$(curl -s -w "\n%{http_code}" \
  "http://localhost:3006/api/reports/ai-insights?startDate=2025-01-01&endDate=2027-12-31" \
  -H "Authorization: Bearer $TOKEN")

AI_STATUS=$(echo "$AI_RESPONSE" | tail -1)
AI_BODY=$(echo "$AI_RESPONSE" | sed '$d')

assert_status "AI Insights" "200" "$AI_STATUS"
assert_json_exists "AI summary returned" "$AI_BODY" ".summary"
assert_json_exists "AI recommendations returned" "$AI_BODY" ".recommendations"
assert_json_exists "AI model identified" "$AI_BODY" ".model"

AI_MODEL=$(echo "$AI_BODY" | jq -r '.model')
AI_SUMMARY=$(echo "$AI_BODY" | jq -r '.summary')
echo -e "  ${CYAN}ℹ️  Model: $AI_MODEL${NC}"
echo -e "  ${CYAN}ℹ️  Summary: ${AI_SUMMARY:0:120}...${NC}"

print_step "7.6 Revenue without required dates (should return 400)"
REV_INVALID=$(curl -s -o /dev/null -w "%{http_code}" \
  "http://localhost:3006/api/reports/revenue" \
  -H "Authorization: Bearer $TOKEN")

assert_status "Missing dates rejected" "400" "$REV_INVALID"

# ══════════════════════════════════════════
# RESULTS
# ══════════════════════════════════════════

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}  TEST RESULTS${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  Total:  ${BOLD}$TOTAL${NC} tests"
echo -e "  Passed: ${GREEN}${BOLD}$PASSED${NC}"
echo -e "  Failed: ${RED}${BOLD}$FAILED${NC}"
echo ""

if [ "$FAILED" -eq 0 ]; then
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}  🎉 ALL TESTS PASSED! FastMeals is fully operational.${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
else
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}  ⚠️  $FAILED test(s) failed. Check the output above.${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
fi

echo ""
echo "  Architecture:"
echo "    • 6 microservices with Clean Architecture + SOLID"
echo "    • Database per service (5× PostgreSQL)"
echo "    • RabbitMQ messaging (order events)"
echo "    • Redis (JWT token store)"
echo "    • Nginx API Gateway"
echo "    • Hungarian Algorithm O(n³) + Haversine"
echo "    • AWS Bedrock AI Insights (Claude)"
echo ""
echo "  Dashboards:"
echo "    • RabbitMQ: http://localhost:15672 (guest/guest)"
echo ""

exit $FAILED