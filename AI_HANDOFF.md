# Realforge AI – Handoff pro AI asistenty

> Dokument pro DeepSeek, GPT nebo jiné AI – popis projektu, co bylo uděláno a jak pokračovat.

---

## Co je Realforge AI

Webová aplikace pro české realitní makléře. Makléř nahraje ZIP s fotkami nemovitosti, AI automaticky:
- Kategorizuje fotky (obývák, kuchyň, koupelna, exteriér…)
- Vygeneruje popis nemovitosti, headline, SEO titulek, bullet points, Instagram caption, FB post
- Navrhne cenu nemovitosti na základě AI analýzy
- Připraví podklady pro export na realitní portály (Sreality, Poski.com)

Součástí je také CRM pro správu zájemců (leads), analytika, a správa inzerátů.

---

## Technický stack

| Vrstva | Technologie |
|--------|-------------|
| Framework | Next.js 15 (App Router), TypeScript |
| UI | Tailwind CSS v4, shadcn/ui (Radix UI), Lucide icons |
| Stav | Zustand, TanStack Query |
| Auth | NextAuth v4 (credentials provider) |
| DB | PostgreSQL + Prisma ORM |
| AI | DeepSeek API (primárně), OpenAI kompatibilní endpoint |
| Queue | BullMQ + Redis (pro worker zpracování obrázků) |
| Animace | Framer Motion |
| Grafy | Recharts |
| Dev server | port **3001** (`npm run dev`) |

---

## Struktura projektu

```
/app
  /(auth)          – login, register stránky
  /(dashboard)     – hlavní aplikace po přihlášení
    /dashboard     – přehled, statistiky, CRM chat, grafy
    /listings      – seznam inzerátů (grid karet)
    /listings/[id] – detail inzerátu s AI výsledky
    /listings/[id]/edit – editace
    /upload        – nahrání ZIP s fotkami
    /media         – správa médií
    /crm           – CRM leads tabulka
    /crm/[id]      – detail leadu
    /automations   – automatizace (WIP)
    /integrations  – napojení portálů (WIP)
    /settings      – profil, billing, security, integrace
  /analytics       – analytika
  /preview/[id]    – veřejný náhled inzerátu

/components
  DashboardLayout.tsx   – sidebar + header layout (klíčový)
  /dashboard/           – stats-cards, charts, crm-chat, analytics-section
  /ui/                  – shadcn komponenty (button, card, badge, input…)

/workers
  image-process-deepseek.ts  – BullMQ worker, zpracovává fotky přes DeepSeek API

/lib
  prisma.ts      – Prisma client singleton
  utils.ts       – cn() helper a další utility

/prisma
  schema.prisma  – datový model (viz níže)
```

---

## Datový model (zkráceně)

- **User** – makléř, má role (AGENT/ADMIN)
- **Listing** – nemovitost (title, address, type, price, area, rooms, status)
- **ListingMedia** – fotky nemovitosti (url, category, aiDescription, processingStatus…)
- **AIResult** – výsledky AI pro listing (headline, shortDesc, longDesc, bulletPoints, seoTitle, seoDescription, instagramCaption, fbPost, priceSuggestion)
- **CRMLead** – zájemce (name, email, phone, status, budget)
- **Deal** – obchod spojený s leadem a listingem
- **Integration** – API klíče pro portály (Sreality, Poski)
- **ExportJob** – úlohy exportu na portály

Stavy listingu: `NEW → PROCESSING → PROCESSED → ACTIVE → REZERVACE → PRODANO`

---

## Co bylo naposledy uděláno (aktuální branch: `claude/improve-ui-design-LzXMF`)

### Commit `a100c7d` – UI dark theme fix

**Problém:** Aplikace používá tmavé téma (dark) jako výchozí, ale v kódu bylo mnoho hardcoded světlých Tailwind barev (`bg-blue-50`, `bg-green-100`, `text-blue-700` atd.) které na tmavém pozadí vypadaly špatně.

**Co bylo opraveno:**

1. **`app/(dashboard)/dashboard/page.tsx`**
   - Quick action ikony: `bg-blue-100 text-blue-700` → `bg-blue-500/15 text-blue-400` (dark-safe)
   - AI Price Optimizer karty: `bg-blue-50`/`bg-green-50` → `bg-blue-500/10 border border-blue-500/20`
   - Badge "3 nové zprávy": `bg-green-50 text-green-700` → `bg-primary/10 text-primary`
   - Badge "AI ✓": `bg-green-50 text-green-700` → `bg-primary/10 text-primary`
   - Search input: přepsán se správnými dark-mode třídami (`bg-card`, `border-border`, focus ring)
   - Odstraněn nefunkční dark mode toggle blok

2. **`app/(dashboard)/listings/page.tsx`**
   - Badge "Hotovo": → `bg-primary/10 text-primary border-primary/30`
   - Badge "Spustit →": → `bg-amber-500/10 text-amber-400 border-amber-500/30`

3. **`components/DashboardLayout.tsx`**
   - Sidebar navigační labely přeloženy do češtiny:
     - Dashboard → Přehled, Listings → Inzeráty, Media → Média, Analytics → Analytika
     - Automations → Automatizace, Integrations → Integrace, Settings → Nastavení
   - Logo: jemnější shadow a menší ikona
   - Sidebar: `bg-card/50` → `bg-card/80 backdrop-blur-sm`

4. **`app/globals.css`**
   - Přidán `-webkit-font-smoothing: antialiased`
   - Custom scrollbar (tenký, dark-mode friendly)
   - `:focus-visible` outline s theme tokeny

