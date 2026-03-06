# REALFORGE AI - Simple Startup Script (PowerShell)
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "REALFORGE AI - Simple Startup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js $nodeVersion is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js 18+ from https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if Python is installed
try {
    $pythonVersion = python --version
    Write-Host "✅ Python is installed: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Python 3.11+ from https://python.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "📦 Checking dependencies..." -ForegroundColor Cyan
Write-Host ""

# Install Node.js dependencies if needed
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing Node.js dependencies..." -ForegroundColor Yellow
    npm install
} else {
    Write-Host "Node.js dependencies already installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "🔧 Setting up database..." -ForegroundColor Cyan
Write-Host ""

# Run Prisma migrations
Write-Host "Running database migrations..." -ForegroundColor Yellow
$migrationResult = npx prisma db push 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Database migration failed" -ForegroundColor Red
    Write-Host "Please check your DATABASE_URL in .env.local" -ForegroundColor Yellow
    Write-Host "Error: $migrationResult" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✅ Database setup complete" -ForegroundColor Green

Write-Host ""
Write-Host "🤖 Starting ML Service in background..." -ForegroundColor Cyan
Write-Host ""

# Start ML service in background
Start-Job -Name "MLService" -ScriptBlock {
    cd "$PSScriptRoot\ml-service"
    Write-Host "Starting ML Service..." -ForegroundColor Yellow
    python -m pip install -r requirements.txt
    python app.py
}

Write-Host "Waiting for ML service to start (5 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "📊 Starting DeepSeek AI Worker in background..." -ForegroundColor Cyan
Write-Host ""

# Start DeepSeek worker in background
Start-Job -Name "DeepSeekWorker" -ScriptBlock {
    cd "$PSScriptRoot"
    Write-Host "Starting DeepSeek AI worker..." -ForegroundColor Yellow
    npm run worker:deepseek
}

Write-Host ""
Write-Host "🚀 Starting Next.js Application..." -ForegroundColor Cyan
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ REALFORGE AI is starting up!" -ForegroundColor Green
Write-Host ""
Write-Host "Services starting:" -ForegroundColor White
Write-Host "1. ML Service (Python FastAPI) - http://localhost:8000" -ForegroundColor Yellow
Write-Host "2. Next.js App - http://localhost:3000" -ForegroundColor Yellow
Write-Host "3. DeepSeek AI Worker (Background)" -ForegroundColor Yellow
Write-Host ""
Write-Host "📍 Open your browser to: http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop all services" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Start Next.js dev server in foreground (this will block)
Write-Host "Starting Next.js development server..." -ForegroundColor Yellow
npm run dev