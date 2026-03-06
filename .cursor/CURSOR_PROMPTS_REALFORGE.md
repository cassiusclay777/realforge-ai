# Prompty pro Cursor – REALFORGE-AI

Kopíruj celý blok pod nadpisem do Cursoru. Před kódováním: přečti relevantní soubory, ověř konvence (TypeScript, Tailwind, Prisma), neporušuj existující chování. Po změně `prisma/schema.prisma` spusť `npx prisma generate`.

---

## 1. API klíče integrací ukládat do DB (místo paměti)

**Kontext:** V `app/api/settings/integrations/route.ts` se DeepSeek API klíč ukládá jen do paměti (`integrationConfig`). Po restartu je pryč. Worker čte jen `process.env.DEEPSEEK_API_KEY`. Model `Integration` v Prisma už existuje (pole `apiKey`, `userId`, `name`).

**Úkol:**  
1. V `app/api/settings/integrations/route.ts`: při GET načíst integraci pro přihlášeného uživatele z Prisma (např. `name: "DEEPSEEK"`), vracet jen příznak „klíč je nastaven“, ne samotný klíč. Při POST uložit/aktualizovat záznam v `Integration` pro daného uživatele – před zápisem do DB klíč zašifrovat (např. `crypto.createCipheriv` + `process.env.ENCRYPTION_KEY` nebo AES z běžné knihovny), ukládat zašifrovaný string do `apiKey`.  
2. V `workers/image-process-deepseek.ts`: pokud `process.env.DEEPSEEK_API_KEY` není nastaven, načíst klíč z DB přes Prisma (integrace pro daný kontext / default uživatel), před použitím dešifrovat.  
3. Do `.env.example` přidat `ENCRYPTION_KEY` (min. 32 bytů pro AES-256).  
4. Neukládat klíč v plaintextu do DB; Prisma schéma neměnit (pole `apiKey` stačí).

**Omezení:** Žádné rozbití existujícího flow; při chybějícím klíči v DB worker má fallback (např. skip nebo stávající chování).

---

## 2. POST /api/ai/process – reálné volání DeepSeek místo mocku

**Kontext:** V `app/api/ai/process/route.ts` funkce `processWithAI()` je mock: 2 s delay a vrací statické texty. Žádné volání vision/LLM API.

**Úkol:**  
1. Napojit na reálné DeepSeek Vision/API (např. existující `lib/deepseek-vision.ts` nebo oficiální SDK).  
2. Z requestu brát `images` (URL nebo base64), `listingId`, `title`, `address`, `type`, `price`, `area` a volat DeepSeek s obrázky + kontextem nemovitosti.  
3. Z odpovědi AI vyplnit: popis, SEO title/description, instagram/facebook post, doporučenou cenu, kategorizaci fotek – a uložit do `Listing.aiResult` (nebo stávajícího pole, které route už používá).  
4. Ošetřit chyby (rate limit, neplatný klíč, timeout) – vracet 4xx/5xx a logovat.  
5. Odstranit mock delay a mock návratové hodnoty.

**Omezení:** Zachovat stávající request/response kontrakt endpointu, aby frontend nemusel měnit.

---

## 3. Export na Sreality – reálné volání API

**Kontext:** `services/export/handlers/sreality.ts` připravuje payload, ale místo HTTP requestu vrací `mockResponse` s fiktivním ID a URL. ExportJob v Prisma není (volitelné).

**Úkol:**  
1. Zjistit oficiální Sreality API (REST endpoint, autentizace – API klíč nebo OAuth).  
2. Po přípravě payloadu (title, description, price, obrázky, adresa, …) poslat skutečný HTTP request (fetch/axios) na Sreality API.  
3. Z odpovědi parsovat skutečné ID inzerátu a URL (pokud API vrací) a vrátit v `ExportResult` (externalId, url).  
4. Při chybě (4xx/5xx, invalid response) vracet `success: false` a do `errors` doplnit zprávu.  
5. Token/klíč: zatím načítat z `process.env.SREALITY_API_TOKEN` nebo z Integration v DB (pokud už bude implementace z úkolu 1).  
6. (Volitelně) Přidat model `ExportJob` do Prisma (listingId, platform, externalId, status, createdAt) a po úspěšném exportu zapsat záznam.

**Omezení:** Ne měnit podpis `publishToSreality(jobData)`; vracet stávající `ExportResult` tvar.

---

## 4. Poski DataMapper – implementovat getBase64FromUrl

**Kontext:** V `lib/poski-real/DataMapper.ts` metoda `getBase64FromUrl(url: string)` je placeholder: pouze `console.warn` a vrací `'BASE64_PLACEHOLDER'`. Export do Poski potřebuje obrázky jako base64.

**Úkol:**  
1. Implementovat `getBase64FromUrl`: HTTP GET na `url` (fetch nebo axios), timeout např. 30 s, max velikost např. 5 MB.  
2. Data převést na base64 (Buffer/atob podle prostředí) a vrátit řetězec.  
3. Při chybě (neplatná URL, timeout, příliš velký soubor, ne-obrázek) logovat a vracet prázdný string nebo vyhodit srozumitelnou chybu – podle toho, jak to volající kód očekává.  
4. Přidat unit test (např. Vitest) s mockem HTTP odpovědi, který ověří, že výstup je platný base64.

**Omezení:** Zachovat signaturu `private static getBase64FromUrl(url: string): string` (nebo vracet `Promise<string>` a upravit volající kód na async, pokud je to v kódu potřeba).

---

## 5. (Volitelně) Dokumentace startu aplikace a workeru

**Kontext:** Redis je už v `docker-compose.yml`. Worker (BullMQ) vyžaduje běžící Redis.

**Úkol:**  
Do README nebo do `docs/development.md` doplnit krátký postup:  
1. `docker-compose up -d` (nebo `docker-compose up -d postgres redis`).  
2. `npm run dev` (Next.js + worker z package.json).  
3. Ověření: worker se připojí na `redis://localhost:6379` (REDIS_URL z .env).  
4. Nepřidávat Redis do docker-compose znovu – už tam je.

---

## Společné pokyny pro všechny prompty

- Před změnami načti dotčené soubory a pochop stávající flow.  
- Respektuj konvence: TypeScript, Tailwind, Prisma, NextAuth.  
- Kde je to rozumné, přidej unit nebo integrační test pro novou logiku.  
- Po změně schématu Prisma: `npx prisma generate`; při migraci `npx prisma db push` nebo `migrate dev`.
