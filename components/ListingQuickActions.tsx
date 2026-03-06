"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExportMediaButton } from "@/components/ExportMediaButton";

type Props = { listingId: string; mediaCount: number };

export function ListingQuickActions({ listingId, mediaCount }: Props) {
  const router = useRouter();
  const [aiLoading, setAiLoading] = useState(false);

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
      <ExportMediaButton listingId={listingId} mediaCount={mediaCount} />
    </div>
  );
}
