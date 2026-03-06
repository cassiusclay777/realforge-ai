# REALFORGE-AI – Kritické problémy, opravy a vývojový plán

Cílená analýza jako senior full-stack developer a AI architect. Odkaz na předchozí analýzu: `ANALYZA_PROJEKTU.md`.

---

## 1. Základní analýza projektu

### 1.1 Struktura složek (ověřená)

| Složka | Účel |
|--------|------|
| `app/` | Next.js 15 App Router – stránky `(auth)`, `(dashboard)`, `api/` (route handlers) |
| `lib/` | Prisma, Redis, BullMQ fronty, **vision-analyzer.ts**, **deepseek-vision.ts**, deepseek.ts, utils, poski |
| `workers/` | **image-process-deepseek.ts** (hlavní), image-process.ts, image-process-backup.ts, image-process-simple.ts, one-click-processor.ts |
| `prisma/` | schema.prisma (PostgreSQL) |
| `components/` | UI (Radix), dashboard, MediaProcessingPanel, navbar, layout |
| `services/export/` | handlers (sreality.ts, poski.ts) |
| `ml-service/` | Python FastAPI – DeepSeek fallback/mock (v hlavním flow nepoužíván) |

### 1.2 Technologický stack (ověřený)

- **Runtime:** Node.js 18+
- **Framework:** Next.js 15 (App Router), TypeScript 5
- **DB:** Prisma 5, PostgreSQL (pg 8.18)
- **Fronta:** BullMQ 5.67, ioredis 5.9, Redis 7
- **AI:** DeepSeek API přes OpenAI SDK (openai 6.22) – baseURL `https://api.deepseek.com/v1`
- **UI:** React 18, Tailwind 4, Radix UI, React Query 5, Zustand 5
- **Auth:** NextAuth 4 (JWT), bcryptjs

---

## 2. Identifikace kritických problémů

### 2.1 `parseInt` bez validace → riziko `NaN`

**Nalezené soubory (hlavní větev, bez project-backup):**

| Soubor | Řádek | Výraz | Riziko |
|--------|-------|--------|--------|
| `app/api/listings/route.ts` | 21–22 | `parseInt(searchParams.get("limit") \|\| "10")`, `parseInt(..., "offset")` | `limit`/`offset` mohou být NaN nebo záporné → Prisma `take`/`skip` selže nebo vrátí nesmysl |
| `app/api/listings/route.ts` | 173–175 | `parseInt(body.price)`, `parseInt(body.area)`, `parseInt(body.rooms)` | `NaN` se zapíše do DB (price/area/rooms) |
| `app/api/upload/zip/route.ts` | 59–61, 87, 90–91 | `parseInt(price)`, `parseInt(area)`, `parseInt(rooms)` | Stejné – vytvoření listingu s NaN |
| `app/api/ai/process/route.ts` | 56–57 | `parseInt(price)`, `parseInt(area)` | Metadata pro AI s NaN |

**Ověření:** Pokud klient pošle `price: "abc"`, pak `parseInt("abc") === NaN` a Prisma může při `price: NaN` hodit nebo uložit neplatnou hodnotu.

### 2.2 `limit` / `take` bez clamping

| Soubor | Kontext | Problém |
|--------|---------|---------|
| `app/api/listings/route.ts` | `limit = parseInt(...) \|\| 10`, `take: limit` | Žádný clamp: `limit=-5` nebo `limit=999999` → zneužití nebo přetížení DB |
| `workers/image-process-deepseek.ts` | `Math.min(imageEntries.length, 20)` | Horní limit 20 je OK; žádný dolní limit (0 obrázků je ošetřeno fallbackem) |

**Doporučení:** Pro API listingu zavést `const LIMIT_MAX = 100`, `const LIMIT_DEFAULT = 10` a `limit = Math.min(LIMIT_MAX, Math.max(1, parsedLimit || LIMIT_DEFAULT))`.

### 2.3 `@ts-nocheck` a `as any`

**@ts-nocheck:**

| Soubor | Poznámka |
|--------|----------|
| `workers/image-process-deepseek.ts` | Celý soubor bez typů – odstranit a doplnit typy (getPrisma, job.data) |
| `workers/image-process.ts` | Stejně |
| `workers/image-process-backup.ts` | Stejně |
| `workers/image-process-simple.ts` | Stejně |
| `test/lib/prisma.test.ts` | Testy – přijatelné s komentářem |

**as any (hlavní větev):**

| Soubor | Kontext |
|--------|---------|
| `workers/image-process-deepseek.ts` | `connection: redis as any` (BullMQ vs ioredis typy) |
| `lib/queues.ts` | `connection: redis as any` (4×) |
| `lib/poski.ts` | `type: data.type.toUpperCase() as any` |
| `auth.ts` | `token.role = (user as any).role` |
| `app/api/upload/zip/route.ts` | `type: listingType as any` (Prisma enum) |

