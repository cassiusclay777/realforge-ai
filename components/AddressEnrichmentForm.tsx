"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  MapPin,
  School,
  Bus,
  ShoppingCart,
  Loader2,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
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
    <div className="space-y-4">
      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-2">
          <Label
            htmlFor="enrichment-address"
            className="text-[#1c1d20] font-medium flex items-center gap-2"
          >
            <Sparkles className="h-4 w-4 text-[#C9A96E]" />
            Adresa nemovitosti
          </Label>
          <div className="flex gap-2">
            <Input
              id="enrichment-address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="např. Pražská 12, Znojmo"
              disabled={loading}
              autoComplete="off"
              className="flex-1 bg-[#f4f3f0] border-[#e6e4e1] focus-visible:ring-[#C9A96E] focus-visible:border-[#C9A96E] text-[#1c1d20] placeholder:text-[#5a5c5f]"
            />
            <Button
              type="submit"
              disabled={loading || !address.trim()}
              className="bg-[#C9A96E] hover:bg-[#b8964f] text-white shadow-sm"
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
          <p className="text-xs text-[#5a5c5f]">
            AI doplní GPS, mapu, foto z ulice a okolní vybavenost. Trvá ~0,5–1s.
          </p>
        </div>
      </form>

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Result */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="bg-white rounded-2xl border border-[#e6e4e1] shadow-[0_2px_12px_rgba(28,29,32,0.06)] p-6 space-y-5"
        >
          {/* Status badge */}
          <div className="flex items-center justify-between">
            {result.ok ? (
              <span className="inline-flex items-center gap-1 bg-[#f5efe4] text-[#1c1d20] border border-[#C9A96E]/30 rounded-full px-2.5 py-0.5 text-xs">
                <CheckCircle2 className="h-3 w-3 text-[#C9A96E]" />
                Adresa nalezena
              </span>
            ) : (
              <Badge variant="destructive">
                <AlertTriangle className="mr-1 h-3 w-3" /> Adresa nenalezena
              </Badge>
            )}
            {result.errors.length > 0 && (
              <span className="inline-flex items-center bg-amber-50 text-amber-700 border border-amber-300 rounded-full px-2.5 py-0.5 text-xs">
                {result.errors.length} částečných chyb
              </span>
            )}
          </div>

          {result.ok && result.address && (
            <>
              {/* Address */}
              <section>
                <h3 className="font-[var(--font-jj-serif)] text-[#1c1d20] text-base font-semibold mb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#C9A96E]" />
                  Normalizovaná adresa
                </h3>
                <p className="text-sm text-[#1c1d20]">{result.address.formatted}</p>
                <div className="mt-2 grid grid-cols-2 gap-1 text-xs">
                  <div>
                    <span className="font-medium text-[#5a5c5f]">Ulice:</span>{" "}
                    <span className="text-[#1c1d20]">
                      {result.address.street ?? "—"} {result.address.houseNumber ?? ""}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-[#5a5c5f]">Obec:</span>{" "}
                    <span className="text-[#1c1d20]">{result.address.city ?? "—"}</span>
                  </div>
                  <div>
                    <span className="font-medium text-[#5a5c5f]">Okres:</span>{" "}
                    <span className="text-[#1c1d20]">{result.address.district ?? "—"}</span>
                  </div>
                  <div>
                    <span className="font-medium text-[#5a5c5f]">PSČ:</span>{" "}
                    <span className="text-[#1c1d20]">{result.address.postalCode ?? "—"}</span>
                  </div>
                </div>
                {result.coordinates && (
                  <p className="mt-2 text-xs text-[#5a5c5f]">
                    GPS:{" "}
                    <code className="text-[#1c1d20] bg-[#f5efe4] px-1.5 py-0.5 rounded font-mono text-xs">
                      {result.coordinates.lat.toFixed(6)},{" "}
                      {result.coordinates.lng.toFixed(6)}
                    </code>
                  </p>
                )}
              </section>

              {/* Images */}
              <section className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {result.aerialImageUrl && (
                  <div>
                    <h3 className="font-[var(--font-jj-serif)] text-[#1c1d20] text-base font-semibold mb-2 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-[#C9A96E]" />
                      Letecký pohled
                    </h3>
                    <Image
                      src={result.aerialImageUrl}
                      alt="Letecký pohled"
                      width={640}
                      height={360}
                      className="rounded-xl border border-[#e6e4e1] shadow-[0_1px_3px_rgba(0,0,0,0.04)] w-full h-auto"
                      unoptimized
                    />
                  </div>
                )}
                {result.streetViewImageUrl ? (
                  <div>
                    <h3 className="font-[var(--font-jj-serif)] text-[#1c1d20] text-base font-semibold mb-2 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-[#C9A96E]" />
                      Street View
                    </h3>
                    <Image
                      src={result.streetViewImageUrl}
                      alt="Street View"
                      width={640}
                      height={360}
                      className="rounded-xl border border-[#e6e4e1] shadow-[0_1px_3px_rgba(0,0,0,0.04)] w-full h-auto"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-[#d2cfc9] bg-[#f4f3f0] p-6 flex items-center justify-center text-sm text-[#5a5c5f]">
                    Z této ulice zatím Google Street View nemá fotku
                  </div>
                )}
              </section>

              {/* Nearby */}
              <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <NearbyList
                  title="Školy"
                  icon={<School className="h-4 w-4 text-[#C9A96E]" />}
                  places={result.nearby.schools}
                />
                <NearbyList
                  title="MHD"
                  icon={<Bus className="h-4 w-4 text-[#C9A96E]" />}
                  places={result.nearby.transit}
                />
                <NearbyList
                  title="Obchody"
                  icon={<ShoppingCart className="h-4 w-4 text-[#C9A96E]" />}
                  places={result.nearby.shops}
                />
              </section>

              {/* Partial errors detail */}
              {result.errors.length > 0 && (
                <details className="text-xs text-[#5a5c5f]">
                  <summary className="cursor-pointer text-[#5a5c5f] hover:text-[#1c1d20]">
                    Detail částečných chyb ({result.errors.length})
                  </summary>
                  <ul className="mt-1 ml-4 list-disc">
                    {result.errors.map((err, i) => (
                      <li key={i}>
                        <strong className="text-[#1c1d20]">{err.source}:</strong>{" "}
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
                  className="w-full bg-[#C9A96E] hover:bg-[#b8964f] text-white shadow-sm"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Použít tato data
                </Button>
              )}
            </>
          )}

          {!result.ok && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {result.errors[0]?.message ??
                  "Adresu se nepodařilo zpracovat. Zkontroluj ji a zkus to znovu."}
              </AlertDescription>
            </Alert>
          )}
        </motion.div>
      )}
    </div>
  );
}

function NearbyList({
  title,
  icon,
  places,
}: {
  title: string;
  icon: React.ReactNode;
  places: NearbyPlace[];
}) {
  return (
    <div className="bg-[#f4f3f0] rounded-xl p-4 border border-[#e6e4e1]">
      <h4 className="font-[var(--font-jj-serif)] text-[#1c1d20] text-sm font-semibold mb-2 flex items-center gap-1.5">
        {icon}
        {title}
        {places.length > 0 && (
          <span className="text-[#5a5c5f] text-xs font-normal">
            ({places.length})
          </span>
        )}
      </h4>
      {places.length === 0 ? (
        <p className="text-xs text-[#5a5c5f]">Nic do 1 km</p>
      ) : (
        <ul className="space-y-1">
          {places.slice(0, 5).map((p, i) => (
            <li key={i}>
              <span className="text-[#1c1d20] text-xs font-medium">{p.name}</span>{" "}
              <span className="text-[#5a5c5f] text-xs">— {p.distance_m}m</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
