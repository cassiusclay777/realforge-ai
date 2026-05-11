/**
 * Smoke test: zavolá enrichFromAddress() na reálné Google APIs.
 * Slouží k ručnímu ověření že GOOGLE_MAPS_API_KEY funguje a všechny 4 APIs odpovídají.
 *
 * Spuštění z root projektu:
 *   npx tsx scripts/smoke-enrichment.ts ["Adresa"]
 *
 * Default adresa: Pražská 12, Znojmo
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { enrichFromAddress } from "../lib/property-enrichment";

const address = process.argv[2] ?? "Pražská 12, Znojmo";

console.log(`\n🔍 Enriching: "${address}"\n`);
console.log("─".repeat(72));

const t0 = Date.now();
enrichFromAddress(address)
  .then((result) => {
    const ms = Date.now() - t0;

    console.log("✅ Done in", ms, "ms\n");

    console.log("📍 Address:");
    console.log("  ok:", result.ok);
    console.log("  formatted:", result.address?.formatted);
    console.log("  street:", result.address?.street, result.address?.houseNumber);
    console.log("  city:", result.address?.city);
    console.log("  district:", result.address?.district);
    console.log("  postal:", result.address?.postalCode);
    console.log("  country:", result.address?.country);

    console.log("\n🌐 Coordinates:");
    console.log("  lat:", result.coordinates?.lat);
    console.log("  lng:", result.coordinates?.lng);

    console.log("\n🛰️  Aerial image URL:");
    console.log(" ", result.aerialImageUrl?.slice(0, 120) + "...");

    console.log("\n📷 Street View URL:");
    console.log(" ", result.streetViewImageUrl ? result.streetViewImageUrl.slice(0, 120) + "..." : "(no imagery)");

    console.log("\n🏫 Nearby (top 3 per category):");
    console.log("  Schools:");
    result.nearby.schools.slice(0, 3).forEach((p) =>
      console.log(`    • ${p.name} — ${p.distance_m}m (${p.type})`)
    );
    console.log("  Transit:");
    result.nearby.transit.slice(0, 3).forEach((p) =>
      console.log(`    • ${p.name} — ${p.distance_m}m (${p.type})`)
    );
    console.log("  Shops:");
    result.nearby.shops.slice(0, 3).forEach((p) =>
      console.log(`    • ${p.name} — ${p.distance_m}m (${p.type})`)
    );

    if (result.errors.length > 0) {
      console.log("\n⚠️  Errors (partial failures):");
      result.errors.forEach((e) =>
        console.log(`  • [${e.source}] ${e.message}`)
      );
    } else {
      console.log("\n✨ No errors — all 4 APIs returned successfully.");
    }

    console.log("\n─".repeat(72));
    console.log(
      "🌐 Open aerial image in browser:",
      result.aerialImageUrl?.slice(0, 80) + "..."
    );
    console.log();
  })
  .catch((err) => {
    console.error("\n❌ Smoke test FAILED:");
    console.error(err);
    process.exit(1);
  });