### 2.4 `zipUrl` v `POST /api/listings/[id]/process-media`

**Aktuální stav:**

```ts
// app/api/listings/[id]/process-media/route.ts, cca ř. 49–51
const zipUrl = `/uploads/${id}/photos.zip`; // Toto je příklad, v reálném případě bychom potřebovali skutečnou cestu
```

**Skutečnost:**

- Při **uploadu ZIP** (`POST /api/upload/zip`) se soubor ukládá jako `public/uploads/${listing.id}-${file.name}` a do jobu se posílá `zipUrl: /uploads/${fileName}` (např. `/uploads/clxxx-archive.zip`).
- Worker očekává cestu `path.join(process.cwd(), 'public', zipUrl)` → `public/uploads/clxxx-archive.zip` – **správně** pro flow z upload/zip.
- Při **manuálním** “zpracovat média” se do jobu posílá vždy `zipUrl = /uploads/${id}/photos.zip`. Tento soubor **nikde v kódu nevzniká** → worker ZIP nenajde → vždy volá `fallbackSimulation` (mock data).

**Závěr:** `zipUrl` v process-media je **špatně** – hardcoded neexistující cesta. Produkční chování “zpracovat média” bez předchozího uploadu je tedy jen simulace.

### 2.5 `GET /api/test-env` a vystavení `DATABASE_URL`

**Aktuální kód:**

```ts
// app/api/test-env/route.ts
export async function GET() {
  return NextResponse.json({
    DATABASE_URL: process.env.DATABASE_URL,  // ⚠️ plné connection string včetně hesla
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "Set" : "Not set",
    NODE_ENV: process.env.NODE_ENV,
  })
}
```

- **Žádná kontrola** `NODE_ENV` – endpoint je dostupný i v produkci.
- **DATABASE_URL** obsahuje heslo k DB – vystavení = kritické bezpečnostní riziko.
- **NEXTAUTH_URL** může odhalit interní URL.

**Závěr:** V produkci je `DATABASE_URL` (a další hodnoty) vystavován komukoli, kdo zavolá GET `/api/test-env`.

---

## 3. Navržené opravy a refaktoring

### 3.1 Validace `parseInt` a bezpečné číselné vstupy

**Společná utilita (doporučení):** `lib/validation/numbers.ts`

```ts
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

export function parsePositiveInt(value: unknown, defaultValue?: number): number | null {
  if (value == null || value === '') return defaultValue ?? null;
  const num = typeof value === 'number' ? value : parseInt(String(value), 10);
  if (Number.isNaN(num)) return defaultValue ?? null;
  return num > 0 ? num : (defaultValue ?? null);
}

export function parseNonNegativeInt(value: unknown, defaultValue?: number): number | null {
  if (value == null || value === '') return defaultValue ?? null;
  const num = typeof value === 'number' ? value : parseInt(String(value), 10);
  if (Number.isNaN(num)) return defaultValue ?? null;
  return num >= 0 ? num : (defaultValue ?? null);
}

export function clampLimit(parsed: number): number {
  return Math.min(MAX_LIMIT, Math.max(1, parsed));
}
```

**Použití v API:**

- **Listings GET:**  
  `limit = clampLimit(parsePositiveInt(searchParams.get("limit"), DEFAULT_LIMIT) ?? DEFAULT_LIMIT)`  
  `offset = Math.max(0, parseNonNegativeInt(searchParams.get("offset"), 0) ?? 0)`

- **Listings POST / upload/zip:**  
  `price = parsePositiveInt(body.price)`; pokud `price === null` nebo `price <= 0` → `return NextResponse.json({ error: "Neplatná cena" }, { status: 400 })`.  
  Stejně `area` a `rooms` jako volitelné: `parsePositiveInt(body.area)` / `parsePositiveInt(body.rooms)` s povoleným `null`.

### 3.2 Zjednodušení workerů

**Stav:** 4 soubory – `image-process-deepseek.ts`, `image-process.ts`, `image-process-backup.ts`, `image-process-simple.ts`; v `package.json` se používá jen `worker:deepseek` (`tsx workers/image-process-deepseek.ts`).

**Návrh:**

1. **Hlavní worker:** ponechat pouze `workers/image-process-deepseek.ts` jako jediný worker pro “image process” (přejmenovat např. na `workers/image-process.ts` a v package.json přejmenovat script na `worker`).
2. **Ostatní:** `image-process-backup.ts`, `image-process-simple.ts` a starý `image-process.ts` přesunout do `workers/archive/` nebo smazat po ověření, že nikde nejsou volány (grep na `image-process` kromě deepseek).
3. V README a skriptech uvádět jeden vstupní bod: `npm run worker` → `workers/image-process.ts` (bývalý deepseek).