---

## Pravidla pro dark theme (DŮLEŽITÉ)

Aplikace je **vždy tmavá** – `:root` v `globals.css` definuje tmavé CSS proměnné.

**Nikdy nepoužívej:**
- `bg-blue-50`, `bg-green-50`, `bg-gray-100` (světlé backgrounds)
- `text-blue-700`, `text-green-800` (tmavý text určený pro světlé bg)
- `bg-blue-100 text-blue-700` kombinace

**Vždy používej místo toho:**
- `bg-primary/10`, `bg-blue-500/15`, `bg-amber-500/10` (opacity varianty)
- `text-primary`, `text-blue-400`, `text-amber-400` (světlé barvy pro tmavé bg)
- `border-primary/30`, `border-blue-500/20` (průhledné bordery)
- CSS proměnné: `bg-card`, `bg-background`, `text-foreground`, `text-muted-foreground`

**CSS proměnné (z globals.css):**
```
--background: 222 47% 11%      (tmavá navy)
--foreground: 210 40% 98%      (téměř bílá)
--card: 222 47% 14%            (lehce světlejší navy)
--primary: 160 84% 39%         (zelená)
--muted-foreground: 215 20% 65% (šedá)
--border: 217 33% 22%          (tmavý border)
```

---

## Jak spustit projekt

```bash
# 1. Instalace
npm install

# 2. Nastav env (zkopíruj .env.example → .env a vyplň)
cp .env.example .env

# 3. Spusť databázi (PostgreSQL + Redis přes Docker)
docker-compose up -d

# 4. Migrace DB
npx prisma migrate dev

# 5. Spusť dev server (port 3001)
npm run dev

# Nebo jen Next.js bez workeru (bez Redisu):
npm run dev:next
```

**Bez Dockeru:** `npm run dev:next` – spustí jen Next.js, worker pro obrázky bude offline (ale zbytek aplikace funguje).

---

## Co je hotové vs. WIP

| Feature | Stav |
|---------|------|
| Auth (login/register) | ✅ funkční |
| Upload ZIP + zpracování fotek | ✅ funkční |
| AI generování textu (DeepSeek) | ✅ funkční |
| Detail inzerátu | ✅ funkční |
| Editace inzerátu | ✅ funkční |
| Přehled listingů | ✅ funkční |
| Dashboard (statistiky, grafy) | ✅ UI hotové, data z DB |
| CRM – leads tabulka | ✅ funkční |
| CRM – detail leadu | ✅ funkční |
| Media management stránka | ✅ básic |
| Dark theme – barvy | ✅ opraveno (poslední commit) |
| Sidebar – česky | ✅ opraveno (poslední commit) |
| Automations | ⚠️ UI shell, logika chybí |
| Integrations (Sreality export) | ⚠️ UI shell, API WIP |
| Analytics stránka | ⚠️ základní UI |
| AI Price Optimizer (real data) | ⚠️ zatím demo data |
| Billing / platební brána | ⚠️ UI shell |

---

## Kde jsou ještě problémy (UI dark theme)

Opraveny byly jen hlavní stránky. Tyto stránky ještě **nebyly zkontrolovány** na světlé barvy:

- `app/(dashboard)/crm/page.tsx` a `crm/[id]/page.tsx`
- `app/(dashboard)/settings/*.tsx`
- `app/(dashboard)/automations/page.tsx`
- `app/(dashboard)/integrations/page.tsx`
- `app/(dashboard)/listings/[id]/page.tsx` (detail)
- `components/AISummaryCard.tsx`, `NextStepsCard.tsx`, `MediaProcessingPanel.tsx`

Postup: v každém souboru hledat `bg-*-50`, `bg-*-100`, `text-*-700`, `text-*-800` a nahrazovat opacity variantami.

---

## API endpointy

```
POST /api/upload           – nahrání ZIP souboru
GET  /api/listings         – seznam listingů
GET  /api/listings/[id]    – detail listingu
PUT  /api/listings/[id]    – update listingu
POST /api/listings/[id]/ai – spustit AI generování
GET  /api/media/[id]       – média listingu
POST /api/crm/leads        – vytvořit lead
GET  /api/crm/leads        – seznam leadů
```

---

## Důležité soubory

| Soubor | Účel |
|--------|------|
| `auth.ts` | NextAuth konfigurace |
| `middleware.ts` | Route ochrana (redirect na /login) |
| `lib/prisma.ts` | Prisma singleton |
| `app/globals.css` | Globální CSS, CSS proměnné pro téma |
| `components/DashboardLayout.tsx` | Hlavní layout s sidebar+header |
| `workers/image-process-deepseek.ts` | BullMQ worker pro AI zpracování fotek |
| `CLAUDE.md` | Instrukce pro Claude Code |

---

## Git workflow

- Hlavní branch: `main`
- Feature branch: `claude/improve-ui-design-LzXMF` (aktuálně otevřený PR #3)
- Po každé změně: `git add`, `git commit`, `git push -u origin <branch>`
- PR jsou vytvářeny jako draft na GitHubu (repo: `cassiusclay777/realforge-ai`)

---

## Doporučený další postup

1. **Dokončit dark theme fix** – projet zbývající stránky a komponenty (viz seznam výše)
2. **Otestovat AI pipeline** – ověřit, že upload ZIP → DeepSeek → výsledek funguje end-to-end
3. **CRM vylepšení** – přidat filtrování a řazení leadů
4. **Export na portály** – dokončit Sreality/Poski.com integraci
5. **Automations** – implementovat logiku automatického odesílání inzerátů
