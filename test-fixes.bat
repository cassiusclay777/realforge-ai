@echo off
echo 🚀 REALFORGE AI - Test oprav po provedených změnách
echo ==================================================

REM 1. Zkontrolovat, zda Docker běží
echo 1. Kontrola Docker daemonu...
docker info > nul 2>&1
if %errorlevel% neq 0 (
    echo    ❌ Docker není spuštěn. Spusťte Docker Desktop.
    exit /b 1
) else (
    echo    ✅ Docker je spuštěn.
)

REM 2. Nainstalovat závislosti
echo 2. Instalace závislostí...
call npm install
if %errorlevel% neq 0 (
    echo    ❌ npm install selhal.
    exit /b 1
) else (
    echo    ✅ npm install úspěšný.
)

REM 3. Generovat Prisma client
echo 3. Generování Prisma clientu...
call npx prisma generate
if %errorlevel% neq 0 (
    echo    ❌ Prisma generate selhal.
    exit /b 1
) else (
    echo    ✅ Prisma generate úspěšný.
)

REM 4. Spustit databázi a Redis
echo 4. Spouštění databáze a Redis...
call docker-compose up -d postgres redis
timeout /t 10 /nobreak > nul

REM 5. Push databáze
echo 5. Push databázového schématu...
call npx prisma db push --url="postgresql://realforge:#g(XNb>a4a:5SL|$@localhost:5432/realforge_ai" --accept-data-loss
if %errorlevel% neq 0 (
    echo    ❌ Prisma db push selhal.
    exit /b 1
) else (
    echo    ✅ Prisma db push úspěšný.
)

REM 6. Spustit ML service
echo 6. Spouštění ML service...
call docker-compose up -d ml-service
timeout /t 5 /nobreak > nul

REM 7. Zobrazit informace
echo 7. Spouštění Next.js aplikace...
echo    📍 Aplikace bude dostupná na http://localhost:3000
echo    📍 ML service na http://localhost:8000
echo    📍 PostgreSQL na localhost:5432
echo    📍 Redis na localhost:6379
echo.
echo Pro spuštění aplikace použijte:
echo    npm run dev
echo.
echo Pro spuštění workeru použijte:
echo    npm run worker
echo.
echo Pro zastavení všech služeb:
echo    docker-compose down
echo.

REM 8. Test připojení
echo 8. Test připojení k databázi...
echo SELECT 1 | npx prisma db execute --stdin > nul 2>&1
if %errorlevel% neq 0 (
    echo    ❌ Nelze se připojit k databázi.
) else (
    echo    ✅ Připojení k databázi funguje.
)

echo.
echo ✅ Testovací skript dokončen!
echo 📋 Shrnutí oprav:
echo    - ERR_REQUIRE_CYCLE_MODULE: Opraveno lazy importem v workers/image-process.ts
echo    - Prisma 7+ datasource.url: Přesunuto do prisma/config.ts, odstraněno ze schema.prisma
echo    - torchvision==0.15.0: Aktualizováno na 0.15.2 v requirements.txt
echo    - @app.on_event: Nahrazeno lifespan v ml-service/app.py
echo    - Komentáře v package.json: Odstraněny, přidán postinstall script
echo    - MODULE_NOT_FOUND: Přidáno experimental.esmExternals: false do next.config.ts
echo    - Docker-compose: Odstraněna verze
echo    - .env.local: Vytvořen s DATABASE_URL

pause