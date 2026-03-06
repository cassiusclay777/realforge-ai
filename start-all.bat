@echo off
echo ========================================
echo REALFORGE AI - One-Click Startup Script
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if Python is installed
where python >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python 3.11+ from https://python.org/
    pause
    exit /b 1
)

REM Check if Docker is available (optional)
docker --version >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo ✅ Docker is available
    set DOCKER_AVAILABLE=1
) else (
    echo ⚠ Docker not available, using local services
    set DOCKER_AVAILABLE=0
)

echo.
echo 📦 Checking dependencies...
echo.

REM Install Node.js dependencies if needed
if not exist "node_modules" (
    echo Installing Node.js dependencies...
    call npm install
) else (
    echo Node.js dependencies already installed
)

REM Check if .env.local exists
if not exist ".env.local" (
    echo ❌ .env.local file not found
    echo Creating from .env.example...
    if exist ".env.example" (
        copy ".env.example" ".env.local"
        echo Please edit .env.local with your configuration
        pause
    ) else (
        echo ❌ .env.example not found either
        pause
        exit /b 1
    )
)

echo.
echo 🗄️ Starting database services...
echo.

REM Start PostgreSQL and Redis using Docker if available
if %DOCKER_AVAILABLE% equ 1 (
    echo Starting PostgreSQL and Redis with Docker...
    docker-compose up -d postgres redis
    
    REM Wait for services to start
    echo Waiting for services to be ready...
    timeout /t 10 /nobreak >nul
) else (
    echo ⚠ Please make sure PostgreSQL and Redis are running manually
    echo PostgreSQL should be on localhost:5432
    echo Redis should be on localhost:6379
    echo.
    set /p CONTINUE="Press Enter to continue or Ctrl+C to cancel..."
)

echo.
echo 🔧 Setting up database...
echo.

REM Run Prisma migrations
echo Running database migrations...
npx prisma db push

if %ERRORLEVEL% neq 0 (
    echo ❌ Database migration failed
    echo Please check your DATABASE_URL in .env.local
    pause
    exit /b 1
)

echo ✅ Database setup complete

echo.
echo 🤖 Starting ML Service...
echo.

REM Start ML service in a new window
start "REALFORGE AI - ML Service" cmd /k "cd /d %~dp0ml-service && echo Starting ML Service... && python -m pip install -r requirements.txt && python app.py"

REM Wait for ML service to start
echo Waiting for ML service to start (5 seconds)...
timeout /t 5 /nobreak >nul

echo.
echo 🚀 Starting Next.js Application...
echo.

REM Start Next.js dev server in a new window
start "REALFORGE AI - Next.js App" cmd /k "cd /d %~dp0 && echo Starting Next.js development server... && npm run dev"

echo.
echo 📊 Starting Background Worker (DeepSeek AI)...
echo.

REM Start DeepSeek worker in a new window
start "REALFORGE AI - DeepSeek Worker" cmd /k "cd /d %~dp0 && echo Starting DeepSeek AI worker... && npm run worker:deepseek"

echo.
echo ========================================
echo ✅ REALFORGE AI is starting up!
echo.
echo Services starting in separate windows:
echo 1. ML Service (Python FastAPI) - http://localhost:8000
echo 2. Next.js App - http://localhost:3000
echo 3. Background Worker (DeepSeek AI)
echo.
echo 📍 Open your browser to: http://localhost:3000
echo.
echo Press Ctrl+C in this window to stop all services
echo ========================================
echo.

REM Keep this window open
echo Monitoring services... (Press Ctrl+C to stop)
timeout /t 86400 /nobreak >nul

echo.
echo 🛑 Stopping services...
echo.

REM Cleanup if user presses Ctrl+C
if %DOCKER_AVAILABLE% equ 1 (
    echo Stopping Docker services...
    docker-compose down
)

echo All services stopped.
pause