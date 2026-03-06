#!/bin/bash

echo "🚀 REALFORGE AI - Test oprav po provedených změnách"
echo "=================================================="

# 1. Zkontrolovat, zda Docker běží
echo "1. Kontrola Docker daemonu..."
if ! docker info > /dev/null 2>&1; then
    echo "   ❌ Docker není spuštěn. Spusťte Docker Desktop."
    exit 1
else
    echo "   ✅ Docker je spuštěn."
fi

# 2. Nainstalovat závislosti
echo "2. Instalace závislostí..."
npm install
if [ $? -eq 0 ]; then
    echo "   ✅ npm install úspěšný."
else
    echo "   ❌ npm install selhal."
    exit 1
fi

# 3. Generovat Prisma client
echo "3. Generování Prisma clientu..."
npx prisma generate
if [ $? -eq 0 ]; then
    echo "   ✅ Prisma generate úspěšný."
else
    echo "   ❌ Prisma generate selhal."
    exit 1
fi

# 4. Spustit databázi a Redis
echo "4. Spouštění databáze a Redis..."
docker-compose up -d postgres redis
sleep 10

# 5. Push databáze
echo "5. Push databázového schématu..."
npx prisma db push --accept-data-loss
if [ $? -eq 0 ]; then
    echo "   ✅ Prisma db push úspěšný."
else
    echo "   ❌ Prisma db push selhal."
    exit 1
fi

# 6. Spustit ML service
echo "6. Spouštění ML service..."
docker-compose up -d ml-service
sleep 5

# 7. Spustit Next.js aplikaci
echo "7. Spouštění Next.js aplikace..."
echo "   📍 Aplikace bude dostupná na http://localhost:3000"
echo "   📍 ML service na http://localhost:8000"
echo "   📍 PostgreSQL na localhost:5432"
echo "   📍 Redis na localhost:6379"
echo ""
echo "Pro spuštění aplikace použijte:"
echo "   npm run dev"
echo ""
echo "Pro spuštění workeru použijte:"
echo "   npm run worker"
echo ""
echo "Pro zastavení všech služeb:"
echo "   docker-compose down"

# 8. Test připojení
echo "8. Test připojení k databázi..."
if npx prisma db execute --stdin <<< "SELECT 1" > /dev/null 2>&1; then
    echo "   ✅ Připojení k databázi funguje."
else
    echo "   ❌ Nelze se připojit k databázi."
fi

echo ""
echo "✅ Testovací skript dokončen!"
echo "📋 Shrnutí oprav:"
echo "   - ERR_REQUIRE_CYCLE_MODULE: Opraveno lazy importem v workers/image-process.ts"
echo "   - Prisma 7+ datasource.url: Přesunuto do prisma/config.ts, odstraněno ze schema.prisma"
echo "   - torchvision==0.15.0: Aktualizováno na 0.15.2 v requirements.txt"
echo "   - @app.on_event: Nahrazeno lifespan v ml-service/app.py"
echo "   - Komentáře v package.json: Odstraněny, přidán postinstall script"
echo "   - MODULE_NOT_FOUND: Přidáno experimental.esmExternals: false do next.config.ts"
echo "   - Docker-compose: Odstraněna verze"
echo "   - .env.local: Vytvořen s DATABASE_URL"