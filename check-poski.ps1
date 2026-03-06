# check-poski.ps1 - kontrola Poski integrace v REALFORGE AI
# Použití: powershell -ExecutionPolicy Bypass -File ./check-poski.ps1

Write-Host "🔍 REALFORGE AI: Kontrola Poski integrace..." -ForegroundColor Cyan
Write-Host ""

# 1. Zkontroluj .env.local
Write-Host "1. Kontrola .env.local..." -ForegroundColor Yellow
if (Test-Path ".env.local") {
    $envContent = Get-Content ".env.local" -Raw
    if ($envContent -match "POSKI_API_URL") {
        $url = ($envContent | Select-String "POSKI_API_URL=(.*)" | ForEach-Object { $_.Matches.Groups[1].Value }).Trim('"')
        Write-Host "   ✅ POSKI_API_URL: $url" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Chybí POSKI_API_URL v .env.local" -ForegroundColor Red
    }

    if ($envContent -match "POSKI_API_KEY") {
        Write-Host "   ✅ POSKI_API_KEY: [NASTAVENO]" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Chybí POSKI_API_KEY v .env.local" -ForegroundColor Red
    }
} else {
    Write-Host "   ❌ Soubor .env.local neexistuje" -ForegroundColor Red
}

# 2. Zkontroluj soubory (lib/poski.ts, services/export/handlers/poski.ts, app/api/export/poski/route.ts)
Write-Host ""
Write-Host "2. Kontrola implementace..." -ForegroundColor Yellow
$files = @(
    @{Path = "lib/poski.ts"; Name = "lib/poski.ts" },
    @{Path = "services/export/handlers/poski.ts"; Name = "services/export/handlers/poski.ts" },
    @{Path = "app/api/export/poski/route.ts"; Name = "app/api/export/poski/route.ts" }
)
foreach ($file in $files) {
    if (Test-Path $file.Path) {
        Write-Host "   ✅ $( $file.Name ) existuje" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Chybí $( $file.Name )" -ForegroundColor Red
    }
}

# 3. Zkontroluj funkčnost (zavolá endpoint a otestuje, že API route existuje)
Write-Host ""
Write-Host "3. Kontrola API endpointu..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/export/poski" -Method POST -ContentType "application/json" -Body '{"listingId":"test"}' -TimeoutSec 5 -ErrorAction SilentlyContinue
    Write-Host "   ✅ /api/export/poski odpovídá (status: $( $response.StatusCode ))" -ForegroundColor Green
} catch {
    if ($_.Exception.StatusCode -eq 404) {
        Write-Host "   ❌ /api/export/poski neexistuje (404 Not Found)" -ForegroundColor Red
    } elseif ($_.Exception.StatusCode -eq 500) {
        Write-Host "   ⚠️ /api/export/poski existuje, ale selhal (500)" -ForegroundColor Yellow
    } else {
        Write-Host "   ⚠️ /api/export/poski nedostupný (možná Next.js neběží?)" -ForegroundColor Yellow
    }
}

# 4. Zkontroluj, že Next.js běží
Write-Host ""
Write-Host "4. Kontrola Next.js serveru..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001" -TimeoutSec 5 -ErrorAction SilentlyContinue
    Write-Host "   ✅ Next.js běží (status: $( $response.StatusCode ))" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Next.js neběží na localhost:3001" -ForegroundColor Red
}

# 5. Závěr
Write-Host ""
Write-Host "📊 Shrnutí:" -ForegroundColor Cyan
Write-Host "- .env.local: kontrola klíčů" -ForegroundColor Gray
Write-Host "- Soubory: kontrola existence" -ForegroundColor Gray
Write-Host "- API endpoint: kontrola odpovědi" -ForegroundColor Gray
Write-Host "- Next.js: kontrola běhu" -ForegroundColor Gray
Write-Host ""
Write-Host "✅ Když vidíš všechny zelené checkmarky → máma bude štastná!" -ForegroundColor Green
Write-Host ""