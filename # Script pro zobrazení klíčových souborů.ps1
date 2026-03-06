# Script pro zobrazení klíčových souborů pro AI zpracování nemovitostí
$projekt = "C:\Users\Patri\REALFORGE-AI"

Write-Host "=== KLIČOVÉ SOUBORY PRO AI ZPRACOVÁNÍ NEMOVITOSTÍ ===" -ForegroundColor Magenta

# Funkce pro zobrazení obsahu souboru
function Show-File {
    param($cesta, $popis)
    
    if (Test-Path $cesta) {
        Write-Host "`n" ("="*60) -ForegroundColor Cyan
        Write-Host "📄 $popis" -ForegroundColor Yellow
        Write-Host "🔗 $cesta" -ForegroundColor Gray
        Write-Host ("="*60) -ForegroundColor Cyan
        Write-Host ""
        
        # Zobrazíme prvních 50 řádků nebo celý soubor podle velikosti
        $content = Get-Content $cesta -Raw
        if ($content.Length -gt 5000) {
            $content = $content.Substring(0, 5000) + "`n... (soubor je příliš dlouhý, zkráceno)"
        }
        Write-Host $content -ForegroundColor White
    } else {
        Write-Host "❌ Soubor neexistuje: $cesta" -ForegroundColor Red
    }
}

# 1. HLAVNÍ KONFIGURACE
Show-File "$projekt\.env.example" "Konfigurace prostředí (DeepSeek API klíč)"
Show-File "$projekt\package.json" "Závislosti projektu"

# 2. DEEPSEEK INTEGRACE
Show-File "$projekt\lib\deepseek.ts" "Hlavní DeepSeek API klient"
Show-File "$projekt\lib\deepseek-utils.ts" "Utility pro DeepSeek"

# 3. ZPRACOVÁNÍ FOTEK
Show-File "$projekt\workers\image-process-deepseek.ts" "Zpracování fotek s DeepSeek"
Show-File "$projekt\workers\image-process.ts" "Hlavní zpracování fotek"

# 4. ML SLUŽBA (Python)
Show-File "$projekt\ml-service\app_ollama.py" "Python ML služba - Ollama"
Show-File "$projekt\ml-service\app_real_ai.py" "Python ML služba - Real AI"
Show-File "$projekt\ml-service\requirements.txt" "Python závislosti"

# 5. API ROUTY
Show-File "$projekt\app\api\upload\route.ts" "Upload API endpoint"
Show-File "$projekt\app\api\process-zip\route.ts" "Zpracování ZIP endpoint"
Show-File "$projekt\app\api\listings\route.ts" "API pro nemovitosti"

# 6. DATABÁZOVÉ MODELY
Show-File "$projekt\prisma\schema.prisma" "Databázové schéma"

# 7. FRONTEND KOMPONENTY
Show-File "$projekt\components\upload-zone.tsx" "Upload komponenta"
Show-File "$projekt\components\GalleryGrid.tsx" "Galerie fotek"
Show-File "$projekt\app\(dashboard)\upload\page.tsx" "Upload stránka"

# 8. POSKI INTEGRACE (tvoje realitka)
Show-File "$projekt\lib\poski.ts" "Poski API integrace"
Show-File "$projekt\lib\poski-real\PoskiRealService.ts" "Poski Real service"

Write-Host "`n" ("="*60) -ForegroundColor Green
Write-Host "✅ HOTOVO! Zkopíruj tyhle výpisy a pošli mi je." -ForegroundColor Green
Write-Host "Nejdůležitější soubory jsou označeny žlutě ↑" -ForegroundColor Yellow