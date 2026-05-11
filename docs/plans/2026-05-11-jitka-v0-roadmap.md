# 🌅 Patrikův morning briefing — Jitka v0 roadmap

> **Datum poslední aktualizace:** 2026-05-11 (večer)
> **Status:** Setup hotový, kódíme první feature (background)
> **Cíl tohoto dokumentu:** Když se ráno vzbudíš, máš kde pokračovat a víš co napsat Claudovi.

---

## 🎯 Vize v jedné větě

**RealForge je AI co-pilot pro nezávislé realitní makléře — vyrábí krásné listing stránky, marketingový kit a tržní data, takže makléř (jako mamka Jitka) může přestat platit franšízu a publikovat všechno na vlastní doméně za 3 minuty místo 60.**

Žádné Sreality publish, žádné ProRadost smlouvy. Makléř vlastní brand, klienta i URL. RealForge je jen továrna co plní tu výlohu.

---

## 🗺️ Architektura — jak na sebe projekty navazují

```
┌──────────────────────────┐         ┌─────────────────────────────┐
│   REALFORGE-AI           │         │  JITKA-JEDLICKOVA-REALITY   │
│   (backend factory)      │         │  (krásný public frontend)   │
│   :3001 dev              │         │  :4180 dev                  │
├──────────────────────────┤         ├─────────────────────────────┤
│ Patrik admin dashboard   │         │ Veřejnost (zákazníci)       │
│ • Upload fotek           │  data   │ • Listing detail stránky    │
│ • Auto-fill z adresy 🆕  │  flow   │ • Galerie, mapa, kontakt    │
│ • AI vision + DeepSeek   │ ──────▶ │ • SEO, Open Graph           │
│ • CRM (leads)            │         │                             │
│ • Distribuční kit        │ ◀────── │ Kontaktní formulář → lead   │
└──────────────────────────┘  leads  └─────────────────────────────┘
```

**Bridge je BUDOUCÍ úkol** — zatím oba běží nezávisle. Propojení přes API endpoint `/api/public/agents/jitka-jedlickova/listings` přijde po dokončení auto-fill featury.

---

## ✅ Co je hotové (k 2026-05-11)

### Předchozí commity (před dnešní session)
- ✅ Bezpečnostní fixy (commit `bece0a6`): odstraněn `/api/test-env`, povolena auth na `/api/listings`, `/api/listings/[id]`
- ✅ Šifrování API klíčů v DB (`lib/encryption.ts`, `lib/integration-utils.ts`)
- ✅ Real DeepSeek AI generování textů v `/api/ai/process` (žádný mock)
- ✅ Sreality + Poski export handlery v `services/export/handlers/` (production-ready, ale REJECTED z product strategie — viz níže)
- ✅ Jitka site projekt (`jitka_jedlickova_reality_2026`): krásný Next 15 + Tailwind v4 + Framer Motion + PhotoSwipe + Leaflet, 8 inzerátů, hero "Domov, kde vyrůstají vzpomínky"

### Dnešní session
- ✅ **Strategický pivot**: opustili jsme Sreality/Poski publish flow — nedává smysl pro globální produkt + Jitka to nepotřebuje (klienti volají sami)
- ✅ **MVP "Jitka v0" definováno** — viz roadmapa níže
- ✅ Aktualizován `.env.example` a `.env.local` o property enrichment env vars (Google Maps, Apify, Mapy.cz, ČÚZK)
- ✅ **Google Cloud setup** (přes Claude in Chrome MCP):
  - 4 APIs zapnuté: Geocoding, Maps Static, Street View Static, Places API (New)
  - Vytvořen API klíč `RealForge - Property Enrichment` restriktovaný jen na ty 4 APIs
  - Klíč vlepen do `.env.local` jako `GOOGLE_MAPS_API_KEY`
- ✅ Commit `d478a89 feat: wire Sreality + Poski publish handlers to UI buttons` na větvi `feat/publish-buttons` (NEMÉRGOVAT — strategicky odmítnuto)

