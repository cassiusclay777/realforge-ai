"use client";

import { AddressEnrichmentForm } from "@/components/AddressEnrichmentForm";
import type { EnrichmentResult } from "@/lib/property-enrichment";
import { useState } from "react";
import { Playfair_Display, Inter, Great_Vibes } from "next/font/google";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

const playfair = Playfair_Display({
  subsets: ["latin", "latin-ext"],
  variable: "--font-jj-serif",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-jj-sans",
  display: "swap",
});

const greatVibes = Great_Vibes({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-jj-script",
  display: "swap",
});

/**
 * Demo stránka pro test address enrichmentu.
 * Po MVP: integrovat AddressEnrichmentForm rovnou do /upload page nebo new-listing flow.
 */
export default function EnrichmentDemoPage() {
  const [accepted, setAccepted] = useState<EnrichmentResult | null>(null);

  return (
    <div
      className={`${playfair.variable} ${inter.variable} ${greatVibes.variable} -m-6 md:-m-8 p-6 md:p-10 min-h-[calc(100vh-3.5rem)] bg-[#faf9f7] text-[#1c1d20] overflow-x-hidden`}
      style={{ fontFamily: "var(--font-jj-sans), system-ui, sans-serif" }}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Hero */}
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#C9A96E] font-medium mb-3">
            Demo · Address Enrichment
          </p>
          <h1
            className="font-[var(--font-jj-serif)] font-semibold text-[#1c1d20] leading-tight"
            style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)" }}
          >
            Adresa → AI doplní zbytek
          </h1>
          <p className="font-[var(--font-jj-script)] text-[#C9A96E] italic text-2xl mt-2">
            AI pomocnice ✨
          </p>
          <p className="text-[#5a5c5f] mt-4 text-base leading-relaxed">
            Napiš adresu nemovitosti. AI doplní GPS, mapu, fotku z ulice a
            okolní vybavenost za půl vteřiny. Zkus třeba „Pražská 12, Znojmo"
            nebo „Václavské náměstí 1, Praha".
          </p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(28,29,32,0.06)] border border-[#e6e4e1] p-6 md:p-8">
          <AddressEnrichmentForm
            initialAddress="Pražská 12, Znojmo"
            onAccept={setAccepted}
          />
        </div>

        {/* Accepted panel */}
        {accepted && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <div className="bg-[#f5efe4] rounded-xl p-5 md:p-6 border-l-4 border-l-[#C9A96E]">
              <h3 className="font-[var(--font-jj-serif)] font-semibold text-[#1c1d20] text-lg mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-[#C9A96E]" />
                Data přijata
              </h3>
              <p className="text-sm text-[#5a5c5f] mb-3">
                Parent komponenta by je teď uložila do listing formu.
              </p>
              <pre className="text-xs overflow-auto bg-white/60 p-3 rounded-lg border border-[#e6e4e1] text-[#1c1d20]">
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
          </motion.div>
        )}
      </div>
    </div>
  );
}
