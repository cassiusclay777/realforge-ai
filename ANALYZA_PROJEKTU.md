# REALFORGE-AI – Kompletní analýza projektu

Analýza jako senior full-stack developer a AI architect. Datum: 26. 2. 2025.

---

## 1. Architektura projektu

### 1.1 Struktura složek a souborů

```
REALFORGE-AI/
├── app/                          # Next.js 15 App Router
│   ├── (auth)/                   # Skupina rout: login, register
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/              # Chráněné stránky po přihlášení
│   │   ├── dashboard/
│   │   ├── listings/             # Seznam + detail [id]
│   │   ├── upload/               # Upload ZIP + fronta
│   │   ├── crm/
│   │   ├── settings/             # security, billing, integrations
│   │   ├── integrations/
│   │   ├── automations/
│   │   └── layout.tsx
│   ├── api/                      # API routes
│   │   ├── auth/[...nextauth]/   # NextAuth
│   │   ├── auth/register/
│   │   ├── listings/             # GET/POST listings, [id]/process-media, media-status
│   │   ├── upload/zip/           # Upload ZIP → vytvoření listingu + BullMQ job
│   │   ├── process-zip/          # Synchronní zpracování ZIP (DeepSeek v API)
│   │   ├── queue/process-zip/
│   │   ├── ai/process/ + ai/test/
│   │   ├── settings/integrations/
│   │   └── test-env/             # Debug env (bezpečnostní riziko)
│   ├── preview/[id]/             # Veřejný náhled listingu
│   ├── analytics/
│   ├── layout.tsx
│   ├── page.tsx                  # Landing (Přihlásit / Vytvořit účet)
│   └── providers.tsx             # SessionProvider, QueryClient, ThemeProvider
├── components/
│   ├── ui/                       # shadcn-style (button, card, input, …)
│   ├── dashboard/                # charts, analytics-section, stats-cards, …
│   ├── MediaProcessingPanel.tsx
│   ├── GalleryGrid.tsx, CategoryIcons.tsx
│   ├── navbar.tsx, DashboardLayout.tsx, SettingsLayout.tsx
│   └── theme-provider.tsx
├── lib/
│   ├── prisma.ts                 # Singleton PrismaClient
│   ├── redis.ts                  # Redis pro BullMQ
│   ├── queues.ts                 # BullMQ fronty (image-process, image-process-deepseek)
│   ├── vision-analyzer.ts        # VisionAnalyzer – DeepSeek vision (analýza fotek)
│   ├── deepseek-vision.ts        # DeepSeekVision – analýza + generování textů
│   ├── deepseek.ts               # OpenAI-kompatibilní klient (baseURL DeepSeek)
│   ├── deepseek-utils.ts         # Pomocníci + konfigurace API klíče
│   ├── utils.ts, queeries.ts, prisma-simple.ts
│   └── poski*.ts / poski-real/   # Integrace Poski (export)
├── workers/
│   ├── image-process-deepseek.ts # Hlavní worker: ZIP → extrakce → VisionAnalyzer → DB
│   ├── image-process.ts, image-process-backup.ts, image-process-simple.ts
│   └── one-click-processor.ts
├── services/export/handlers/     # Sreality, Poski export
├── prisma/
│   └── schema.prisma             # PostgreSQL, 15+ modelů
├── ml-service/                   # Python FastAPI (DeepSeek fallback/mock)
├── auth.ts                       # NextAuth config (Credentials, Email, Google)
├── middleware.ts                 # Auth + RBAC (AGENT/ADMIN)
├── hooks/                        # use-listing-media-processing
└── project-backup/, mini-backup/ # Zálohy (zbytečné v repo)
```

### 1.2 Hlavní moduly a vrstvy

