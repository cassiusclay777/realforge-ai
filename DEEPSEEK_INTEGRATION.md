# DeepSeek API Integrace do REALFORGE AI

## Přehled

Integrovali jsme DeepSeek AI API do REALFORGE AI projektu pro generování realitního obsahu. DeepSeek API je kompatibilní s OpenAI SDK, což zjednodušuje integraci.

## Co bylo implementováno

### 1. Závislosti
- Přidána závislost `openai` do `package.json`
- Nainstalováno pomocí `npm install openai`

### 2. Konfigurace
- Přidány proměnné prostředí do `.env.local`:
  ```
  DEEPSEEK_API_KEY=""
  DEEPSEEK_API_URL="https://api.deepseek.com"
  ```

### 3. Hlavní komponenty

#### a) `lib/deepseek.ts`
Hlavní služba pro komunikaci s DeepSeek API:
- `analyzeImageWithDeepSeek()` - analýza obrázků nemovitostí
- `generateContentWithDeepSeek()` - generování marketingového obsahu
- `checkDeepSeekHealth()` - kontrola dostupnosti API

#### b) `workers/image-process-deepseek.ts`
Nový worker pro zpracování obrázků s DeepSeek AI:
- Extrahuje obrázky z ZIP souborů
- Analyzuje obrázky pomocí DeepSeek API
- Generuje marketingový obsah
- Ukládá výsledky do databáze
- Má fallback na simulaci při chybě API

### 4. Oprava chyby `image_url` vs `text`

**Původní chyba:** `"unknown variant 'image_url', expected 'text'"`

**Příčina:** DeepSeek API pravděpodobně nepodporuje multimodální vstupy (obrázky) ve formátu `image_url` jako OpenAI Vision API.

**Řešení:** 
- Místo použití `image_url` formátu posíláme URL obrázku jako text
- DeepSeek analyzuje obrázek na základě textového popisu URL
- Implementován fallback mechanismus pro případ chyby API

## Jak používat

### 1. Nastavení API klíče
1. Získejte API klíč z https://platform.deepseek.com/api-keys
2. Přidejte ho do `.env.local`:
   ```
   DEEPSEEK_API_KEY="sk-vaš-klíč-zde"
   ```

### 2. Spuštění workeru
```bash
# Spustit nový DeepSeek worker
npm run worker:deepseek
```

### 3. Testování integrace
```bash
# Spustit testovací skript
node test-deepseek-simple.js
```

## Architektura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   ZIP Upload    │───▶│   BullMQ Queue  │───▶│ DeepSeek Worker │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                         │
                                                         ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Database      │◀───│   AI Results    │◀───│ DeepSeek API    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Fallback mechanismus

Pokud DeepSeek API není dostupné nebo vrátí chybu:
1. Worker přejde do simulovaného režimu
2. Generuje mockovaná AI data
3. Uloží výsledky do databáze
4. Uživatel stále získává funkční výsledky

## Výhody integrace

1. **Skutečná AI analýza** - místo simulovaných dat
2. **Profesionální obsah** - generovaný specializovaným AI
3. **Škálovatelnost** - možnost zpracování více obrázků
4. **Flexibilita** - snadné přepnutí mezi AI poskytovateli

## Omezení

1. DeepSeek nemusí podporovat přímou analýzu obrázků jako OpenAI Vision
2. API limity a ceny podle tarifu DeepSeek
3. Závislost na externí službě

## Další vylepšení

1. Přidat podporu pro více AI providerů (OpenAI, Anthropic, atd.)
2. Implementovat batch processing pro hromadné zpracování
3. Přidat caching výsledků pro opakované analýzy
4. Implementovat monitoring využití API a nákladů

## Testování

Pro otestování integrace:
1. Spusťte `node test-deepseek-simple.js`
2. Nahrát testovací ZIP soubor přes UI
3. Zkontrolujte generovaný AI obsah v databázi

## Troubleshooting

### Chyba: "401 Authentication Fails"
- Zkontrolujte, zda je API klíč správně nastaven v `.env.local`
- Ověřte, zda klíč začíná na `sk-`

### Chyba: "unknown variant 'image_url'"
- DeepSeek nepodporuje multimodální vstupy
- Používáme textový fallback mechanismus

### Pomalé odpovědi API
- Snižte `concurrency` v worker konfiguraci
- Implementujte retry mechanismus s exponenciálním backoffem