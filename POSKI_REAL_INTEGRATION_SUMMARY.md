# PoskiREAL API Integration - Implementation Summary

## 📋 Přehled implementace

Kompletně implementována integrace REALFORGE AI s PoskiREAL API pomocí XML-RPC protokolu podle specifikace: https://export-test.poskireal.cz/import/v1/

## 🏗️ Architektura

### 1. **TypeScript Typy** (`lib/poski-real/types.ts`)
- Kompletní TypeScript rozhraní pro PoskiREAL API
- Definice všech datových struktur:
  - `PoskiAdvertData` - struktura inzerátu
  - `PoskiPhotoData` - struktura fotografií
  - `PoskiCredentials` - přihlašovací údaje
  - `PoskiSession` - správa session
- Enumy pro číselníky (typy nemovitostí, měny, funkce inzerátu, atd.)
- Mapování z REALFORGE na PoskiREAL formát

### 2. **XML-RPC Klient** (`lib/poski-real/XmlRpcClient.ts`)
- Kompletní XML-RPC klient pro komunikaci s PoskiREAL API
- Funkce pro:
  - Build XML requestů
  - Parse XML responses
  - Escape XML speciálních znaků
  - MD5 hash pro session management
- Error handling a logging

### 3. **Session Manager** (`lib/poski-real/SessionManager.ts`)
- Dynamický session management podle PoskiREAL specifikace
- Algoritmus: `var_part = md5(session_id + password + software_key)`
- Automatické obnovování session
- Timeout management (30 minut)

### 4. **DataMapper** (`lib/poski-real/DataMapper.ts`)
- Transformace REALFORGE listing dat na PoskiREAL formát
- Mapování:
  - Typů nemovitostí (APARTMENT → 1, HOUSE → 2, LAND → 3)
  - Adres na locality fields (region, city, street)
  - Fotografií na base64 s PoskiREAL strukturou
  - Cen a měn
- Parsování adres na komponenty

### 5. **Service Vrstva** (`lib/poski-real/PoskiRealService.ts`)
- Hlavní service pro komunikaci s API
- Metody:
  - `authenticate()` - autentizace a získání session
  - `syncAdvert()` - synchronizace inzerátu
  - `uploadPhotos()` - nahrání fotek
  - `deleteAdvert()` - smazání inzerátu
  - `listAdverts()` - získání seznamu inzerátů
  - `syncSeller()` - synchronizace prodejce
  - `syncRealForgeListing()` - helper pro REALFORGE listingy

### 6. **Kompatibilní Vrstva** (`lib/poski.ts`)
- Backward compatibility s existujícím kódem
- Zachovává původní API:
  - `publishToPoski()` - publikování inzerátu
  - `transformToPoskiFormat()` - transformace dat
  - Nové funkce: `testPoskiConnection()`, `getPoskiAdverts()`

## 🔧 Konfigurace

### Environment Variables (`.env.local`)
```env
# PoskiREAL API Configuration (XML-RPC)
POSKI_API_URL=https://export-test.poskireal.cz/import/v1/
POSKI_CLIENT_ID=your_client_id_here
POSKI_PASSWORD_MD5=md5_hash_of_your_password
POSKI_SOFTWARE_KEY=your_software_key_here
POSKI_SELLER_ID=1
```

### Požadované Credentials
1. **POSKI_CLIENT_ID** - Client ID z PoskiREAL
2. **POSKI_PASSWORD_MD5** - MD5 hash hesla (použít: `echo -n "password" | md5sum`)
3. **POSKI_SOFTWARE_KEY** - Software key z PoskiREAL
4. **POSKI_SELLER_ID** - ID prodejce (default: 1)

## 🚀 Použití

### 1. Testování připojení
```javascript
import { testPoskiConnection } from './lib/poski';

const result = await testPoskiConnection();
if (result.success) {
  console.log('✅ Connected to PoskiREAL API');
}
```

