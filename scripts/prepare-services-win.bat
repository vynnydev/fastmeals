@echo off
REM ============================================
REM FastMeals — Prepare Services (Windows)
REM ============================================
REM Runs migrations and seeds after Docker Compose.
REM Run AFTER: docker-compose up --build
REM
REM Usage: scripts\prepare-services-win.bat
REM ============================================

echo.
echo 🍔 FastMeals — Preparing Services
echo ==================================
echo.

REM ──────────────────────────────────
REM Step 1: Check Docker
REM ──────────────────────────────────

docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker Desktop.
    pause
    exit /b 1
)

echo ✅ Docker is running

REM ──────────────────────────────────
REM Step 2: Wait for databases
REM ──────────────────────────────────

echo.
echo ⏳ Waiting for databases to be ready (15 seconds)...
timeout /t 15 /nobreak >nul

echo   Checking databases...
docker exec fastmeals-auth-db pg_isready -U auth_user -d auth_db >nul 2>&1 && echo   ✅ auth-db ready || echo   ⚠️  auth-db not ready
docker exec fastmeals-products-db pg_isready -U products_user -d products_db >nul 2>&1 && echo   ✅ products-db ready || echo   ⚠️  products-db not ready
docker exec fastmeals-orders-db pg_isready -U orders_user -d orders_db >nul 2>&1 && echo   ✅ orders-db ready || echo   ⚠️  orders-db not ready
docker exec fastmeals-delivery-db pg_isready -U delivery_user -d delivery_db >nul 2>&1 && echo   ✅ delivery-db ready || echo   ⚠️  delivery-db not ready
docker exec fastmeals-reports-db pg_isready -U reports_user -d reports_db >nul 2>&1 && echo   ✅ reports-db ready || echo   ⚠️  reports-db not ready

REM ──────────────────────────────────
REM Step 3: Run migrations inside containers
REM ──────────────────────────────────

echo.
echo 🔧 Running migrations...

echo.
echo   📋 Setting up auth-service...
docker exec fastmeals-auth-service sh -c "npx prisma db push --accept-data-loss 2>&1" >nul 2>&1
echo     ✅ auth-service migration applied

echo.
echo   📋 Setting up products-service...
docker exec fastmeals-products-service sh -c "npx prisma db push --accept-data-loss 2>&1" >nul 2>&1
echo     ✅ products-service migration applied

echo.
echo   📋 Setting up orders-service...
docker exec fastmeals-orders-service sh -c "npx prisma db push --accept-data-loss 2>&1" >nul 2>&1
echo     ✅ orders-service migration applied

echo.
echo   📋 Setting up delivery-service...
docker exec fastmeals-delivery-service sh -c "npx prisma db push --accept-data-loss 2>&1" >nul 2>&1
echo     ✅ delivery-service migration applied

echo.
echo   📋 Setting up reports-service...
docker exec fastmeals-reports-service sh -c "npx prisma db push --accept-data-loss 2>&1" >nul 2>&1
echo     ✅ reports-service migration applied

REM ──────────────────────────────────
REM Step 4: Seed databases locally
REM ──────────────────────────────────

echo.
echo 🌱 Seeding databases...

echo.
echo   🌱 Seeding auth-service...
cd backend\services\auth-service
if not exist node_modules call npm install --silent >nul 2>&1
call npx prisma generate >nul 2>&1
call npm run seed >nul 2>&1 && echo     ✅ auth-service seeded || echo     ⚠️  auth-service seed skipped
cd ..\..\..

echo.
echo   🌱 Seeding products-service...
cd backend\services\products-service
if not exist node_modules call npm install --silent >nul 2>&1
call npx prisma generate >nul 2>&1
call npm run seed >nul 2>&1 && echo     ✅ products-service seeded || echo     ⚠️  products-service seed skipped
cd ..\..\..

echo.
echo   🌱 Seeding orders-service...
cd backend\services\orders-service
if not exist node_modules call npm install --silent >nul 2>&1
call npx prisma generate >nul 2>&1
call npm run seed >nul 2>&1 && echo     ✅ orders-service seeded || echo     ⚠️  orders-service seed skipped
cd ..\..\..

echo.
echo   🌱 Seeding delivery-service...
cd backend\services\delivery-service
if not exist node_modules call npm install --silent >nul 2>&1
call npx prisma generate >nul 2>&1
call npm run seed >nul 2>&1 && echo     ✅ delivery-service seeded || echo     ⚠️  delivery-service seed skipped
cd ..\..\..

echo.
echo   🌱 Seeding reports-service...
cd backend\services\reports-service
if not exist node_modules call npm install --silent >nul 2>&1
call npx prisma generate >nul 2>&1
call npm run seed >nul 2>&1 && echo     ✅ reports-service seeded || echo     ⚠️  reports-service seed skipped
cd ..\..\..

REM ──────────────────────────────────
REM Step 5: Health checks
REM ──────────────────────────────────

echo.
echo 🏥 Running health checks...

curl -s http://localhost:3001/health >nul 2>&1 && echo   ✅ Auth Service (3001) || echo   ❌ Auth Service (3001)
curl -s http://localhost:3002/health >nul 2>&1 && echo   ✅ Products Service (3002) || echo   ❌ Products Service (3002)
curl -s http://localhost:3003/health >nul 2>&1 && echo   ✅ Orders Service (3003) || echo   ❌ Orders Service (3003)
curl -s http://localhost:3004/health >nul 2>&1 && echo   ✅ Delivery Service (3004) || echo   ❌ Delivery Service (3004)
curl -s http://localhost:3005/health >nul 2>&1 && echo   ✅ Optimization Service (3005) || echo   ❌ Optimization Service (3005)
curl -s http://localhost:3006/health >nul 2>&1 && echo   ✅ Reports Service (3006) || echo   ❌ Reports Service (3006)

REM ──────────────────────────────────
REM Done
REM ──────────────────────────────────

echo.
echo ==================================
echo 🍔 FastMeals Platform is ready!
echo ==================================
echo.
echo   Next steps:
echo     1. Run the test flow: scripts\test-flow.sh (requires Git Bash or WSL)
echo     2. Access RabbitMQ UI: http://localhost:15672 (guest/guest)
echo.
pause