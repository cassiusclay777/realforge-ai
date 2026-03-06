Write-Host "📦 Instaluji závislosti pro One-Click AI..." -ForegroundColor Cyan

# Node modules
npm install adm-zip uuid
npm install --save-dev @types/adm-zip @types/uuid

# Python závislosti (kdybyste chtěli použít i Python variantu)
cd ml-service
pip install pillow opencv-python numpy scikit-image

Write-Host ""
Write-Host "✅ Hotovo!" -ForegroundColor Green
Write-Host ""
Write-Host "📁 Vytvořené soubory:"
Write-Host "  - lib/deepseek-vision.ts (AI analýza fotek)"
Write-Host "  - workers/one-click-processor.ts (Hlavní pipeline)"
Write-Host "  - app/api/one-click/route.ts (API endpoint)"
Write-Host "  - app/(dashboard)/upload/page-updated.tsx (Nové UI)"
Write-Host ""
Write-Host "🔧 Co dělat teď:"
Write-Host "  1. Přidej DEEPSEEK_API_KEY do .env"
Write-Host "  2. Nahraď upload/page.tsx novou verzí"
Write-Host "  3. Otestuj to!"