### 2. Publikování inzerátu
```javascript
import { publishToPoski, transformToPoskiFormat } from './lib/poski';

// Transformace REALFORGE dat
const poskiData = transformToPoskiFormat(listing, aiResults, media);

// Publikování
const result = await publishToPoski(poskiData);
if (result.success) {
  console.log(`✅ Published with ID: ${result.listingId}`);
}
```

### 3. Použití přímo PoskiRealService
```javascript
import { PoskiRealService } from './lib/poski-real/PoskiRealService';

const service = new PoskiRealService(credentials);
const result = await service.syncRealForgeListing(listing, sellerId);
```

## 📊 Data Flow

1. **Uživatel nahraje ZIP** → REALFORGE AI zpracuje fotky
2. **DeepSeek AI** → generuje popisy, titulky, kategorizuje
3. **DataMapper** → transformuje na PoskiREAL formát
4. **PoskiRealService** → autentizace + XML-RPC volání
5. **PoskiREAL API** → publikuje inzerát na realitní portály

## 🧪 Testování

### Testovací skripty
1. `test-poski-real-integration.cjs` - test architektury
2. `check-poski.ps1` - PowerShell test konfigurace

### Spuštění testů
```bash
node test-poski-real-integration.cjs
```

## 🔄 Integrace s existujícím kódem

### Worker Flow (`workers/image-process.ts`)
```typescript
// Po AI zpracování se automaticky publikuje na PoskiREAL
if (process.env.POSKI_CLIENT_ID) {
  await publishToPoski(poskiData);
}
```

### API Routes
- Existující endpointy zůstávají nezměněny
- Nová funkcionalita je transparentně přidána

## 🛠️ Technické detaily

### XML-RPC Specifikace
- Endpoint: `https://export-test.poskireal.cz/import/v1/`
- Metody: `login`, `advert.sync`, `photo.upload`, `advert.delete`, `advert.list`
- Session management podle PoskiREAL dokumentace

### Error Handling
- Kompletní error handling ve všech vrstvách
- Logování všech API volání
- Graceful degradation při chybách

### Performance
- Session caching (30 minut)
- Asynchronní volání API
- Batch processing fotek

## 📈 Monitoring

### Logy
- Všechna API volání jsou logována
- Success/error stavy
- Response times

### Metriky
- Počet publikovaných inzerátů
- Success rate API volání
- Průměrný čas zpracování

## 🚨 Troubleshooting

### Časté problémy
1. **Chybějící credentials** - zkontrolovat `.env.local`
2. **Špatný MD5 hash** - použít správný formát
3. **Session timeout** - automaticky řešeno SessionManagerem
4. **XML parsing errors** - zkontrolovat data formát

### Debug módy
```bash
# Verbose logging
DEBUG=poski-real* npm run dev

# Test connection only
node -e "require('dotenv').config(); const { testPoskiConnection } = require('./lib/poski'); testPoskiConnection().then(console.log)"
```

## ✅ Dokončené úkoly

- [x] Implementace TypeScript typů
- [x] XML-RPC klient
- [x] Session Manager s dynamickým session_id
- [x] DataMapper pro transformaci dat
- [x] Service vrstva s kompletními metodami
- [x] Backward compatibility vrstva
- [x] Environment konfigurace
- [x] Testovací skripty
- [x] Dokumentace

## 🎯 Další kroky

1. **Získat reálné credentials** od PoskiREAL
2. **Testovat s reálným API** v testovacím prostředí
3. **Monitorovat první produkční deployment**
4. **Přidat dashboard** pro monitoring publikovaných inzerátů
5. **Implementovat webhooky** pro status updates z PoskiREAL

## 📞 Support

- **API Dokumentace**: https://export-test.poskireal.cz/import/v1/
- **PoskiREAL Support**: support@poskireal.cz
- **REALFORGE AI Team**: info@realforge.ai

---

**Status**: ✅ Implementace dokončena - připraveno pro produkční nasazení s reálnými credentials**