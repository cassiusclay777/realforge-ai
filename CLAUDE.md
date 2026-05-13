# Realforge AI – instrukce pro Claude

## Po každé větší změně nebo opravě

1. **Zkontroluj balíčky** – spusť `npm install` (nebo `npm ci`), pokud jsou nové nebo chybějící závislosti.
2. **Spusť dev server** – `npm run dev` na pozadí a počkej na "Ready" zprávu.
3. **Zjisti IP a port** – vypiš přesnou adresu ve formátu `http://localhost:PORT` (nebo LAN IP pokud je relevantní).
4. **Ověř vizuálně** – pokud lze, otevři stránku a zkontroluj, že UI vypadá správně bez chyb v konzoli.
5. **Navrhni další krok** – vždy ukonči zprávu konkrétním doporučením co řešit dál.

## Obecné zásady pro tento projekt

- Projekt je Next.js 14 app router, TypeScript, Tailwind CSS, shadcn/ui, Prisma + PostgreSQL.
- Výchozí téma je **tmavé** (dark) – nikdy nepoužívej hardcoded světlé Tailwind barvy jako `bg-blue-50`, `bg-green-100`, `text-blue-700` atd. bez dark-mode varianty. Místo toho používej opacity varianty (`bg-primary/10`, `bg-blue-500/15`) nebo CSS proměnné.
- Texty a labely v UI jsou **česky**.
- Port dev serveru je standardně `3000`.
