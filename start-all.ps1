# REALFORGE AI - One-Click Startup Script (PowerShell)
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "REALFORGE AI - One-Click Startup Script" -ForegroundColor Cyan
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

# Check if Docker is available (optional)
try {
    docker --version | Out-Null
    Write-Host "✅ Docker is available" -ForegroundColor Green
    $dockerAvailable = $true
} catch {
    Write-Host "⚠ Docker not available, using local services" -ForegroundColor Yellow
    $dockerAvailable = $false
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

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host "❌ .env.local file not found" -ForegroundColor Red
    if (Test-Path ".env.example") {
        Write-Host "Creating from .env.example..." -ForegroundColor Yellow
        Copy-Item ".env.example" ".env.local"
        Write-Host "Please edit .env.local with your configuration" -ForegroundColor Yellow
        Read-Host "Press Enter to continue"
    } else {
        Write-Host "❌ .env.example not found either" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

Write-Host ""
Write-Host "🗄️ Starting database services..." -ForegroundColor Cyan
Write-Host ""

# Start PostgreSQL and Redis using Docker if available
if ($dockerAvailable) {
    Write-Host "Starting PostgreSQL and Redis with Docker..." -ForegroundColor Yellow
    docker-compose up -d postgres redis
    
    # Wait for services to start
    Write-Host "Waiting for services to be ready (10 seconds)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
} else {
    Write-Host "⚠ Please make sure PostgreSQL and Redis are running manually" -ForegroundColor Yellow
    Write-Host "PostgreSQL should be on localhost:5432" -ForegroundColor Yellow
    Write-Host "Redis should be on localhost:6379" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to continue or Ctrl+C to cancel"
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
Write-Host "🤖 Starting ML Service..." -ForegroundColor Cyan
Write-Host ""

# Start ML service in a new window
$mlServiceScript = @"
cd '$PWD\ml-service'
Write-Host 'Starting ML Service...' -ForegroundColor Yellow
python -m pip install -r requirements.txt
python app.py
"@

Start-Process powershell -ArgumentList "-NoExit", "-Command", $mlServiceScript -WindowStyle Normal -WorkingDirectory $PWD

# Wait for ML service to start
Write-Host "Waiting for ML service to start (5 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "🚀 Starting Next.js Application..." -ForegroundColor Cyan
Write-Host ""

# Start Next.js dev server in a new window
$nextjsScript = @"
cd '$PWD'
Write-Host 'Starting Next.js development server...' -ForegroundColor Yellow
npm run dev
"@

Start-Process powershell -ArgumentList "-NoExit", "-Command", $nextjsScript -WindowStyle Normal -WorkingDirectory $PWD

Write-Host ""
Write-Host "📊 Starting Background Worker (DeepSeek AI)..." -ForegroundColor Cyan
Write-Host ""

# Start DeepSeek worker in a new window
$workerScript = @"
cd '$PWD'
Write-Host 'Starting DeepSeek AI worker...' -ForegroundColor Yellow
npm run worker:deepseek
"@

Start-Process powershell -ArgumentList "-NoExit", "-Command", $workerScript -WindowStyle Normal -WorkingDirectory $PWD

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ REALFORGE AI is starting up!" -ForegroundColor Green
Write-Host ""
Write-Host "Services starting in separate windows:" -ForegroundColor White
Write-Host "1. ML Service (Python FastAPI) - http://localhost:8000" -ForegroundColor Yellow
Write-Host "2. Next.js App - http://localhost:3000" -ForegroundColor Yellow
Write-Host "3. Background Worker (DeepSeek AI)" -ForegroundColor Yellow
Write-Host ""
Write-Host "📍 Open your browser to: http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C in this window to stop all services" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Keep this window open and monitor
Write-Host "Monitoring services... (Press Ctrl+C to stop)" -ForegroundColor Yellow
try {
    # Wait for user to press Ctrl+C
    while ($true) {
        Start-Sleep -Seconds 1
    }
} finally {
    Write-Host ""
    Write-Host "🛑 Stopping services..." -ForegroundColor Red
    Write-Host ""
    
    # Cleanup if Docker was used
    if ($dockerAvailable) {
        Write-Host "Stopping Docker services..." -ForegroundColor Yellow
        docker-compose down
    }
    
    Write-Host "All services stopped." -ForegroundColor Green
    Read-Host "Press Enter to exit"
}