| Vrstva      | Technologie              | Účel |
|------------|--------------------------|------|
| Frontend   | Next.js 15, React 18, Tailwind 4 | Stránky, formuláře, dashboard |
| API        | Next.js Route Handlers   | REST API (listings, upload, auth, AI) |
| Auth       | NextAuth 4 (JWT)         | Credentials, Email, Google |
| DB         | Prisma + PostgreSQL     | Listings, User, ListingMedia, AIResult, CRM, … |
| Fronta     | BullMQ + Redis           | Zpracování ZIP / obrázků na pozadí |
| AI         | DeepSeek API (OpenAI SDK) | Vision (vision-analyzer, deepseek-vision), text |
| Worker     | tsx workers/*.ts         | Samostatný proces (concurrently s next dev) |
| ML (volný) | Python FastAPI (ml-service) | README zmiňuje CLIP/DINOv2; v kódu hlavně DeepSeek |

### 1.3 Závislostní diagram (ASCII)

```
                    ┌─────────────────────────────────────────────────────────┐
                    │                     Browser (User)                        │
                    └───────────────────────────┬───────────────────────────────┘
                                                │
                    ┌───────────────────────────▼───────────────────────────────┐
                    │  Next.js (next dev -p 3001)                                │
                    │  ├── middleware.ts (getToken → AUTH_SECRET)                │
                    │  ├── app/page.tsx, (auth)/*, (dashboard)/*                 │
                    │  └── app/api/*                                              │
                    └───┬─────────────┬─────────────┬─────────────┬──────────────┘
                        │             │             │             │
        ┌───────────────▼──┐   ┌──────▼──────┐   ┌──▼──────┐   ┌──▼─────────────┐
        │ Prisma           │   │ Redis       │   │ DeepSeek │   │ FS (public/    │
        │ (PostgreSQL)     │   │ (BullMQ)    │   │ API      │   │  uploads, temp)│
        └──────────────────┘   └──────┬──────┘   └──────────┘   └────────────────┘
                                      │
                    ┌─────────────────▼─────────────────┐
                    │  Worker (tsx workers/             │
                    │  image-process-deepseek.ts)        │
                    │  ├── Prisma (getPrisma)           │
                    │  ├── Redis (přímé ioredis)        │
                    │  ├── VisionAnalyzer (DeepSeek)    │
                    │  └── FS (ZIP extract, public/)     │
                    └───────────────────────────────────┘
```

**Závislosti mezi moduly:**

- **app/** závisí na **lib/prisma**, **lib/queues**, **auth**, **lib/deepseek** (process-zip), **lib/vision-analyzer** (nepřímo přes worker).
- **workers/** závisí na **lib/prisma** (dynamic import), **lib/vision-analyzer**, **Redis**, **FS**.
- **Auth** závisí na **lib/prisma**, **bcryptjs**; **middleware** na **next-auth/jwt** (secret z env).
- Žádná závislost na **ml-service** v hlavním flow – AI jde přes DeepSeek API z Node.js.

---

## 2. Technologický stack

### 2.1 Použité technologie a verze (z package.json)

| Kategorie   | Technologie | Verze | Poznámka |
|------------|-------------|--------|----------|
| Runtime    | Node.js     | 18+    | README |
| Framework  | Next.js     | ^15.5.12 | App Router |
| React      | react, react-dom | ^18.3.1 | |
| Jazyk      | TypeScript  | ^5     | |
| DB         | Prisma      | ^5.22 (dev), @prisma/client 5.22 | |
| DB driver  | pg          | ^8.18.0 | |
| Auth       | next-auth   | ^4.24.7 | JWT strategy |
| Fronta     | bullmq      | ^5.67.3, ioredis ^5.9.2 | |
| AI         | openai      | ^6.22.0 | Použito pro DeepSeek (baseURL) |
| UI         | tailwindcss | ^4, @tailwindcss/postcss ^4 | |
| UI kompon. | Radix (dialog, dropdown, tabs, toast, …) | různé ^0.x / ^1.x | |
| State      | zustand ^5.0.11, @tanstack/react-query ^5.90 | |
| Ostatní    | bcryptjs, uuid, nodemailer, recharts, framer-motion, adm-zip, form-data | | |
| Dev        | vitest, @testing-library/react, tsx, concurrently | | |

### 2.2 Zhodnocení volby technologií

- **Next.js 15 + App Router** – vhodné pro full-stack MVP, API routes + SSR.
- **Prisma + PostgreSQL** – rozumná volba pro strukturovaná data a vztahy (listings, media, CRM).
- **BullMQ + Redis** – správná volba pro dlouho běžící úlohy (AI analýza obrázků).
- **NextAuth 4 (JWT)** – v pořádku; pozor na konzistenci secret (viz Bezpečnost).
- **DeepSeek přes OpenAI SDK** – praktické (kompatibilní API); jediný hlavní AI provider v kódu.
- **Tailwind 4 + Radix** – konzistentní UI stack.
- **React Query** – vhodné pro API cache a stav na straně klienta.

Nevýhody / rozptyly:

- **Dva “vision” moduly**: `lib/vision-analyzer.ts` (VisionAnalyzer, model `deepseek-vision`) a `lib/deepseek-vision.ts` (DeepSeekVision, model `deepseek-chat`). Worker používá pouze VisionAnalyzer; deepseek-vision slouží spíš pro generování textů. Sjednotit názvy a odpovědnosti nebo to explicitně zdokumentovat.
- **ml-service (Python)** – v README jako hlavní AI (CLIP, DINOv2, GPT-4o-mini), v reálném flow se nepoužívá; hlavní AI je DeepSeek z Node.js. Buď ml-service zapojit, nebo z README odstranit/upravit.
- **Duplicitní workers** (image-process, image-process-backup, image-process-simple) – udržovat jeden hlavní (image-process-deepseek) a zbytek vyřadit nebo jasně označit jako legacy.

---

## 3. Vstupní body a datový tok

### 3.1 Kde aplikace startuje

- **Web:** `next dev -p 3001` → vstupní bod je `app/layout.tsx` (root layout) a `app/page.tsx` (landing).
- **Worker:** `npm run worker:deepseek` → `tsx workers/image-process-deepseek.ts` (samostatný proces, čte z BullMQ).
- **Produkce:** `next build` + `next start`; worker musí běžet zvlášť (PM2, Docker, …).

### 3.2 Tok dat (hlavní scénáře)

**A) Upload ZIP a AI zpracování fotek**

1. Uživatel nahraje ZIP v `(dashboard)/upload` → `POST /api/upload/zip`.
2. API vytvoří `Listing`, uloží ZIP do `public/uploads/{listingId}-{filename}.zip`, přidá job do `imageProcessDeepSeekQueue` s `zipUrl: /uploads/{listingId}-{filename}.zip`.
3. Worker `image-process-deepseek` bere job, načte ZIP z `public/{zipUrl}`, rozbalí do `public/uploads/{listingId}/`, pro každý obrázek zavolá `VisionAnalyzer.analyzePhoto()` (DeepSeek), vytváří/aktualizuje `ListingMedia` (category, aiDescription, aiCaption, processingStatus).
4. Frontend může pollovat `GET /api/listings/[id]/media-status` nebo zobrazit stav v `MediaProcessingPanel`.

**B) Manuální “zpracovat média” na existujícím listingu**

1. `POST /api/listings/[id]/process-media` přidá job s **pevně nastaveným** `zipUrl: /uploads/${id}/photos.zip`.
2. Worker hledá soubor v `public/uploads/{id}/photos.zip`. Tato cesta se nikde nevytváří (upload jde do `public/uploads/{listingId}-{filename}.zip`).
3. **Důsledek:** ZIP se nenajde → worker vždy padá do `fallbackSimulation` (mock data). Bug.

**C) Synchronní “process-zip” (alternativní flow)**

1. `POST /api/process-zip` – multipart/formData, ZIP + komentář.
2. API rozbaluje ZIP, volá `analyzeImageWithDeepSeekVision` (lib/deepseek) pro každý obrázek, generuje výstupní ZIP s kategoriemi a ukládá do `ProcessedPhotos` + soubor.
3. Čistě v API, bez BullMQ; vhodné pro menší ZIPy.

### 3.3 Integrace AI

- **DeepSeek (hlavní):**
  - **Vision:** `lib/vision-analyzer.ts` – třída `VisionAnalyzer`, model `deepseek-vision`, baseURL `https://api.deepseek.com/v1`. Používá worker a může být volána z API.
  - **Text / komplexní analýza:** `lib/deepseek-vision.ts` – `DeepSeekVision`, model `deepseek-chat`, analýza fotek + generování popisů.
  - **Obecný klient:** `lib/deepseek.ts` – `deepseek` instance (OpenAI SDK), používán v `app/api/process-zip/route.ts`.
- **Konfigurace:** API klíč z `process.env.DEEPSEEK_API_KEY`. V `app/api/settings/integrations` je možné ukládat klíč do **in-memory** objektu `integrationConfig` (není perzistence do DB), což je pouze dočasné řešení.
- **Ollama / Groq / OpenAI:** V kódu ani v .env.example nejsou použity; README zmiňuje OpenAI (GPT-4o-mini) a ML service – v aktuálním flow není.

---

## 4. Kvalita kódu a code smells

### 4.1 Duplicitní kód a anti-patterny

- **Více workerů pro “image process”** – `image-process-deepseek.ts`, `image-process.ts`, `image-process-backup.ts`, `image-process-simple.ts` – částečně duplicitní logika; udržovat jeden hlavní.
- **Dva AI vision moduly** – `VisionAnalyzer` vs `DeepSeekVision` – podobná úloha (analýza fotek), jiné modely a rozhraní; sjednotit rozhraní nebo jasně oddělit účel (např. “only worker” vs “only full listing text”).
- **Fallback simulace** – v workeru je velký blok `fallbackSimulation`; při chybějícím ZIP nebo chybějícím API klíči se vždy generují mock data bez jasného oddělení “dev mock” vs “production error”.

### 4.2 Magic strings / numbers

- Kategorie médií: `'LIVING_ROOM'`, `'KITCHEN'`, … jsou rozptýlené v workeru a v `lib`; v Prisma je `ListingMedia.category` jen `String` – žádný enum. Doporučení: konstanty v jednom modulu (např. `lib/listing-media.ts`) nebo Prisma enum.
- Stavy: `'QUEUED'`, `'PROCESSING'`, `'DONE'`, `'FAILED'` – stejně jako výše, sjednotit do konstant nebo enumu.
- Cesty: `'/uploads/${id}/photos.zip'` v process-media route je magic string a navíc špatná (viz bug výše).
- Čísla: např. `limit = 10`, `take: 5` (media v listingu), `Math.min(imageEntries.length, 20)` – dát do pojmenovaných konstant (MAX_IMAGES_PER_JOB, DEFAULT_PAGE_SIZE, …).

### 4.3 Error handling a edge cases

- **API routes:** Často `catch (error)` s `NextResponse.json(..., 500)` a `error instanceof Error ? error.message : 'Unknown error'` – dobré. Na několika místech je `catch (error: any)` – lépe typovat nebo použít `unknown`.
- **Worker:** Při selhání jednoho obrázku se nastaví `processingStatus: 'FAILED'` u záznamu, ale job pokračuje; při úplném selhání (např. žádný obrázek) se volá `fallbackSimulation` – v produkci by bylo vhodné rozlišit “dočasný výpadek API” vs “špatný vstup” a nelogovat vždy mock.
- **parseInt bez validace:** V `app/api/listings/route.ts` (POST) a `app/api/upload/zip/route.ts`: `parseInt(body.price)`, `parseInt(price)` – pokud uživatel pošle nečíslo, vznikne `NaN` a Prisma může hodit nebo uložit nesmysl. Chybí kontrola `Number.isNaN()` a 400 odpověď.
- **Limit/offset:** `parseInt(searchParams.get("limit") || "10")` – při záporném nebo velmi velkém čísle není clamping; možné zneužití (např. limit=999999).

### 4.4 Best practices

- **Prisma singleton** – `lib/prisma.ts` používá `globalForPrisma` pro dev, aby nedocházelo k mnoha instancím – správně.
- **Type safety:** Řada míst používá `as any` (např. `lib/queues.ts` redis connection, `auth.ts` token.role, `lib/poski.ts` typy, upload zip `type: listingType as any`). Tam, kde je to jen kvůli typům BullMQ/ioredis, lze nechat s komentářem; u business dat (listing type) by měl být správný enum/union.
- **@ts-nocheck** – v `workers/image-process-deepseek.ts` na začátku souboru – lépe odstranit a opravit typy (getPrisma, job.data, …).

---

## 5. Bezpečnost

### 5.1 Secrets a konfigurace

- **Žádné hardcoded API klíče nebo hesla** v kódu; používá se `process.env.*`.
- **Nekonzistence secretu pro JWT:**
  - `auth.ts`: `secret: process.env.NEXTAUTH_SECRET`
  - `middleware.ts`: `getToken({ req: request, secret: process.env.AUTH_SECRET })`
  - V .env.example je pouze `NEXTAUTH_SECRET`. Pokud je v .env jen `NEXTAUTH_SECRET`, middleware dostane `undefined` a ověření JWT může selhat. **Doporučení:** v middleware používat `process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET` nebo všude sjednotit na `NEXTAUTH_SECRET`.

### 5.2 Rizikové endpointy

- **GET /api/test-env** – vrací `DATABASE_URL`, `NEXTAUTH_URL`, `NODE_ENV` a zda je nastaven `NEXTAUTH_SECRET`. **DATABASE_URL** může obsahovat heslo k DB – v produkci tento route vypnout nebo chránit a nikdy nevracet citlivé hodnoty.
- **POST /api/settings/integrations** – ukládá `deepseekApiKey` do paměti (proměnná `integrationConfig`). Po restartu se ztratí; v produkci by měl být klíč šifrovaný v DB (např. v modelu Integration nebo v User/Agent settings).

### 5.3 Vstupy od uživatele

- **Registrace:** heslo hashované bcrypt (12 rounds) – v pořádku; kontrola délky ≥ 8 znaků.
- **Listings POST:** validace povinných polí `title, address, price, type`; chybí validace rozsahů (price > 0, rozumný limit délky řetězců) a kontrola `parseInt` (NaN).
- **Upload ZIP:** kontrola přípony a velikosti souboru; není explicitní limit velikosti (max file size) – možné DoS velkým souborem.
- **Middleware:** `/api/listings` je v `publicRoutes` – tedy **GET i POST na listings jsou bez auth**. V kódu je TODO „Re-enable authentication for production“ u GET i POST – před nasazením je nutné auth znovu zapnout a z `publicRoutes` odstranit `/api/listings`.

### 5.4 Závislosti

- **npm audit:** 0 známých zranitelností (info/low/moderate/high/critical). Pravidelně spouštět `npm audit` a aktualizovat závislosti.

---

## 6. Výkon a škálovatelnost

### 6.1 Bottlenecky

- **AI volání:** Analýza každého obrázku = jedno request/response k DeepSeek. Worker má `concurrency: 2`; při velkém ZIPu (např. 20 fotek) bude běh dlouhý. Možné zlepšení: batch API (pokud DeepSeek nabídne), nebo více workerů + jedna fronta.
- **Synchronní process-zip route:** Rozbalí celý ZIP a volá DeepSeek pro každý obrázek v jednom HTTP requestu – blokuje až do konce. Pro větší soubory vhodné pouze přes frontu (upload/zip + worker).
- **Redis/Prisma:** Jedno připojení Redis (singleton) a jeden Prisma client – pro jeden Node process v pořádku; při horizontálním škálování více workerů je každý worker samostatný proces s vlastním Redis/Prisma – BullMQ to zvládá.

### 6.2 Caching

- **React Query** v providers: `staleTime: 60_000`, `gcTime: 5 * 60_000` – sníží počet refetchů na klientu.
- Na serveru není HTTP cache ani Redis cache pro API odpovědi; u převážně mutačního API to může být přijatelné. U GET listingů by šlo uvažovat krátký cache (např. revalidate) nebo Redis pro často čtené listingy.

### 6.3 Chování při zátěži

- **Fronta:** BullMQ s opakováním (attempts: 3, exponential backoff) – při přetížení Redis nebo DeepSeek se joby neztracejí, ale mohou se hromadit. Doporučení: monitoring délky fronty a případně rate limit na `POST /api/upload/zip` a `POST /api/listings/[id]/process-media`.
- **DB:** Žádné explicitní connection pooling mimo Prisma default; pro vyšší zátěž zkontrolovat pool size v `DATABASE_URL` a metriky Prisma.
- **Upload souborů:** Ukládání do `public/uploads/` na disku – při více instancích Next.js by bylo potřeba sdílené úložiště (S3/R2/Blob) a worker čte ze stejného úložiště.

---

## 7. TODO a nedokončené části

### 7.1 TODO / FIXME v kódu

| Soubor | Text | Priorita |
|--------|------|----------|
| `app/api/listings/route.ts` | TODO: Re-enable authentication for production (GET i POST) | Vysoká |
| `workers/one-click-processor.ts` | TODO: area z analýzy nebo uživatele (area: 0) | Střední |
| `lib/deepseek-vision.ts` | TODO: Implementovat perceptuální hash pro detekci duplicit | Nízká |
| `lib/deepseek-vision.ts` | TODO: AI predikce pro bestPublishingTime (nyní fixní 'Čt 10:00') | Nízká |

### 7.2 Neimplementované / placeholdery

- **Process-media route:** `zipUrl` je hardcoded `/uploads/${id}/photos.zip` – nikde se takový soubor nevytváří → v praxi vždy fallback simulace. Buď předávat skutečnou cestu k ZIPu (např. z prvního uploadu), nebo ukládat `zipUrl` při uploadu do listingu a tady ho číst.
- **API klíč integrací:** Ukládá se pouze do paměti; po restartu ztracen. Chybí perzistence (DB + šifrování).
- **test-env route:** Slouží jako debug; pro produkci odstranit nebo zabezpečit a nevracet citlivé údaje.
- **README vs realita:** README zmiňuje ML service (Python), Sentry, Vercel Analytics, Stripe – v kódu nejsou plně zapojené. Buď je doplnit, nebo README zjednodušit na aktuální stav.

---

## 8. Doporučení a roadmap

### 8.1 Top 5 priorit

1. **Auth a ochrana API**
   - Znovu zapnout session check v `GET/POST /api/listings` a vyjmout `/api/listings` z `publicRoutes` v middleware (nebo omezit public pouze na GET pro veřejný výpis, pokud je to záměr).
   - Sjednotit JWT secret: middleware používat `NEXTAUTH_SECRET` (nebo AUTH_SECRET s dokumentací).

2. **Oprava process-media a zipUrl**
   - V `POST /api/listings/[id]/process-media` nepoužívat pevnou cestu `photos.zip`. Buď:
     - ukládat při uploadu ZIPu do listingu pole `sourceZipUrl` (nebo podobně) a zde ho číst, nebo
     - vyžadovat, že “process media” je dostupný jen pokud už byl proveden upload ZIP (a předat ten samý zipUrl z uploadu do jobu).

3. **Bezpečnost a konfigurace**
   - Odstranit nebo striktně omezit GET `/api/test-env` (např. pouze v NODE_ENV=development a nevracet DATABASE_URL).
   - API klíč DeepSeek ukládat do DB (např. Integration nebo User settings), šifrovaně, a načítat v API/workeru odtud.

4. **Validace vstupů**
   - U všech `parseInt(price)`, `parseInt(area)`, `parseInt(rooms)` kontrolovat `!Number.isNaN(value)` a rozsahy (price > 0, limit/offset v rozumných mezích); v případě chyby vracet 400 s jasnou zprávou.
   - Zavedení max velikosti souboru u upload ZIP (např. 50 MB) a případně rate limit na upload a process-media.

5. **Úklid kódu a konzistence**
   - Odstranit `@ts-nocheck` z workeru a doplnit typy (getPrisma, job.data).
   - Sjednotit použití jednoho vision modulu pro worker (VisionAnalyzer) a dokumentovat rozdíl oproti DeepSeekVision (generování textů).
   - Odstranit nebo archivovat nepotřebné workers (image-process-backup, image-process-simple) a z README odstranit/upravit zmínky o ML service, pokud se nepoužívá.

### 8.2 Návrh refactoringu (stručně)

- **API vrstva:** Společná validace requestů (např. Zod schémata pro body/query) a jednotný formát chyb (např. `{ code, message, details }`).
- **Konstanty:** Jedna složka nebo soubor pro stavy médií (QUEUED, PROCESSING, DONE, FAILED), typy listingu (APARTMENT, HOUSE, LAND) a povolené kategorie médií; použít v Prisma (pokud zůstane string, aspoň v TS).
- **Worker:** Oddělit “job runner” (načtení ZIP, extrakce) od “AI step” (VisionAnalyzer) a “DB step” (update ListingMedia), aby šly snadno testovat a případně měnit provider (jiný vision API).
- **Integrations:** Model Integration v Prisma už existuje; použít ho pro ukládání DEEPSEEK_API_KEY (nebo jiných API klíčů) s šifrováním při uložení.

### 8.3 Co chybí pro produkční nasazení

- Povinná auth na všech citlivých API (listings create/update, upload, settings).
- Konzistentní JWT secret (NEXTAUTH_SECRET) v middleware a auth.
- Odstranění nebo zabezpečení `/api/test-env` a nevystavování DATABASE_URL.
- Perzistence a šifrování API klíčů (integrations).
- Oprava flow “process media” (zipUrl) aby worker skutečně zpracoval nahraný ZIP.
- Validace číselných vstupů a limity velikosti uploadů.
- Rate limiting na upload a na AI endpointy (volitelně).
- Monitoring: zdraví workeru, délka fronty BullMQ, chyby z DeepSeek; README zmiňuje Sentry – doplnit pokud má být v produkci.
- Dokumentace env proměnných (.env.example) v souladu s kódem (včetně AUTH_SECRET vs NEXTAUTH_SECRET).
- CI/CD: build + test (vitest) před deployem; případně e2e na kritické flow (registrace, upload, zpracování).

---

*Analýza byla provedena nad hlavní větví kódu (bez project-backup). Pokud používáš jiné větve nebo konfigurace, některé body může být třeba upravit.*
