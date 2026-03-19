#!/bin/bash

# ============================================
# FastMeals — Start All Services (Mac/Linux)
# ============================================
# Usage: chmod +x scripts/start.sh && ./scripts/start.sh
# ============================================

set -e

echo "🍔 FastMeals — Starting Platform"
echo "================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# ──────────────────────────────────
# Step 1: Check Docker
# ──────────────────────────────────

if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker not found. Please install Docker.${NC}"
    exit 1
fi

if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Docker is not running. Please start Docker Desktop.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker is running${NC}"

# ──────────────────────────────────
# Step 2: Start infrastructure
# ──────────────────────────────────

echo ""
echo -e "${YELLOW}📦 Starting databases, Redis, and RabbitMQ...${NC}"
docker-compose up -d auth-db products-db orders-db delivery-db reports-db redis rabbitmq

echo ""
echo -e "${YELLOW}⏳ Waiting for databases to be healthy...${NC}"
sleep 10

# ──────────────────────────────────
# Step 3: Run migrations and seeds
# ──────────────────────────────────

echo ""
echo -e "${YELLOW}🔧 Running migrations and seeds...${NC}"

SERVICES=("auth-service" "products-service" "orders-service" "delivery-service" "reports-service")

for SERVICE in "${SERVICES[@]}"; do
    echo ""
    echo -e "${YELLOW}  📋 Setting up ${SERVICE}...${NC}"
    
    cd backend/services/$SERVICE
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo "    Installing dependencies..."
        npm install --silent
    fi
    
    # Generate Prisma client
    npx prisma generate 2>/dev/null || true
    
    # Run migrations
    npx prisma migrate deploy 2>/dev/null || npx prisma migrate dev --name init 2>/dev/null || true
    
    # Run seed
    npm run seed 2>/dev/null || true
    
    echo -e "${GREEN}    ✅ ${SERVICE} ready${NC}"
    
    cd ../../..
done

# optimization-service has no database
echo ""
echo -e "${YELLOW}  📋 Setting up optimization-service...${NC}"
cd backend/services/optimization-service
if [ ! -d "node_modules" ]; then
    npm install --silent
fi
echo -e "${GREEN}    ✅ optimization-service ready${NC}"
cd ../../..

# ──────────────────────────────────
# Step 4: Start all services
# ──────────────────────────────────

echo ""
echo -e "${YELLOW}🚀 Starting all microservices...${NC}"

# Start each service in background
cd backend/services/auth-service && npm run dev &
AUTH_PID=$!
cd ../../..

cd backend/services/products-service && npm run dev &
PRODUCTS_PID=$!
cd ../../..

cd backend/services/orders-service && npm run dev &
ORDERS_PID=$!
cd ../../..

cd backend/services/delivery-service && npm run dev &
DELIVERY_PID=$!
cd ../../..

cd backend/services/optimization-service && npm run dev &
OPTIMIZATION_PID=$!
cd ../../..

cd backend/services/reports-service && npm run dev &
REPORTS_PID=$!
cd ../../..

# Wait for services to start
sleep 5

# ──────────────────────────────────
# Step 5: Health checks
# ──────────────────────────────────

echo ""
echo -e "${YELLOW}🏥 Running health checks...${NC}"

check_health() {
    local name=$1
    local url=$2
    if curl -s "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}  ✅ ${name} — healthy${NC}"
    else
        echo -e "${RED}  ❌ ${name} — not responding${NC}"
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
echo "================================="
echo -e "${GREEN}🍔 FastMeals Platform is running!${NC}"
echo "================================="
echo ""
echo "  Services:"
echo "    Auth:         http://localhost:3001"
echo "    Products:     http://localhost:3002"
echo "    Orders:       http://localhost:3003"
echo "    Delivery:     http://localhost:3004"
echo "    Optimization: http://localhost:3005"
echo "    Reports:      http://localhost:3006"
echo ""
echo "  Infrastructure:"
echo "    RabbitMQ UI:  http://localhost:15672 (guest/guest)"
echo ""
echo "  Press Ctrl+C to stop all services"
echo ""

# Wait for all background processes
wait