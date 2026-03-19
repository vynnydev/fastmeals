@echo off
REM ============================================
REM FastMeals — Start All Services (Windows)
REM ============================================
REM Usage: scripts\start.bat
REM ============================================

echo.
echo 🍔 FastMeals — Starting Platform
echo =================================
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
REM Step 2: Start infrastructure
REM ──────────────────────────────────

echo.
echo 📦 Starting databases, Redis, and RabbitMQ...
docker-compose up -d auth-db products-db orders-db delivery-db reports-db redis rabbitmq

echo.
echo ⏳ Waiting for databases to be healthy (15 seconds)...
timeout /t 15 /nobreak >nul

REM ──────────────────────────────────
REM Step 3: Run migrations and seeds
REM ──────────────────────────────────

echo.
echo 🔧 Running migrations and seeds...

set SERVICES=auth-service products-service orders-service delivery-service reports-service

for %%S in (%SERVICES%) do (
    echo.
    echo   📋 Setting up %%S...
    
    cd backend\services\%%S
    
    if not exist node_modules (
        echo     Installing dependencies...
        call npm install --silent
    )
    
    call npx prisma generate 2>nul
    call npx prisma migrate deploy 2>nul
    call npm run seed 2>nul
    
    echo   ✅ %%S ready
    
    cd ..\..\..
)

echo.
echo   📋 Setting up optimization-service...
cd backend\services\optimization-service
if not exist node_modules (
    call npm install --silent
)
echo   ✅ optimization-service ready
cd ..\..\..

REM ──────────────────────────────────
REM Step 4: Start all services
REM ──────────────────────────────────

echo.
echo 🚀 Starting all microservices...

start "auth-service" cmd /c "cd backend\services\auth-service && npm run dev"
start "products-service" cmd /c "cd backend\services\products-service && npm run dev"
start "orders-service" cmd /c "cd backend\services\orders-service && npm run dev"
start "delivery-service" cmd /c "cd backend\services\delivery-service && npm run dev"
start "optimization-service" cmd /c "cd backend\services\optimization-service && npm run dev"
start "reports-service" cmd /c "cd backend\services\reports-service && npm run dev"

echo.
echo ⏳ Waiting for services to start (10 seconds)...
timeout /t 10 /nobreak >nul

REM ──────────────────────────────────
REM Done
REM ──────────────────────────────────

echo.
echo =================================
echo 🍔 FastMeals Platform is running!
echo =================================
echo.
echo   Services:
echo     Auth:         http://localhost:3001
echo     Products:     http://localhost:3002
echo     Orders:       http://localhost:3003
echo     Delivery:     http://localhost:3004
echo     Optimization: http://localhost:3005
echo     Reports:      http://localhost:3006
echo.
echo   Infrastructure:
echo     RabbitMQ UI:  http://localhost:15672 (guest/guest)
echo.
echo   Close all service windows to stop.
echo.
pause