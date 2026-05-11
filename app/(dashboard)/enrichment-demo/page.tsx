"use client";

import { AddressEnrichmentForm } from "@/components/AddressEnrichmentForm";
import type { EnrichmentResult } from "@/lib/property-enrichment";
import { useState } from "react";

/**
 * Demo stránka pro test address enrichmentu.
 * Po MVP: integrovat AddressEnrichmentForm rovnou do /upload page nebo new-listing flow.
 */
export default function EnrichmentDemoPage() {
  const [accepted, setAccepted] = useState<EnrichmentResult | null>(null);

  return (
    <div className="container max-w-4xl mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Address Enrichment — Demo</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Test: napiš adresu (zkus např. „Pražská 12, Znojmo" nebo „Václavské
          náměstí 1, Praha") a uvidíš co AI doplní za 0,5s.
        </p>
      </div>

      <AddressEnrichmentForm
        initialAddress="Pražská 12, Znojmo"
        onAccept={setAccepted}
      />

      {accepted && (
        <div className="rounded-md border border-emerald-300 bg-emerald-50 p-4">
          <h3 className="font-semibold text-emerald-900 mb-2">
            ✅ Data přijata (parent komponenta by je teď uložila do listing form)
          </h3>
          <pre className="text-xs overflow-auto bg-white p-2 rounded border">
            {JSON.stringify(
              {
                address: accepted.address?.formatted,
                coords: accepted.coordinates,
                nearbyCount: {
                  schools: accepted.nearby.schools.length,
                  transit: accepted.nearby.transit.length,
                  shops: accepted.nearby.shops.length,
                },
              },
              null,
              2,
            )}
          </pre>
        </div>
      )}
    </div>
  );
}
