@echo off
echo REALFORGE AI - One Command Startup (Fixed)
echo ===========================================
echo.

REM Check for Node.js
where node >nul 2>nul
if errorlevel 1 (
    echo ERROR: Node.js not found!
    echo Install from: https://nodejs.org/
    pause
    exit /b 1
)

REM Check for Python
where python >nul 2>nul
if errorlevel 1 (
    echo ERROR: Python not found!
    echo Install from: https://python.org/
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed
echo.

REM Kill any existing services first
echo 🛑 Stopping any existing services...
taskkill /FI "WINDOWTITLE eq REALFORGE AI - ML Service*" /F >nul 2>nul
taskkill /FI "WINDOWTITLE eq REALFORGE AI - Next.js*" /F >nul 2>nul
taskkill /FI "WINDOWTITLE eq REALFORGE AI - Worker*" /F >nul 2>nul
timeout /t 2 /nobreak >nul

REM Setup environment
if not exist ".env.local" if exist ".env.example" copy ".env.example" ".env.local"

REM Install dependencies if needed
if not exist "node_modules" (
    echo 📦 Installing Node.js dependencies...
    call npm install
)

REM Install Python dependencies
if exist "ml-service\requirements.txt" (
    echo 🤖 Installing Python dependencies...
    cd ml-service
    call python -m pip install -r requirements.txt
    cd ..
)

echo.
echo 🚀 Starting REALFORGE AI...
echo.

REM Start ML Service
echo 🤖 Starting ML Service...
start "REALFORGE AI - ML Service" cmd /k "cd /d %~dp0ml-service && python app.py"
timeout /t 3 /nobreak >nul

REM Wait for ML Service to be ready
echo ⏳ Waiting for ML Service to start...
timeout /t 5 /nobreak >nul

REM Start Next.js
echo 🌐 Starting Next.js...
start "REALFORGE AI - Next.js" cmd /k "cd /d %~dp0 && npm run dev"
timeout /t 3 /nobreak >nul

REM Start Worker
echo ⚙️ Starting Worker...
start "REALFORGE AI - Worker" cmd /k "cd /d %~dp0 && npm run worker"

echo.
echo ✅ All services started!
echo.
echo 🌐 Open your browser to: http://localhost:3000
echo 🤖 ML Service: http://localhost:8000
echo.
echo Windows opened for each service.
echo Close them individually or press any key here to kill all.
echo.

pause >nul

echo.
echo 🛑 Stopping all services...
taskkill /FI "WINDOWTITLE eq REALFORGE AI - ML Service*" /F >nul 2>nul
taskkill /FI "WINDOWTITLE eq REALFORGE AI - Next.js*" /F >nul 2>nul
taskkill /FI "WINDOWTITLE eq REALFORGE AI - Worker*" /F >nul 2>nul

echo ✅ Done!
pause