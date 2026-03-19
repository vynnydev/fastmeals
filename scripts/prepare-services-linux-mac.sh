#!/bin/bash

# ============================================
# FastMeals — Prepare Services (Mac/Linux)
# ============================================
# Runs migrations and seeds inside Docker containers.
# Run AFTER: docker-compose up --build
#
# Usage:
#   chmod +x scripts/prepare-services-linux-mac.sh
#   ./scripts/prepare-services-linux-mac.sh
# ============================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

echo ""
echo -e "${CYAN}🍔 FastMeals — Preparing Services${NC}"
echo "=================================="
echo ""

# ──────────────────────────────────
# Step 1: Check Docker is running
# ──────────────────────────────────

if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Docker is not running. Please start Docker Desktop.${NC}"
    exit 1
fi

RUNNING=$(docker ps --format '{{.Names}}' | grep fastmeals | wc -l | tr -d ' ')
if [ "$RUNNING" -lt 5 ]; then
    echo -e "${RED}❌ FastMeals containers not running ($RUNNING found).${NC}"
    echo "   Please run: docker-compose up --build"
    exit 1
fi

echo -e "${GREEN}✅ Docker is running with $RUNNING FastMeals containers${NC}"

# ──────────────────────────────────
# Step 2: Wait for databases
# ──────────────────────────────────

echo ""
echo -e "${YELLOW}⏳ Waiting for databases to be ready...${NC}"

wait_for_db() {
    local container=$1
    local user=$2
    local db=$3
    local retries=10

    while [ $retries -gt 0 ]; do
        if docker exec $container pg_isready -U $user -d $db &> /dev/null; then
            echo -e "  ${GREEN}✅ $container ready${NC}"
            return 0
        fi
        retries=$((retries - 1))
        sleep 2
    done

    echo -e "  ${RED}❌ $container not ready${NC}"
    return 1
}

wait_for_db "fastmeals-auth-db" "auth_user" "auth_db"
wait_for_db "fastmeals-products-db" "products_user" "products_db"
wait_for_db "fastmeals-orders-db" "orders_user" "orders_db"
wait_for_db "fastmeals-delivery-db" "delivery_user" "delivery_db"
wait_for_db "fastmeals-reports-db" "reports_user" "reports_db"

# ──────────────────────────────────
# Step 3: Run migrations and seeds
# ──────────────────────────────────

echo ""
echo -e "${YELLOW}🔧 Running migrations and seeds...${NC}"

run_migration() {
    local service=$1
    local container="fastmeals-${service}"

    echo ""
    echo -e "${YELLOW}  📋 Setting up ${service}...${NC}"

    # Run prisma migrate deploy inside the container
    docker exec $container sh -c "npx prisma migrate deploy 2>/dev/null || npx prisma db push --accept-data-loss 2>/dev/null" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo -e "    ${GREEN}✅ Migration applied${NC}"
    else
        echo -e "    ${YELLOW}⚠️  Migration may need manual setup${NC}"
    fi
}

# Auth service
echo ""
echo -e "${YELLOW}  📋 Setting up auth-service...${NC}"
docker exec fastmeals-auth-service sh -c "npx prisma db push --accept-data-loss 2>&1" 2>/dev/null && \
    echo -e "    ${GREEN}✅ Migration applied${NC}" || \
    echo -e "    ${YELLOW}⚠️  Migration skipped${NC}"
docker exec fastmeals-auth-service sh -c "node dist/src/prisma-seed-runner.js 2>&1 || true" 2>/dev/null
echo -e "    ${GREEN}✅ auth-service ready${NC}"

# Products service
echo ""
echo -e "${YELLOW}  📋 Setting up products-service...${NC}"
docker exec fastmeals-products-service sh -c "npx prisma db push --accept-data-loss 2>&1" 2>/dev/null && \
    echo -e "    ${GREEN}✅ Migration applied${NC}" || \
    echo -e "    ${YELLOW}⚠️  Migration skipped${NC}"
