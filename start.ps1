# REALFORGE AI - Ultra Simple Startup
# Just run: .\start.ps1

Write-Host "🚀 Starting REALFORGE AI..." -ForegroundColor Cyan

# Function to check if a command exists
function Test-Command($cmd) {
    try { Get-Command $cmd -ErrorAction Stop | Out-Null; return $true }
    catch { return $false }
}

# Check prerequisites
if (-not (Test-Command "node")) {
    Write-Host "❌ Node.js not found. Install from: https://nodejs.org/" -ForegroundColor Red
    exit 1
}

if (-not (Test-Command "python")) {
    Write-Host "❌ Python not found. Install from: https://python.org/" -ForegroundColor Red
    exit 1
}

# Create .env.local if missing
if (-not (Test-Path ".env.local")) {
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env.local"
        Write-Host "📝 Created .env.local from example. Please edit it!" -ForegroundColor Yellow
    }
}

# Install dependencies if needed
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing Node.js dependencies..." -ForegroundColor Yellow
    npm install
}

# Check ML service dependencies
if (Test-Path "ml-service\requirements.txt") {
    Write-Host "🤖 Installing Python dependencies..." -ForegroundColor Yellow
    Set-Location "ml-service"
    python -m pip install -r requirements.txt
    Set-Location ".."
}

# Start services concurrently using PowerShell jobs
Write-Host "🔄 Starting all services..." -ForegroundColor Green

# Start ML Service
$mlJob = Start-Job -Name "MLService" -ScriptBlock {
    Set-Location $using:PWD\ml-service
    python app.py
}

# Start Next.js
$nextJob = Start-Job -Name "NextJS" -ScriptBlock {
    Set-Location $using:PWD
    npm run dev
}

# Start Worker
$workerJob = Start-Job -Name "Worker" -ScriptBlock {
    Set-Location $using:PWD
    npm run worker
}

# Monitor and display output
Write-Host ""
Write-Host "✅ Services started!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Next.js App:    http://localhost:3000" -ForegroundColor Cyan
Write-Host "🤖 ML Service:     http://localhost:8000" -ForegroundColor Cyan
Write-Host "⚙️  Worker:         Running in background" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Press Ctrl+C to stop all services" -ForegroundColor Yellow
Write-Host ""

# Function to display logs
function Show-Logs {
    Clear-Host
    Write-Host "REALFORGE AI - Live Logs" -ForegroundColor Cyan
    Write-Host "========================" -ForegroundColor Cyan
    Write-Host ""
    
    # Get recent logs from each job
    $jobs = Get-Job
    
    foreach ($job in $jobs) {
        Write-Host "=== $($job.Name) ===" -ForegroundColor Yellow
        $logs = Receive-Job $job -Keep
        if ($logs) {
            $logs | Select-Object -Last 5 | ForEach-Object {
                Write-Host "  $_"
            }
        } else {
            Write-Host "  (No recent output)"
        }
        Write-Host ""
    }
    
    Write-Host "========================" -ForegroundColor Cyan
    Write-Host "Press Ctrl+C to stop | R to refresh | Q to quit" -ForegroundColor Gray
}

# Main loop
try {
    while ($true) {
        Show-Logs
        Start-Sleep -Seconds 2
    }
} finally {
    Write-Host ""
    Write-Host "🛑 Stopping services..." -ForegroundColor Red
    
    # Stop all jobs
    Get-Job | Stop-Job
    Get-Job | Remove-Job
    
    Write-Host "✅ All services stopped" -ForegroundColor Green
}