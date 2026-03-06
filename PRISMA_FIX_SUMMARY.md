# Prisma Fix - Souhrn stavu a další postup

## Problém, který byl vyřešen
**Původní chyba:** `npx prisma db push` hlásil `Error: spawn prisma-client ENOENT`

**Příčina:** Bug v Prisma 5.0.0 na Windows systémech

## Co bylo provedeno

### 1. Diagnostika
- Zkontrolována instalace Prisma CLI a Prisma Client
- Ověřeno, že `node_modules/.prisma/client` existuje
- Zjištěno, že problém je specifický pro Prisma 5.0.0 na Windows

### 2. Řešení
- **Aktualizace Prisma:** Z 5.0.0 na 6.19.2 (stabilní verze bez tohoto bugu)
  ```bash
  npm install --save-dev prisma@6 @prisma/client@6
  ```
- **Oprava schema.prisma:** Vráceno původní schéma s `url` v datasource (Prisma 6 to stále podporuje)
- **Vygenerování Prisma Client:**
  ```bash
  npx prisma generate
  ```
- **Synchronizace databáze:**
  ```bash
  npx prisma db push
  ```

### 3. Workaround pro Prisma Client cestování
Vytvořeny symbolické linky pro správné rozlišení cest:
- `.prisma/client` → `node_modules/.prisma/client` (junction na Windows)
- Úprava `node_modules/@prisma/client/default.js` pro správné cesty

## Aktuální stav

### ✅ Funkční
- `prisma db push` - funguje bez chyb
- `prisma generate` - funguje bez chyb  
- Databáze je synchronizovaná se schématem
- Next.js vývojový server běží na portu 3001 (3000 byl obsazen)

### ⚠️ Známé problémy
1. **Prisma Client testování přes Node.js přímo** - může mít problémy s cestami na Windows
   - Aplikace ale funguje přes Next.js/TypeScript build process
   - Prisma Client je správně vygenerován v `node_modules/.prisma/client`

2. **Symbolické linky na Windows** - mohou způsobit problémy při přesunech projektu
   - Pokud se vyskytnou problémy, smazat `.prisma` složku a znovu spustit `prisma generate`

## Doporučení pro další postup

### 1. Pro vývoj
- Používejte `npm run dev` nebo `npm run dev:next` pro spuštění vývojového serveru
- Při změnách v `prisma/schema.prisma`:
  ```bash
  npx prisma db push
  # nebo
  npx prisma migrate dev
  ```

### 2. Pro produkční build
- Před buildem vždy spustit:
  ```bash
  npx prisma generate
  npm run build
  ```

### 3. Pokud se problém vrátí
1. Smazat cache Prisma:
   ```bash
   Remove-Item -Recurse -Force node_modules\.prisma -ErrorAction SilentlyContinue
   ```
2. Znovu vygenerovat Prisma Client:
   ```bash
   npx prisma generate
   ```
3. Pokud problém přetrvává, zkontrolovat verze:
   ```bash
   npx prisma --version
   npm list @prisma/client
   ```

### 4. Možné vylepšení do budoucna
- **Aktualizace na Prisma 7+** - vyžaduje migraci konfigurace (prisma.config.ts)
- **Dockerizace** - pro konzistentní prostředí napříč týmy
- **CI/CD pipeline** - automatické migrace při deployi

## Technické detaily

### Verze
- Prisma: 6.19.2
- @prisma/client: 6.19.2
- Node.js: v24.13.0
- OS: Windows 11

### Důležité soubory
- `prisma/schema.prisma` - databázové schéma
- `prisma.config.ts` - **NEPOTŘEBUJE SE** (pouze pro Prisma 7+)
- `.env.local` - environment variables s DATABASE_URL
- `node_modules/@prisma/client/default.js` - upraven pro správné cesty

### Příkazy pro ověření funkčnosti
```bash
# Test Prisma db push
npx prisma db push

# Test Prisma generate
npx prisma generate

# Spuštění vývojového serveru
npm run dev:next

# Kontrola verzí
npx prisma --version
```

## Kontakt pro další pomoc
Pokud se vyskytnou další problémy s Prisma, doporučuji:
1. Zkontrolovat [Prisma dokumentaci](https://www.prisma.io/docs)
2. Prohledat [Prisma GitHub issues](https://github.com/prisma/prisma/issues)
3. Použít `npx prisma --help` pro nápovědu k příkazům

---

*Tento dokument vytvořen 15. 2. 2026 jako reference pro další AI pomocníky a vývojáře.*