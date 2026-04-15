"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Download } from "lucide-react";
import { ExportMediaButton } from "@/components/ExportMediaButton";

function SrealityXmlButton({ listingId, mediaCount }: { listingId: string; mediaCount: number }) {
  const [loading, setLoading] = useState(false);
  const hasMedia = mediaCount > 0;
  const handleDownload = async () => {
    if (!hasMedia) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/listings/${listingId}/sreality-xml`);
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d?.error || "Export selhal");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sreality-listing-${listingId}.xml`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Export selhal");
    } finally {
      setLoading(false);
    }
  };
  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={loading || !hasMedia}
      className="w-full text-left p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <div className="flex items-center gap-2">
        <Download className="h-4 w-4 text-muted-foreground" />
        <div>
          <div className="font-medium">Export Sreality XML</div>
          <div className="text-sm text-muted-foreground">
            {loading ? "Připravuji…" : !hasMedia ? "Žádná média" : "XML s popisky fotek (foto_popis)"}
          </div>
        </div>
      </div>
    </button>
  );
}

type Props = { listingId: string; mediaCount: number };

export function ListingQuickActions({ listingId, mediaCount }: Props) {
  const router = useRouter();
  const [aiLoading, setAiLoading] = useState(false);
  const [captionsLoading, setCaptionsLoading] = useState(false);

  const handleRegenerateCaptions = async () => {
    setCaptionsLoading(true);
    try {
      const res = await fetch(
        `/api/listings/${listingId}/generate-captions?force=true`,
        { method: "POST" }
      );
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.success !== false) {
        router.refresh();
        const msg =
          data.generated !== undefined
            ? `Vygenerováno ${data.generated} popisků.`
            : "Popisky byly přegenerovány.";
        alert(msg);
      } else {
        alert(data?.error || "Přegenerování popisků selhalo.");
      }
    } catch (e) {
      alert("Chyba při volání API. " + (e instanceof Error ? e.message : ""));
    } finally {
      setCaptionsLoading(false);
    }
  };

  const handleGenerateAI = async () => {
    setAiLoading(true);
    try {
      const res = await fetch(`/api/ai/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.success) {
        router.refresh();
        alert("AI popis byl vygenerován.");
      } else {
        const msg = [data?.error, data?.details].filter(Boolean).join(" – ") || "Generování AI obsahu selhalo.";
        alert(msg);
      }
    } catch (e) {
      alert("Chyba při volání API. " + (e instanceof Error ? e.message : ""));
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <Link
        href={`/upload?listingId=${listingId}`}
        className="block w-full text-left p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
      >
        <div className="font-medium">Upload More Media</div>
        <div className="text-sm text-muted-foreground">Přidat fotky nebo dokumenty (ZIP na stránce Nahrát)</div>
      </Link>
      <button
        type="button"
        onClick={handleGenerateAI}
        disabled={aiLoading}
        className="w-full text-left p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors disabled:opacity-50"
      >
        <div className="font-medium">
          Generate AI Content {aiLoading ? "…" : ""}
        </div>
        <div className="text-sm text-muted-foreground">Vygenerovat popisy, titulky, SEO text</div>
      </button>
      <button
        type="button"
        onClick={handleRegenerateCaptions}
        disabled={captionsLoading || mediaCount === 0}
        className="w-full text-left p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors disabled:opacity-50"
      >
        <div className="font-medium">
          Přegenerovat všechny popisky {captionsLoading ? "…" : ""}
        </div>
        <div className="text-sm text-muted-foreground">AI popisky k fotkám (DeepSeek), max 120 znaků</div>
      </button>
      <ExportMediaButton listingId={listingId} mediaCount={mediaCount} />
      <SrealityXmlButton listingId={listingId} mediaCount={mediaCount} />
    </div>
  );
}