### V tuto chvíli běží na pozadí
- ✅ **Subagent dokončil `lib/property-enrichment/` modul** (commit `6bb1721` na větvi `feat/property-enrichment`)
  - 7 source files: `types.ts`, `google-client.ts`, `geocode.ts`, `static-map.ts`, `street-view.ts`, `nearby.ts`, `index.ts`
  - 3 test files: 13/13 testů prošlo (žádná real Google volání)
  - TypeScript clean
  - Orchestrator `enrichFromAddress(address)` — geocode hard-fails, ostatní fail-soft přes Promise.allSettled
  - **Ještě NETESTOVÁNO s reálnými Google API** — to udělej zítra jako první (viz níže)

---

## 🎯 MVP "Jitka v0" — celá roadmapa (~11 dní práce)

| # | Feature | Stav | Dny | Priorita |
|---|---|---|---|---|
| **0** | **Address → Auto-fill** (Google Maps + Places + RUIAN později) | 🟡 In progress | 3 | 🔴 |
| 1 | API endpoint `/api/enrichment/from-address` (volá modul z #0) | ⏳ Next | 0.5 | 🔴 |
| 2 | UI v dashboardu — input pole "Adresa" → loading → preview enriched dat | ⏳ Next | 1 | 🔴 |
| 3 | Bridge: realforge → jitka site `/api/public/agents/jitka-jedlickova/listings` | ⏳ | 1 | 🔴 |
| 4 | Jitka site refactor: `lib/properties-data.ts` z hardcoded → fetch + ISR | ⏳ | 1 | 🔴 |
| 5 | Migrace 8 stávajících inzerátů z Jitčina webu do realforge DB | ⏳ | 1 | 🟡 |
| 6 | Lead capture: jitka site kontakt form → realforge `/api/public/leads` → CRM | ⏳ | 1 | 🟡 |
| 7 | Distribuční kit: AI generuje FB post, IG carousel, WhatsApp, PDF prospekt | ⏳ | 2 | 🟢 |
| 8 | Dashboard polish: vidět všech 8 inzerátů, kliknout edit, jednoduchý workflow | ⏳ | 1 | 🟢 |
| 9 | RUIAN integrace (free, parcela info) — vrstva navíc do enrichmentu | ⏳ | 0.5 | 🟢 |
| 10 | Apify scraper (tržní data — porovnatelné inzeráty pro priceSuggestion) | ⏳ | 1 | 🟢 |

**Po MVP**: ukázat Jitce, změřit „kolik času ušetří vs Poski", domluvit se zda chce přejít.

---

## 🌅 Jak začít zítra ráno (literal copy-paste prompty)

### 🟢 Doporučený první krok ráno (smoke test enrichmentu):
> **„Jsme na větvi `feat/property-enrichment` (commit `6bb1721`). Spusť smoke test enrichmentu na reálné adrese 'Pražská 12, Znojmo' přes lib/property-enrichment/index.ts a ukaž mi co vrátil. Pokud Google APIs zafungovaly, pokračujme úkolem #1 z roadmapy — endpoint `/api/enrichment/from-address`."**

### Pokud chceš rovnou stavět endpoint (přeskočit smoke test):
> **„Spusť subagent na úkol #1 z roadmapy: postav `app/api/enrichment/from-address/route.ts` který volá enrichFromAddress() z lib/property-enrichment/. POST endpoint, auth required, ratelimit. Vrať EnrichmentResult."**

### Pokud chceš začít úplně jinou featurou:
> **„Otevři roadmapu v `realforge-ai/docs/plans/2026-05-11-jitka-v0-roadmap.md` a pojďme dělat úkol #X."** (kde X = číslo z tabulky výše)

### Pokud chceš jen popovídat o produktu:
> **„Načti roadmapu v `realforge-ai/docs/plans/2026-05-11-jitka-v0-roadmap.md` a popovídejme si o tom co máš na vizi."**

---

## 🔑 Klíčové soubory & příkazy

### realforge-ai
```bash
# Lokace
C:\Users\Patri\Documents\GitHub\realforge-ai

# Spustit Postgres + Redis (Docker Desktop musí běžet)
docker compose up -d postgres redis

# Spustit dev (Next.js + DeepSeek worker concurrently)
npm run dev          # bez Dockeru
npm run dev:full     # s Dockerem

# Aplikovat Prisma schema na DB
npx prisma db push

# Testy
npm test
```

### jitka_jedlickova_reality_2026
```bash
# Lokace
C:\Users\Patri\Documents\GitHub\jitka_jedlickova_reality_2026

# Dev server
npm run dev          # běží na http://localhost:4180
```

### Klíčové soubory pro orientaci
- `realforge-ai/.env.local` — všechny API klíče
- `realforge-ai/prisma/schema.prisma` — DB schéma (Listing, ListingMedia, AIResult, CRMLead, Integration, Agent, User)
- `realforge-ai/lib/deepseek.ts` — AI client (vzor pro nové klienty)
- `realforge-ai/lib/integration-utils.ts` — DB-stored API key loading
- `realforge-ai/lib/property-enrichment/` — 🆕 dnes stavíme
- `realforge-ai/components/ListingQuickActions.tsx` — UI tlačítka u listingu (Generate AI, Publish — DEPRECATED, smazat až bude čas)
- `realforge-ai/services/export/handlers/sreality.ts` — DEAD CODE (rejected strategy), dlouhodobě smazat
- `realforge-ai/services/export/handlers/poski.ts` — DEAD CODE, dlouhodobě smazat
- `jitka_jedlickova_reality_2026/lib/properties-data.ts` — central source of inzerátů (refactor v úkolu #4)
- `jitka_jedlickova_reality_2026/PROJECT.md` — projekt context

---

## 🔐 Bezpečnost & API klíče

| Klíč | Kde uložen | Restrictions | Měsíční náklady (8 inzerátů) |
|---|---|---|---|
| `GOOGLE_MAPS_API_KEY` | `.env.local` (server only) | Restricted to 4 APIs (Geocoding, Static Maps, Street View, Places New) | ~$0.40 = 8 Kč (free tier $200/měs to absolutně pokrývá) |
| `DEEPSEEK_API_KEY` | `.env.local` + DB encrypted | Žádná | Pay-as-you-go, cca pár Kč/měsíc |
| `APIFY_API_TOKEN` | `.env.local` (zatím prázdný) | Žádná | Až bude úkol #10 |
| `ENCRYPTION_KEY` | `.env.local` | — | — |
| `NEXTAUTH_SECRET` | `.env.local` | — | — |

**⚠️ K produkci nezapomeň:**
1. Google Maps klíč → přidat HTTP referrer restrictions (`*.realforge.ai/*`, `*.jedlickova.cz/*`)
2. Vygenerovat nový `NEXTAUTH_SECRET` pro produkci
3. Backup `.env.local` mimo repo (1Password / Bitwarden)

---

## 👤 O Jitce (design partner & first customer)

- **15 let na trhu** (od 2012), region Znojmo + Moravský Krumlov
- **Vlastní brand** `jitkajedlickova.cz` (původní statický web) + `localhost:4180` (Patrikem postavený, krásnější)
- **Aktuálně platí Reality ProRadost** franšízu — to chceme nahradit
- **8 aktivních inzerátů** v různých cenových kategoriích (390k garáž → 11.4M dům)
- **Tagline**: "Svoji práci dělám srdcem"
- **5 testimonialů od klientů** = killer social proof
- **Killer pain point**: musí ručně vyplňovat všechno do Poski systému (30-60 min/inzerát) — TO NÁM NABÍZÍ HODNOTU

**Otázky které je dobré jí položit (až bude čas):**
1. Kolik měsíčně platí ProRadost?
2. Kolik leadů dostává — z webu, ze Sreality, z doporučení?
3. Co ji na Poski workflow nejvíc štve? (= naše first feature priority)

---

## 🚧 Co dnes BYLO ZAMÍTNUTO (a proč to nezasekávat znovu)

- ❌ **Sreality/Poski publish handlery** — backend hotový, UI tlačítka přidaná, ale **strategicky nepotřebné**. Jitka klienty má z vlastního webu + doporučení. Globální platformy = smlouvy, partnerství, contracts. Jdeme jiným směrem (vlastní distribuce přes makléřův osobní brand).
- ❌ **Apify Sreality scraper jako publish API** — Patrik se zeptal, vyjasněno: Apify je SCRAPER (čte data), nemůže nahradit Sreality publish API (zapisuje data). Použijeme později jen pro market intelligence (úkol #10).
- ❌ **Vlastní marketplace na realforge.ai** — neudělitelné, 0 návštěvnosti vs Sreality 2M/měs. Místo toho posilujeme makléřův web.
- ❌ **Direct-to-owner platforma** (majitel sám prodává) — zajímavé pro budoucnost ale teď scope creep. Zaostřeno na agenty.

---

## 💡 Otevřené otázky / decisions to make

1. **Custom doména pro Jitku**: zatím listingy na `jitkajedlickova.cz` (její existující). Až MVP poběží, chceme:
   - (a) integrovat realforge listingy přímo do `jitkajedlickova.cz` (cross-origin fetch)
   - (b) udělat subdoménu `nemovitosti.jitkajedlickova.cz` cname na náš server
   - (c) nový `localhost:4180` site se stane jejím novým hlavním webem
   
   *Doporučení: (c) — má to lepší design.*

2. **Jitčin email**: pořád `jedlickova@reality-proradost.cz` v kontaktu nového webu. Až přejde, změnit na `info@jitkajedlickova.cz` nebo podobné.

3. **Realforge multi-tenant**: zatím buduje pro Jednu Jitku. Když to půjde, jaký je další makléř? Druhý zákazník = určuje pricing model.

4. **Pricing**: kolik si RealForge bude účtovat? (po MVP, až bude porovnání s ProRadost cenou)

---

## 📊 Roadmap visualization

```
  Today                      +1 týden                   +2 týdny                +3 týdny
    │                            │                          │                       │
    ├─ ✅ Setup done             │                          │                       │
    ├─ 🟡 Enrichment modul       │                          │                       │
    │                            │                          │                       │
    │   ├─ ⏳ /api/enrichment    │                          │                       │
    │   ├─ ⏳ Auto-fill UI       │                          │                       │
    │   │                        │                          │                       │
    │   │                        ├─ ⏳ Bridge realforge↔jitka                       │
    │   │                        ├─ ⏳ Migrace 8 inzerátů  │                       │
    │   │                        ├─ ⏳ Lead capture        │                       │
    │   │                        │                          │                       │
    │   │                        │                          ├─ ⏳ Distribuční kit  │
    │   │                        │                          ├─ ⏳ Dashboard polish │
    │   │                        │                          │                       │
    │                            │                          │                       ├─ 🎉 v0 launch
    │                            │                          │                       ├─ → Show Jitce
    └────────────────────────────┴──────────────────────────┴───────────────────────┴─ → Domluvit přechod
```

---

## 🛠️ Workflow tips pro Patrika (přechod z Cursor)

### Co Claude Code dělá líp než Cursor:
- **Subagenty** — paralelně několik úkolů, žádné context pollution. Workflow `subagent-driven-development` ze superpowers pluginu.
- **Browser ovládání** — Claude in Chrome MCP, jak jsi viděl s Google Cloud Console.
- **Auto-memory** — ukládá si fakta o tobě (`~/.claude/memory/`)
- **Plánování v plan mode** (Shift+Tab pro toggle) — než začne kódit, naplánuje
- **Slash skills** — `/init`, `/review`, `/security-review`, `/loop`, `/schedule`

### Co Cursor dělá líp:
- **Inline auto-complete** — Claude Code je terminálový, ne IDE
- **File tabs** — vidíš který soubor je otevřený
- **Vizuální diff** — Claude Code ukazuje text diff

### Doporučení pro tebe:
1. **VS Code + Claude Code terminálu vedle sebe** — kódí Claude, ty vidíš výsledky live ve VS Code
2. **Pro velké rozhodnutí: plan mode** (Shift+Tab) — nech ho udělat plán, schvalíš, pak teprve kódí
3. **Šetři kontext**: pro průzkumy používej `Explore` subagent místo přímého grepu
4. **TodoWrite** je tvůj přítel — vidíš co Claude dělá

---

## 🌟 Tvoje role (Patrik) vs Claude

| Co děláš ty | Co dělám já |
|---|---|
| Vize produktu | Architektura kódu |
| Decisions s mamkou | Implementace featur |
| Domain expertise (reality v ČR) | TypeScript, Next.js, API integrace |
| Brand a UX vibe | Testing, type safety, security |
| Final yes/no | Návrhy, alternativy, trade-offs |
| Ráno otevřeš tenhle dokument | Připomenu ti kde jsme |

---

**Konec briefingu. Teď spi, ráno frčíme dál. 💪🚀**
