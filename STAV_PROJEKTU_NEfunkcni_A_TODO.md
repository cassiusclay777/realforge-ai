# REALFORGE-AI – Co je nefunkční / nedokončené

Stručný přehled na základě analýzy kódu a existujících ANALYZA_PROJEKTU.md / KRITICKE_PROBLEMY_A_OPRAVY.md.

---

## 1. Nefunkční nebo jen částečně funkční

### 1.1 Auth na API listingu (vypnutá)

- **Kde:** `app/api/listings/route.ts` – GET i POST mají zakomentovaný `getServerSession` (TODO: Re-enable authentication for production).
- **Dopad:** Kdokoli může bez přihlášení číst listingy (GET) a vytvářet nové (POST). V produkci riziko.
- **Middleware:** `/api/listings` je v `publicRoutes` → žádná redirect na login.

**Chybějící krok:** Odkomentovat session check v GET/POST a vyjmout `/api/listings` z `publicRoutes` (nebo nechat public jen GET, pokud je záměr).

---

### 1.2 API klíč DeepSeek z UI se workeru nedostane

- **Kde:** Settings → Integrace → uložení DeepSeek API klíče.
- **Jak to je:** Klíč se ukládá do **paměti** (`integrationConfig` v `app/api/settings/integrations/route.ts`). Po restartu Next.js je pryč.
- **Worker:** Čte jen `process.env.DEEPSEEK_API_KEY`. Klíč z UI tedy worker **nepoužívá** – při chybějícím env klíči vždy fallback na simulaci (mock data).
- **Dopad:** Uživatel nemůže „zadat klíč v aplikaci“ a mít AI zpracování; musí mít `DEEPSEEK_API_KEY` v `.env` a restartovat i worker.

**Chybějící krok:** Ukládat klíč do DB (např. Integration / User settings), šifrovaně, a buď:
- worker načítá z DB (nebo z interního API), nebo
- při uložení klíče v UI zapisovat do souboru / env pouze pro dev, v produkci nutná DB + sdílení s workerem.

---

### 1.3 POST /api/ai/process – jen mock

- **Kde:** `app/api/ai/process/route.ts`.
- **Jak to je:** `processWithAI()` je mock – 2 s delay, vrací pevné texty (title, description, instagramPost, …). Žádné volání DeepSeek / OpenAI.
- **Dopad:** „AI zpracování“ z tohoto endpointu negeneruje reálné texty podle fotek/metadat.

**Chybějící krok:** Napojit na `lib/deepseek-vision.ts` nebo DeepSeek API (obrázky + metadata → popisy, SEO, sociální příspěvky).

---

### 1.4 Export na Sreality – jen simulace

- **Kde:** `services/export/handlers/sreality.ts`.
- **Jak to je:** Žádné volání Sreality API. Vrací se `mockResponse` s fiktivní URL a „Listing published successfully“. ExportJob v DB se nezakládá (model v Prisma chybí / není použit).
- **Dopad:** Tlačítko „Export na Sreality“ nevytvoří inzerát na sreality.cz.

**Chybějící krok:** Integrace s reálným Sreality API (auth, payload, error handling) + případně model ExportJob a ukládání stavu exportu.

---

### 1.5 Poski / DataMapper – Base64 z URL neimplementováno

- **Kde:** `lib/poski-real/DataMapper.ts` – `getBase64FromUrl()`.
- **Jak to je:** Jen `console.warn('Base64 conversion not implemented for URL:', url)` a vrací `'BASE64_PLACEHOLDER'`.
- **Dopad:** Export do Poski, který potřebuje obrázky jako base64, nebude mít reálná data obrázků.

**Chybějící krok:** Implementace: fetch URL → buffer → base64 (s kontrolou velikosti a timeoutem).

---

### 1.6 Worker bez Redis

- **Kde:** `workers/image-process-deepseek.ts`, BullMQ.
- **Jak to je:** Bez běžícího Redisu worker po krátkém snažení skončí (úpravy už jsou – jedna hláška, exit). Next.js ale běží dál.
- **Dopad:** Upload ZIP přes „upload + fronta“ nezpracuje fotky na pozadí; joby se neprovedou. Funkční je jen synchronní flow (např. process-zip bez fronty, pokud je k dispozici DeepSeek).

**Chybějící krok:** Pro plný flow spouštět Redis (`docker-compose up -d redis`) a pak `npm run dev` (Next + worker).

---

## 2. Chtěli jsme implementovat a nejde / je nedotažené

| Co | Stav | Kde / poznámka |
|----|------|----------------|
| **Auth na listings API** | Vypnuté (TODO) | GET/POST bez session; public route |
| **API klíč z UI pro AI** | Jen v paměti, worker nevidí | Settings → Integrace; worker čte jen env |
| **Skutečné AI texty (popisy, SEO, sociální)** | Mock v `/api/ai/process` | Žádné volání vision/LLM |
| **Export na Sreality** | Mock odpověď | Žádné volání API, žádný ExportJob |
| **Process media bez předchozího uploadu** | Není možný (záměr) | process-media bere `listing.sourceZipUrl` – bez uploadu 400 „Upload a ZIP file first“ (správné chování) |
| **Perzistence API klíčů** | Ne | integrationConfig v RAM |
| **Detekce duplicit fotek (perceptuální hash)** | TODO v kódu | `lib/deepseek-vision.ts` |
| **AI predikce času publikace** | Fixní hodnota | `bestPublishingTime: 'Čt 10:00'`, TODO na AI predikci |
| **Area v one-click-processor** | TODO | `area: 0` – mělo by přijít z analýzy nebo uživatele |
| **test-env v produkci** | 404 v produkci | Stále vrací [SET]/[NOT SET] pro DB/secret – v dev OK, v prod vypnuto |

---

## 3. Co už funguje (pro přehled)

- NextAuth (login, registrace, Google), middleware (RBAC), session.
- Upload ZIP přes `/api/upload/zip` → vytvoření listingu, uložení `sourceZipUrl`, přidání jobu do BullMQ.
- Process-media: pokud listing má `sourceZipUrl` (po uploadu), job jde do fronty; worker při běžícím Redisu + `DEEPSEEK_API_KEY` zpracuje fotky přes VisionAnalyzer.
- Synchronní process-zip (`/api/process-zip`): rozbalí ZIP, DeepSeek vision na každý obrázek, kategorie + popisky, výstupní ZIP s `popisek.txt` po složkách.
- GET/POST listings s validací čísel (clampLimit, parsePositiveInt, …), process-media vrací 400 bez zipUrl.
- Redis: při nedostupnosti worker tiše skončí (jedna hláška), bez spamu.

---

## 4. Doporučené pořadí úprav

1. **Auth:** Zapnout session u listings API a upravit public routes (nebo zdokumentovat, proč má zůstat GET bez auth).
2. **DeepSeek klíč:** Buď dokumentovat „pouze .env a restart“, nebo implementovat ukládání do DB a předávání workeru (nebo internímu API).
3. **/api/ai/process:** Propojit s reálným DeepSeek/deepseek-vision místo mocku.
4. **Sreality export:** Buď označit v UI jako „připravujeme“, nebo začít s reálnou API integrací.
5. **DataMapper base64:** Implementovat pro export do Poski, kde se obrázky posílají jako base64.

Pokud chceš, můžeme další krok rozepsat konkrétně (např. diff pro auth, nebo schéma tabulky pro API klíče).
