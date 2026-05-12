"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  MapPin,
  School,
  Bus,
  ShoppingCart,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Navigation,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { EnrichmentResult, NearbyPlace } from "@/lib/property-enrichment";

interface Props {
  /** Předvyplněná adresa (např. pokud se vrací k existujícímu listingu) */
  initialAddress?: string;
  /** Callback, když uživatel klikne „Použít tato data". Parent komponenta dostane EnrichmentResult. */
  onAccept?: (result: EnrichmentResult) => void;
}

/**
 * Reusable formulář: uživatel napíše adresu → fetch /api/enrichment/from-address →
 * zobrazí náhled (mapa, Street View, okolní vybavenost). Tlačítkem „Použít tato data"
 * předává výsledek do parent komponenty.
 */
export function AddressEnrichmentForm({ initialAddress = "", onAccept }: Props) {
  const [address, setAddress] = useState(initialAddress);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EnrichmentResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = address.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/enrichment/from-address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: trimmed }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data?.error ?? `HTTP ${res.status}`);
        return;
      }

      setResult(data as EnrichmentResult);
    } catch (e) {
      setError(
        "Chyba sítě: " + (e instanceof Error ? e.message : String(e)),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <Label
          htmlFor="enrichment-address"
          className="flex items-center gap-2 text-sm font-medium text-foreground"
        >
          <Sparkles className="h-3.5 w-3.5 text-[#C9A96E]" />
          Adresa nemovitosti
        </Label>
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            id="enrichment-address"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="např. Pražská 12, Znojmo"
            disabled={loading}
            autoComplete="off"
            className="flex-1 h-12 bg-white/[0.03] border-white/[0.08] text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-[#C9A96E]/40 focus-visible:border-[#C9A96E]/50 focus-visible:ring-offset-0 transition-colors"
          />
          <Button
            type="submit"
            disabled={loading || !address.trim()}
            className="h-12 px-6 bg-gradient-to-br from-[#D4B87A] via-[#C9A96E] to-[#B89456] hover:from-[#D9BE82] hover:via-[#CFB073] hover:to-[#BE9A5C] text-black font-semibold shadow-[0_0_40px_-12px_rgba(201,169,110,0.4)] hover:shadow-[0_0_50px_-10px_rgba(201,169,110,0.6)] transition-all border-0"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Načítám...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Vyplnit z adresy
              </>
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground/80">
          AI doplní GPS, mapu, foto z ulice a okolní vybavenost. Trvá ~0,5–1s.
        </p>
      </form>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <Alert
              variant="destructive"
              className="bg-red-950/30 border-red-500/30 text-red-200"
            >
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="space-y-8 pt-2"
          >
            {/* Status row */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              {result.ok ? (
                <div className="inline-flex items-center gap-2 rounded-full bg-[#C9A96E]/[0.08] border border-[#C9A96E]/25 px-3 py-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#C9A96E] animate-pulse" />
                  <span className="text-xs font-medium text-[#C9A96E]">
                    Adresa nalezena
                  </span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 rounded-full bg-red-500/10 border border-red-500/30 px-3 py-1">
                  <AlertTriangle className="h-3 w-3 text-red-400" />
                  <span className="text-xs font-medium text-red-400">
                    Adresa nenalezena
                  </span>
                </div>
              )}
              {result.errors.length > 0 && (
                <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 px-3 py-1">
                  <span className="text-xs font-medium text-amber-400">
                    {result.errors.length} částečných chyb
                  </span>
                </div>
              )}
            </div>

            {result.ok && result.address && (
              <>
                {/* Address card */}
                <section className="space-y-4">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground tracking-tight">
                    <MapPin className="h-4 w-4 text-[#C9A96E]" />
                    Normalizovaná adresa
                  </h3>
                  <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 space-y-3">
                    <p className="text-base text-foreground font-medium">
                      {result.address.formatted}
                    </p>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm pt-2 border-t border-white/[0.04]">
                      <Field
                        label="Ulice"
                        value={`${result.address.street ?? "—"} ${result.address.houseNumber ?? ""}`.trim()}
                      />
                      <Field label="Obec" value={result.address.city} />
                      <Field label="Okres" value={result.address.district} />
                      <Field label="PSČ" value={result.address.postalCode} />
                    </div>
                    {result.coordinates && (
                      <div className="flex items-center gap-2 pt-2 border-t border-white/[0.04]">
                        <Navigation className="h-3.5 w-3.5 text-[#C9A96E]" />
                        <span className="text-xs text-muted-foreground">GPS:</span>
                        <code className="text-xs text-foreground/80 bg-black/30 px-2 py-0.5 rounded font-mono">
                          {result.coordinates.lat.toFixed(6)},{" "}
                          {result.coordinates.lng.toFixed(6)}
                        </code>
                      </div>
                    )}
                  </div>
                </section>

                {/* Images grid */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.aerialImageUrl && (
                    <ImageCard
                      title="Letecký pohled"
                      icon={ImageIcon}
                      src={result.aerialImageUrl}
                    />
                  )}
                  {result.streetViewImageUrl ? (
                    <ImageCard
                      title="Street View"
                      icon={ImageIcon}
                      src={result.streetViewImageUrl}
                    />
                  ) : (
                    <div className="bg-white/[0.02] border border-white/[0.06] border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center">
                      <ImageIcon className="h-8 w-8 text-muted-foreground/40 mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Z této ulice zatím Google Street View nemá fotku
                      </p>
                    </div>
                  )}
                </section>

                {/* Nearby */}
                <section className="space-y-4">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground tracking-tight">
                    <MapPin className="h-4 w-4 text-[#C9A96E]" />
                    Okolí{" "}
                    <span className="text-xs text-muted-foreground font-normal">
                      (do 1 km)
                    </span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <NearbyList
                      title="Školy"
                      icon={School}
                      places={result.nearby.schools}
                    />
                    <NearbyList
                      title="MHD"
                      icon={Bus}
                      places={result.nearby.transit}
                    />
                    <NearbyList
                      title="Obchody"
                      icon={ShoppingCart}
                      places={result.nearby.shops}
                    />
                  </div>
                </section>

                {/* Partial errors detail */}
                {result.errors.length > 0 && (
                  <details className="group">
                    <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground transition-colors">
                      Detail částečných chyb ({result.errors.length})
                    </summary>
                    <ul className="mt-2 ml-4 list-disc space-y-1 text-xs text-muted-foreground">
                      {result.errors.map((err, i) => (
                        <li key={i}>
                          <strong className="text-foreground/80">
                            {err.source}:
                          </strong>{" "}
                          {err.message}
                        </li>
                      ))}
                    </ul>
                  </details>
                )}

                {/* Accept button */}
                {onAccept && (
                  <Button
                    type="button"
                    onClick={() => onAccept(result)}
                    className="w-full h-12 bg-gradient-to-br from-[#D4B87A] via-[#C9A96E] to-[#B89456] hover:from-[#D9BE82] hover:via-[#CFB073] hover:to-[#BE9A5C] text-black font-semibold shadow-[0_0_40px_-12px_rgba(201,169,110,0.4)] hover:shadow-[0_0_50px_-10px_rgba(201,169,110,0.6)] transition-all border-0"
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Použít tato data
                  </Button>
                )}
              </>
            )}

            {!result.ok && (
              <Alert
                variant="destructive"
                className="bg-red-950/30 border-red-500/30 text-red-200"
              >
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {result.errors[0]?.message ??
                    "Adresu se nepodařilo zpracovat. Zkontroluj ji a zkus to znovu."}
                </AlertDescription>
              </Alert>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="space-y-0.5">
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground/70">
        {label}
      </p>
      <p className="text-sm text-foreground/90">{value || "—"}</p>
    </div>
  );
}

function ImageCard({
  title,
  icon: Icon,
  src,
}: {
  title: string;
  icon: typeof ImageIcon;
  src: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5 text-[#C9A96E]" />
        <span>{title}</span>
      </div>
      <div className="relative overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02]">
        <Image
          src={src}
          alt={title}
          width={640}
          height={360}
          className="w-full h-auto"
          unoptimized
        />
      </div>
    </div>
  );
}

function NearbyList({
  title,
  icon: Icon,
  places,
}: {
  title: string;
  icon: typeof School;
  places: NearbyPlace[];
}) {
  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
          <Icon className="h-3.5 w-3.5 text-[#C9A96E]" />
          {title}
        </h4>
        {places.length > 0 && (
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60">
            {places.length}
          </span>
        )}
      </div>
      {places.length === 0 ? (
        <p className="text-xs text-muted-foreground/60 italic">Nic do 1 km</p>
      ) : (
        <ul className="space-y-2">
          {places.slice(0, 5).map((p, i) => (
            <li
              key={i}
              className="flex items-start justify-between gap-2 text-xs"
            >
              <span className="text-foreground/90 line-clamp-2">{p.name}</span>
              <span className="text-muted-foreground/60 shrink-0">
                {p.distance_m}m
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
