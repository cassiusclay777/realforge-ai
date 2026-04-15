# Kontext projektu pro AgenticSeek

Tento soubor popisuje projekt, aby AgenticSeek věděl, o co jde, když má `WORK_DIR` nastaven na tento repozitář.

---

## Co to je

**RealForge AI** – real estate SaaS, „one-click“ engine pro realitní inzeráty. Uživatel nahraje ZIP s fotkami → AI zpracuje fotky (kategorizace, popisky, hlavní texty) → vytvoří listing. Export na Sreality (XML s `foto_popis`), Poski.

---

## Stack

- **Frontend:** Next.js 14+ (App Router), TypeScript, Tailwind, shadcn/ui
- **Backend:** Next.js API Routes, Prisma, PostgreSQL
- **Fronta:** Redis + BullMQ (joby po uploadu ZIPu)
- **Auth:** NextAuth.js
- **AI:** DeepSeek Vision (popisky fotek, analýza), volitelně Ollama; Python ML service (CLIP)
- **Worker:** Node.js (`workers/image-process-deepseek.ts`) bere joby z fronty

---

## Klíčové cesty v repu

| Účel | Cesta |
|------|--------|
| Detail listingu, galerie, Quick Actions | `app/(dashboard)/listings/[id]/` |
| Upload ZIP, vytvoření listingu | `app/(dashboard)/upload/` |
| API: captions, Sreality XML, media PATCH, export ZIP | `app/api/listings/[id]/` |
| Galerie (lightbox, badge místnosti, edit caption) | `components/MediaGallery.tsx` |
| Generování captionů (Sharp 800px, DeepSeek) | `lib/caption-generator.ts` |
| Zpracování fotek po uploadu | `workers/image-process-deepseek.ts` |
| Schéma DB | `prisma/schema.prisma` (Listing, ListingMedia: url, category, aiCaption, altText, processingStatus) |

---

## Konvence

- TypeScript strict, české UI a API zprávy
- Caption max 120 znaků
- Respektovat existující pattern (server components kde to jde, client jen kde je potřeba)

---

## Co je na projektu špatně (audit)

- **Autorizace:** API pro listinky (PATCH `/api/listings/[id]`, generate-captions, sreality-xml, PATCH media) kontrolují jen to, že je uživatel přihlášen. **Nekontroluje se `listing.createdById`** – libovolný uživatel může upravovat / exportovat cizí listinky. Oprava: před úpravou/exportem načíst listing a ověřit `listing.createdById === session.user.id` (nebo povolit jen vlastníka).
- **TypeScript `any`:** V řadě míst se používá `any` (auth.ts `(user as any).role`, lib/poski.ts `listing: any`, app/api/listings/route.ts `where: any`, workers `redis as any`, komponenty `bulletPoints: any`). Snížit použití `any`, doplnit typy.
- **Jednotné chybové hlášky:** V API je mix angličtiny a češtiny („Unauthorized“ vs „Neautorizováno“). Sjednotit na češtinu dle konvencí.
- **GET /api/test-env:** Vrací, které env proměnné jsou nastavené (a NODE_ENV). V produkci vrací 404, ale route existuje – v dokumentaci nebo kódu jasně zdůraznit, že se nemá v produkci zapínat, nebo ji odstranit.
- **README vs realita:** README zmiňuje Vercel Blob, Cloudflare R2, Sentry, Python ML service – ověřit, co je opravdu použité, a README zkrátit/aktualizovat. Migrace: preferovat `prisma migrate dev` místo jen `db push` v návodu.
- **Zbytečný kód v repu:** Složky `project-backup/`, `mini-backup/` zvyšují šum; zvážit přesun z repa nebo .gitignore. Soubor `lib/queeries.ts` ( překlep) – ověřit, jestli se používá, jinak odstranit.
- **React hooks:** V `MediaProcessingPanel.tsx` je `eslint-disable-next-line react-hooks/exhaustive-deps` – buď závislosti opravit, nebo krátce okomentovat, proč je to záměrné.

---

## Rychlý start (bez AgenticSeek)

```bash
cp .env.example .env.local
# doplnit DATABASE_URL, NEXTAUTH_SECRET, DEEPSEEK_API_KEY, REDIS_URL
docker compose up -d postgres redis
npx prisma migrate dev
npm run dev
# volitelně: npm run worker
```

---

## Prompt pro AgenticSeek (zkopíruj do chatu)

```
Přečti si AGENTICSEEK.md v tomto workspace – je to kontext projektu RealForge AI (real estate SaaS, Next.js, Prisma, DeepSeek Vision, upload ZIP → AI zpracování fotek a listingů).

Tvůj workspace je kořen tohoto repozitáře. Můžeš prohlížet a upravovat kód, navrhovat úpravy a implementovat úkoly. Respektuj stack (Next.js 14 App Router, TypeScript, Prisma) a konvence (české UI/API, caption max 120 znaků). Při úkolech nejdřív projdi relevantní soubory, pak navrhni nebo udělej změny.

Teď mi řekni, že máš kontext načtený a napiš, s čím můžu pomoct (např. nová feature, oprava, refaktor, dokumentace).
```

---

## Prompt: opravy a vylepšení (zkopíruj pro AgenticSeek)

```
Máš načtený kontext z AGENTICSEEK.md. V téže souboru je sekce „Co je na projektu špatně (audit)“ – seznam známých problémů (autorizace listinků, any, mix EN/CZ v API, test-env, README, backup složky, eslint-disable).

Postupně projdi body z toho auditu a:
1. U každého bodu nejdřív ověř v kódu, že problém opravdu existuje (ukaž konkrétní soubory/řádky).
2. Navrhni konkrétní změnu (nebo víc variant s doporučením).
3. Implementuj opravu, pokud je to jednoznačné a malé; u větších (např. autorizace u všech listing API) nejdřív udělej jeden endpoint jako vzor (např. PATCH /api/listings/[id]) a pak aplikuj stejný pattern na generate-captions, sreality-xml, media/[mediaId].

Pravidla: respektuj stack a konvence (české API, caption 120 znaků). Neměň chování pro koncové uživatele k horšímu. Testy nepiš, pokud v projektu ještě nejsou zavedené.
Začni prvním bodem (autorizace listinků) a po dokončení nebo po každém větším kroku shrň, co jsi udělal a co zbývá.
```