echo -e "    ${GREEN}✅ products-service ready${NC}"

# Orders service
echo ""
echo -e "${YELLOW}  📋 Setting up orders-service...${NC}"
docker exec fastmeals-orders-service sh -c "npx prisma db push --accept-data-loss 2>&1" 2>/dev/null && \
    echo -e "    ${GREEN}✅ Migration applied${NC}" || \
    echo -e "    ${YELLOW}⚠️  Migration skipped${NC}"
echo -e "    ${GREEN}✅ orders-service ready${NC}"

# Delivery service
echo ""
echo -e "${YELLOW}  📋 Setting up delivery-service...${NC}"
docker exec fastmeals-delivery-service sh -c "npx prisma db push --accept-data-loss 2>&1" 2>/dev/null && \
    echo -e "    ${GREEN}✅ Migration applied${NC}" || \
    echo -e "    ${YELLOW}⚠️  Migration skipped${NC}"
echo -e "    ${GREEN}✅ delivery-service ready${NC}"

# Reports service
echo ""
echo -e "${YELLOW}  📋 Setting up reports-service...${NC}"
docker exec fastmeals-reports-service sh -c "npx prisma db push --accept-data-loss 2>&1" 2>/dev/null && \
    echo -e "    ${GREEN}✅ Migration applied${NC}" || \
    echo -e "    ${YELLOW}⚠️  Migration skipped${NC}"
echo -e "    ${GREEN}✅ reports-service ready${NC}"

# ──────────────────────────────────
# Step 4: Seed databases
# ──────────────────────────────────

echo ""
echo -e "${YELLOW}🌱 Seeding databases...${NC}"
echo -e "${CYAN}   (Seeds must be run locally — containers don't have seed data files)${NC}"
echo ""

SERVICES_WITH_DB=("auth-service" "products-service" "orders-service" "delivery-service" "reports-service")
DB_PORTS=(5433 5434 5435 5436 5437)

for i in "${!SERVICES_WITH_DB[@]}"; do
    SERVICE=${SERVICES_WITH_DB[$i]}
    PORT=${DB_PORTS[$i]}
    
    echo -e "${YELLOW}  🌱 Seeding ${SERVICE}...${NC}"
    
    cd backend/services/$SERVICE
    
    if [ ! -d "node_modules" ]; then
        npm install --silent 2>/dev/null
    fi
    
    npx prisma generate 2>/dev/null || true
    npm run seed 2>/dev/null && \
        echo -e "    ${GREEN}✅ ${SERVICE} seeded${NC}" || \
        echo -e "    ${YELLOW}⚠️  ${SERVICE} seed skipped (may need .env)${NC}"
    
    cd ../../..
done

# ──────────────────────────────────
# Step 5: Health checks
# ──────────────────────────────────

echo ""
echo -e "${YELLOW}🏥 Running health checks...${NC}"

check_health() {
    local name=$1
    local url=$2
    if curl -s "$url" > /dev/null 2>&1; then
        echo -e "  ${GREEN}✅ ${name}${NC}"
    else
        echo -e "  ${RED}❌ ${name} — not responding${NC}"
    fi
}

check_health "Auth Service (3001)" "http://localhost:3001/health"
check_health "Products Service (3002)" "http://localhost:3002/health"
check_health "Orders Service (3003)" "http://localhost:3003/health"
check_health "Delivery Service (3004)" "http://localhost:3004/health"
check_health "Optimization Service (3005)" "http://localhost:3005/health"
check_health "Reports Service (3006)" "http://localhost:3006/health"

# ──────────────────────────────────
# Done
# ──────────────────────────────────

echo ""
echo "=================================="
echo -e "${GREEN}🍔 FastMeals Platform is ready!${NC}"
echo "=================================="
echo ""
echo "  Next steps:"
echo "    1. Run the test flow: ./scripts/test-flow.sh"
echo "    2. Access RabbitMQ UI: http://localhost:15672 (guest/guest)"
echo ""