### 3.3 Sjednocení AI vision modulu

**Stav:**

- **`lib/vision-analyzer.ts`** – třída `VisionAnalyzer`, model `deepseek-vision`, metoda `analyzePhoto(imagePath)`. **Používá ji pouze** `workers/image-process-deepseek.ts`.
- **`lib/deepseek-vision.ts`** – třída `DeepSeekVision`, model `deepseek-chat`, metody `analyzePhoto`, `generateListingDescription`, …; používá se pro složitější analýzu a generování textů (např. full listing pipeline), **ne v aktuálním workeru**.

**Návrh:**

- **Neslučovat do jednoho souboru** – účel je jiný: worker potřebuje rychlou klasifikaci + popisek jedné fotky (VisionAnalyzer); deepseek-vision je pro “celý listing” (více fotek + texty). Sloučení by zvětšilo závislosti workeru bez benefitů.
- **Sjednotit rozhraní:**  
  - V `lib/vision-analyzer.ts` ponechat `PhotoAnalysis` (roomType, description, suggestedCaption, saliencyScore, recommendedForMain).  
  - V `lib/deepseek-vision.ts` používat stejné typy (import z vision-analyzer) nebo společný soubor `lib/ai-types.ts` s `PhotoAnalysis`, aby výstup z obou modulů byl kompatibilní.
- **Dokumentace:** V README nebo v kódu krátce popsat: “VisionAnalyzer = jedna fotka, worker; DeepSeekVision = celý listing, generování textů.”

### 3.4 Sjednocení JWT secret (NEXTAUTH_SECRET vs AUTH_SECRET)

**Stav:**

- `auth.ts`: `secret: process.env.NEXTAUTH_SECRET`
- `middleware.ts`: `getToken({ req: request, secret: process.env.AUTH_SECRET })`
- `.env.example`: pouze `NEXTAUTH_SECRET`

**Návrh:**

- Použít **jednu** proměnnou: `NEXTAUTH_SECRET` (NextAuth to tak očekává).
- V **middleware** číst:  
  `secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET`  
  aby staré prostředí s `AUTH_SECRET` stále fungovalo.
- V `.env.example` a dokumentaci uvádět jen `NEXTAUTH_SECRET` a poznámku, že `AUTH_SECRET` je deprecated alias.

**Konkrétní úprava middleware.ts:**

```ts
const token = await getToken({
  req: request,
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
});
```

### 3.5 Zabezpečení `/api/test-env` a `DATABASE_URL`

**Možnosti:**

**A) Vypnout v produkci (doporučeno)**  
Vrátit 404 nebo 403, pokud `NODE_ENV === 'production'`, a **nikdy** nevracet `DATABASE_URL` (ani v dev).

```ts
export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available' }, { status: 404 });
  }
  return NextResponse.json({
    DATABASE_URL: process.env.DATABASE_URL ? '[SET]' : '[NOT SET]',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? '[NOT SET]',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'Set' : 'Not set',
    NODE_ENV: process.env.NODE_ENV,
  });
}
```

**B) Úplně odstranit**  
Smaž route `app/api/test-env/route.ts` a používej jen lokální `.env` kontrolu nebo jednorázové skripty.

**C) Ochrana pouze pro vývoj**  
Middleware nebo route kontroluje např. `NODE_ENV === 'development'` a hlavu `x-internal-debug: secret`. Stále **neposílat** skutečnou `DATABASE_URL`, jen “[SET]” / “[NOT SET]”.

---

### 3.6 Oprava zipUrl v process-media (uložení cesty při uploadu)

**Krok 1 – Prisma:** Do modelu `Listing` přidat volitelný field `sourceZipUrl String?` (cesta k nahranému ZIPu, např. `/uploads/clxxx-archive.zip`). Spustit `npx prisma db push` nebo migraci.

**Krok 2 – Upload route** (`app/api/upload/zip/route.ts`): Po uložení souboru aktualizovat listing:  
`await prisma.listing.update({ where: { id: listing.id }, data: { sourceZipUrl: \`/uploads/${fileName}\` } });`

**Krok 3 – Process-media route:** Místo pevné cesty načíst `const zipUrl = listing.sourceZipUrl`. Pokud je `null`, vracet 400 s hláškou „No ZIP uploaded for this listing. Upload a ZIP first.“ Worker pak dostane skutečnou cestu a soubor v `public/uploads/` najde.

---

## 4. Vývojový plán

### 4.1 Pořadí oprav

1. **Kritické (bezpečnost a stabilita)**  
   - Zabezpečit nebo odstranit `/api/test-env` (nikdy nevracet `DATABASE_URL`; v produkci 404).  
   - Sjednotit JWT secret v middleware (`NEXTAUTH_SECRET || AUTH_SECRET`).  
   - Validace `parseInt` u price/area/rooms/limit/offset + clamping `limit` (viz 3.1).

