"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
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
          <Label htmlFor="enrichment-address" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
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
              className="flex-1"
            />
            <Button type="submit" disabled={loading || !address.trim()}>
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
          <p className="text-xs text-muted-foreground">
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
        <Card className="p-4 space-y-4">
          {/* Status badge */}
          <div className="flex items-center justify-between">
            <Badge variant={result.ok ? "default" : "destructive"}>
              {result.ok ? (
                <>
                  <CheckCircle2 className="mr-1 h-3 w-3" /> Adresa nalezena
                </>
              ) : (
                <>
                  <AlertTriangle className="mr-1 h-3 w-3" /> Adresa nenalezena
                </>
              )}
            </Badge>
            {result.errors.length > 0 && (
              <Badge variant="outline" className="text-amber-600 border-amber-300">
                {result.errors.length} částečných chyb
              </Badge>
            )}
          </div>

          {result.ok && result.address && (
            <>
              {/* Address */}
              <section>
                <h3 className="text-sm font-semibold mb-1 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Normalizovaná adresa
                </h3>
                <p className="text-sm">{result.address.formatted}</p>
                <div className="mt-2 grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                  <div>
                    <span className="font-medium">Ulice:</span>{" "}
                    {result.address.street ?? "—"} {result.address.houseNumber ?? ""}
                  </div>
                  <div>
                    <span className="font-medium">Obec:</span>{" "}
                    {result.address.city ?? "—"}
                  </div>
                  <div>
                    <span className="font-medium">Okres:</span>{" "}
                    {result.address.district ?? "—"}
                  </div>
                  <div>
                    <span className="font-medium">PSČ:</span>{" "}
                    {result.address.postalCode ?? "—"}
                  </div>
                </div>
                {result.coordinates && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    GPS:{" "}
                    <code className="text-foreground">
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
                    <p className="text-xs font-medium mb-1 text-muted-foreground">
                      🛰️ Letecký pohled
                    </p>
                    <Image
                      src={result.aerialImageUrl}
                      alt="Letecký pohled"
                      width={640}
                      height={360}
                      className="rounded-md border w-full h-auto"
                      unoptimized
                    />
                  </div>
                )}
                {result.streetViewImageUrl ? (
                  <div>
                    <p className="text-xs font-medium mb-1 text-muted-foreground">
                      📷 Street View (exteriér)
                    </p>
                    <Image
                      src={result.streetViewImageUrl}
                      alt="Street View"
                      width={640}
                      height={360}
                      className="rounded-md border w-full h-auto"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="rounded-md border border-dashed p-4 flex items-center justify-center text-sm text-muted-foreground">
                    Street View pro tuto adresu není k dispozici
                  </div>
                )}
              </section>

              {/* Nearby */}
              <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <NearbyList
                  title="Školy"
                  icon={<School className="h-4 w-4" />}
                  places={result.nearby.schools}
                />
                <NearbyList
                  title="MHD"
                  icon={<Bus className="h-4 w-4" />}
                  places={result.nearby.transit}
                />
                <NearbyList
                  title="Obchody"
                  icon={<ShoppingCart className="h-4 w-4" />}
                  places={result.nearby.shops}
                />
              </section>

              {/* Partial errors detail */}
              {result.errors.length > 0 && (
                <details className="text-xs text-muted-foreground">
                  <summary className="cursor-pointer">
                    Detail částečných chyb ({result.errors.length})
                  </summary>
                  <ul className="mt-1 ml-4 list-disc">
                    {result.errors.map((err, i) => (
                      <li key={i}>
                        <strong>{err.source}:</strong> {err.message}
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
                  className="w-full"
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
        </Card>
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
    <div>
      <h4 className="text-xs font-semibold mb-1 flex items-center gap-1">
        {icon}
        {title}
        {places.length > 0 && (
          <span className="text-muted-foreground">({places.length})</span>
        )}
      </h4>
      {places.length === 0 ? (
        <p className="text-xs text-muted-foreground">Nic do 1 km</p>
      ) : (
        <ul className="space-y-1">
          {places.slice(0, 5).map((p, i) => (
            <li key={i} className="text-xs">
              <span className="font-medium">{p.name}</span>{" "}
              <span className="text-muted-foreground">— {p.distance_m}m</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
