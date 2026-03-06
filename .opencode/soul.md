# Soul Memory

Last updated: 2026-03-04T00:00:00.000Z

## Goals
- Dokončit klíčové business funkce REALFORGE-AI (CRM UI, reálné AI/export integrace).
- Udržovat konzistentní stav mezi analýzou projektu a kódem (update po změnách).
- Automatizovat opakovatelné kontroly (loose ends, next actions) bez blokování práce.

## Preferences
- Stručné odpovědi; bullet points; bez zbytečných vysvětlení.
- Czech nebo English podle kontextu; technické detaily jen na vyžádání.
- Reversible změny; žádné destruktivní akce bez explicitního požadavku.
- Session/sql internals zůstávají v agent logice; uživateli výsledky a ovládání.

## Current focus
- REALFORGE-AI late-alpha: **CRM hotov** (list, /crm/new, /crm/[id], API CRUD). **AI a Sreality reálné**: /api/ai/process používá DeepSeek + analýzy z ListingMedia; Sreality handler volá callSrealityApi. Worker bez @ts-nocheck (image-process-deepseek).

## Loose ends
- Poski DataMapper: `getBase64FromUrl()` / async verze – ověřit v produkci, že baseUrl (NEXTAUTH_URL/VERCEL_URL) je nastaven a fotky jdou jako base64.
- Technické: `/api/test-env` zabezpečit nebo odstranit v produkci (aktuálně vrací 404 v produkci).
- OpenCode DB: `.opencode/opencode.db` existuje ale bez tabulek → `db_schema_unknown`; session/todo tracking až engine vytvoří schéma.

## Recurring chores / automations to consider
- Pravidelný check-in: porovnat KOMPLETNI_ANALYZA_PROJEKTU.md s aktuálním stavem kódu a navrhnout úpravy sekce „Update“.
- Kontrola otevřených todo / nedokončených vláken z posledních session (když je k dispozici sqlite).
- Revize improvement návrhů z heartbeatů a rozhodnout, které zapsat do skills nebo agentů.

## Soul heartbeat process (for agent)
- Job soul-heartbeat se **nevytváří** úpravou opencode.json. OpenCode scheduler ukládá joby do `~/.config/opencode/scheduler/` a vytváří je jen přes NL v OpenCode. Uživatel musí v OpenCode říct větu z `.opencode/soul/SCHEDULER.md`. Více: `.opencode/soul/heartbeat-process.md`.