2. **Kritické (funkčnost)**  
   - Oprava `zipUrl` v process-media: ukládat při uploadu cestu k ZIPu do listingu a v process-media ji číst (viz níže **Oprava zipUrl**).

3. **Refaktoring**  
   - Odstranit `@ts-nocheck` z `workers/image-process-deepseek.ts` a doplnit typy.  
   - Zjednodušit workers (jeden hlavní, zbytek do archivu).  
   - Společné typy/konstanty pro vision (PhotoAnalysis, kategorie).

4. **Vývoj**  
   - Zapnout auth na listings API a upravit public routes.  
   - Perzistence API klíčů (integrations) v DB.

### 4.2 Jak zjistit, že je test-env vypnut ve vývojovém prostředí

- **Manuálně:** V `.env.local` nastavit `NODE_ENV=development`, spustit app, zavolat `GET /api/test-env` – měl by vracet pouze “[SET]”/“[NOT SET]”, ne skutečnou `DATABASE_URL`. V produkci (`NODE_ENV=production`) by měl vracet 404.
- **Automaticky:** E2E nebo API test (např. Vitest + fetch):  
  - v “production” buildu volat `GET /api/test-env` a ověřit `status === 404`;  
  - v testu nikdy nemockovat `DATABASE_URL` do odpovědi – ověřit jen, že odpověď neobsahuje řetězec ve tvaru `postgresql://`.

### 4.3 Jak zjistit, že je fallbackSimulation použit v produkci

- **Logování:** Na začátku `fallbackSimulation` v workeru přidat např.  
  `console.warn('[FALLBACK_SIMULATION]', { listingId, zipUrl, env: process.env.NODE_ENV })`.  
  V produkci sledovat logy (Sentry, CloudWatch, …) na `FALLBACK_SIMULATION` – pokud se objevuje, buď chybí ZIP (špatný zipUrl), nebo chybí `DEEPSEEK_API_KEY`.
- **Metriky:** Při volání `fallbackSimulation` inkrementovat metriku (např. “worker.fallback_simulation.total”). V produkci alarm při nenulové hodnotě.
- **Rozlišit důvod:** Místo jednoho fallbacku předat důvod (např. `reason: 'zip_not_found' | 'no_api_key' | 'no_images'`) a logovat/metrikovat podle reason.

---

## 5. Závěr

### 5.1 Co je potřeba pro produkci (auth, konfigurace, validace, fronta, AI)

- **Auth:** Zapnout session check v GET/POST `/api/listings` a vyjmout `/api/listings` z public routes (nebo omezit public jen na konkrétní GET, pokud je to záměr). Sjednotit JWT secret v middleware.
- **Konfigurace:** Žádné vystavování `DATABASE_URL`; test-env v produkci vypnut nebo smazán. API klíče (DeepSeek) ukládat do DB (šifrovaně), ne jen do paměti.
- **Validace:** Všechny číselné vstupy (price, area, rooms, limit, offset) přes parse + kontrolu NaN a rozsahů; při neplatné hodnotě 400.
- **Fronta:** zipUrl v process-media musí odpovídat skutečné cestě k ZIPu (uložení při uploadu a použití v process-media). Jeden hlavní worker, ostatní archivovat.
- **AI:** VisionAnalyzer v workeru je v pořádku; zajistit, že v produkci je nastaven `DEEPSEEK_API_KEY`, aby se fallbackSimulation nevolal zbytečně. Sjednotit typy mezi vision-analyzer a deepseek-vision (volitelné, ale vhodné).

### 5.2 vision-analyzer.ts a image-process-deepseek.ts

- **Použití:** V `workers/image-process-deepseek.ts` je na ř. 9 import `import { VisionAnalyzer } from '@/lib/vision-analyzer'` a v jobu se volá `analyzer.analyzePhoto(fullPath)` (ř. 244). **VisionAnalyzer je tedy v tomto workeru jediný použitý vision modul.**
- **Zjednodušení:**  
  - Worker nepotřebuje `DeepSeekVision`; stačí jeden modul pro “jedna fotka” = `VisionAnalyzer`.  
  - Typy (`PhotoAnalysis`) mohou být v `lib/vision-analyzer.ts` a případně reexportovány z `lib/ai-types.ts` pro použití v `deepseek-vision.ts`.  
  - Odstranit `@ts-nocheck` a typovat `getPrisma()` a `job.data` (interface pro payload jobu), aby byl worker plně typovaný bez `as any` kromě nutného `connection: redis as any` (kompatibilita BullMQ/ioredis).

---

*Tento dokument doplňuje `ANALYZA_PROJEKTU.md` a soustředí se na kritické problémy a konkrétní návrhy oprav.*
