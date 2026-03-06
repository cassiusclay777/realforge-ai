# Mamka Reality – fotky a ZIPy

Složky = jedna nemovitost. Uvnitř: `001.jpg`, `002.jpg`, … a případně `.zip` (stejný obsah).

**Vytvoření chybějících ZIPů** (ze složky projektu):
```bash
node scripts/zip-mamka-albums.cjs
```
U složek bez ZIP se vytvoří `Název složky.zip` z všech JPG.

**Upload do REALFORGE:** V aplikaci **Nahrát ZIP** vyber jeden z těchto ZIPů, vyplň název/adresu/cenu a spusť AI zpracování (Redis + worker musí běžet: `npm run dev:full`).
