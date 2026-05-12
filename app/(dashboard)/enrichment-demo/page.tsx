"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Sparkles } from "lucide-react";
import { AddressEnrichmentForm } from "@/components/AddressEnrichmentForm";
import type { EnrichmentResult } from "@/lib/property-enrichment";

export default function EnrichmentDemoPage() {
  const [accepted, setAccepted] = useState<EnrichmentResult | null>(null);

  return (
    <div className="relative isolate min-h-[calc(100vh-3.5rem)]">
      {/* Background mesh */}
      <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-[#C9A96E]/[0.08] blur-[120px]" />
        <div className="absolute top-1/3 right-0 w-[400px] h-[400px] rounded-full bg-blue-500/[0.05] blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-purple-500/[0.04] blur-[80px]" />
      </div>

      <div className="max-w-5xl mx-auto px-6 md:px-8 py-12 md:py-16 space-y-10">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="space-y-5"
        >
          {/* Eyebrow with sparkle */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#C9A96E]/30 bg-[#C9A96E]/[0.08] px-3 py-1">
            <Sparkles className="h-3 w-3 text-[#C9A96E]" />
            <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#C9A96E]">
              AI · Address Enrichment
            </span>
          </div>

          {/* Display heading with gradient */}
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-[-0.04em] leading-[1.05] bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-[#C9A96E]">
            Adresa → vše ostatní<br />
            <span className="text-foreground/60">za půl vteřiny</span>
          </h1>

          {/* Lead */}
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl">
            Napiš adresu nemovitosti. AI doplní GPS, mapu, fotku z ulice a okolní vybavenost.
            Zkus třeba „Pražská 12, Znojmo" nebo „Václavské náměstí 1, Praha".
          </p>
        </motion.div>

        {/* Form card with gradient border */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="bg-gradient-to-br from-white/[0.08] to-transparent rounded-2xl p-[1px]"
        >
          <div className="relative bg-background/80 backdrop-blur-xl rounded-[15px] p-8 md:p-10 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.4)]">
            <AddressEnrichmentForm
              initialAddress="Pražská 12, Znojmo"
              onAccept={setAccepted}
            />
          </div>
        </motion.div>

        {/* Accepted panel */}
        {accepted && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-gradient-to-br from-[#C9A96E]/20 to-[#C9A96E]/[0.05] rounded-2xl p-[1px]"
          >
            <div className="bg-background/80 backdrop-blur-xl rounded-[15px] p-6 md:p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#C9A96E]/15 border border-[#C9A96E]/30">
                  <CheckCircle2 className="h-4 w-4 text-[#C9A96E]" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    Data přijata
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Parent komponenta by je teď uložila do listing formu
                  </p>
                </div>
              </div>
              <pre className="text-xs overflow-auto bg-black/30 border border-white/[0.06] p-4 rounded-xl text-foreground/80 font-mono">
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
