"use client";

import { useState, useCallback, useEffect } from "react";
import { X } from "lucide-react";
import { getCategoryLabel } from "@/lib/category-labels";

export interface MediaGalleryItem {
  id: string;
  url: string;
  category?: string;
  processingStatus?: string;
  aiCaption?: string | null;
  aiDescription?: string | null;
  altText?: string | null;
  isFeatured?: boolean;
  sortOrder?: number;
}

interface MediaGalleryProps {
  media: MediaGalleryItem[];
  /** Pokud je nastaveno, lze v lightboxu upravovat popisek (inline edit). */
  listingId?: string;
  compact?: boolean;
  className?: string;
}

export default function MediaGallery({ media, listingId, compact = true, className = "" }: MediaGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [editingCaption, setEditingCaption] = useState(false);
  const [captionDraft, setCaptionDraft] = useState("");
  const [editedCaptions, setEditedCaptions] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const doneMedia = media.filter((m) => m.processingStatus === "DONE" && m.url && !m.url.includes("placeholder"));
  const open = selectedIndex !== null;
  const selected = selectedIndex !== null ? doneMedia[selectedIndex] : null;

  const displayCaption = (m: MediaGalleryItem) =>
    editedCaptions[m.id] ?? m.aiCaption ?? m.altText ?? "";

  const close = useCallback(() => {
    setSelectedIndex(null);
    setEditingCaption(false);
  }, []);
  const goPrev = useCallback(() => {
    setSelectedIndex((i) => (i === null ? null : i === 0 ? doneMedia.length - 1 : i - 1));
  }, [doneMedia.length]);
  const goNext = useCallback(() => {
    setSelectedIndex((i) => (i === null ? null : i === doneMedia.length - 1 ? 0 : i + 1));
  }, [doneMedia.length]);

  const startEditCaption = useCallback(() => {
    if (!selected) return;
    setCaptionDraft(editedCaptions[selected.id] ?? selected.aiCaption ?? selected.altText ?? "");
    setEditingCaption(true);
  }, [selected, editedCaptions]);

  const saveCaption = useCallback(async () => {
    if (!selected || !listingId || saving) return;
    const value = captionDraft.trim();
    setSaving(true);
    try {
      const res = await fetch(`/api/listings/${listingId}/media/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aiCaption: value || null }),
      });
      if (res.ok) {
        setEditedCaptions((prev) => ({ ...prev, [selected.id]: value }));
        setEditingCaption(false);
      } else {
        const d = await res.json().catch(() => ({}));
        alert(d?.error || "Uložení selhalo");
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : "Uložení selhalo");
    } finally {
      setSaving(false);
    }
  }, [selected, listingId, captionDraft, saving]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (editingCaption) setEditingCaption(false);
        else close();
      }
      if (!editingCaption) {
        if (e.key === "ArrowLeft") goPrev();
        if (e.key === "ArrowRight") goNext();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close, goPrev, goNext, editingCaption]);

  if (doneMedia.length === 0) {
    return (
      <div className={`rounded-lg border border-dashed bg-muted/30 p-8 text-center text-muted-foreground ${className}`}>
        <p className="text-sm">Zatím žádné zpracované fotografie</p>
      </div>
    );
  }

  return (
    <>
      <div
        className={`grid gap-2 ${compact ? "grid-cols-4 sm:grid-cols-5 md:grid-cols-6" : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"} ${className}`}
      >
        {doneMedia.map((m, idx) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setSelectedIndex(idx)}
            className="relative aspect-square rounded-lg overflow-hidden bg-muted border border-border hover:ring-2 hover:ring-primary/50 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <img
              src={m.url.startsWith("/") ? m.url : `/${m.url}`}
              alt={m.altText || m.aiCaption || m.category || "Foto"}
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-white text-xs font-medium">
              {getCategoryLabel(m.category)}
            </span>
          </button>
        ))}
      </div>

      {/* Lightbox – zvětšení po kliknutí */}
      {open && selected && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label="Zvětšená fotografie"
        >
          <button
            type="button"
            onClick={close}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
            aria-label="Zavřít"
          >
            <X className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
            aria-label="Předchozí"
          >
            <span className="text-2xl">‹</span>
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
            aria-label="Další"
          >
            <span className="text-2xl">›</span>
          </button>
          <div
            className="max-w-[90vw] max-h-[90vh] flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selected.url.startsWith("/") ? selected.url : `/${selected.url}`}
              alt={selected.altText || selected.aiCaption || selected.category || "Foto"}
              className="max-w-full max-h-[85vh] w-auto h-auto object-contain rounded"
            />
          </div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 max-w-2xl w-full px-4 flex flex-col items-center gap-1">
            <span className="px-2 py-0.5 rounded bg-white/20 text-white text-xs font-medium">
              {getCategoryLabel(selected.category)}
            </span>
            {editingCaption ? (
              <div className="w-full flex flex-col sm:flex-row gap-2" onClick={(e) => e.stopPropagation()}>
                <textarea
                  value={captionDraft}
                  onChange={(e) => setCaptionDraft(e.target.value)}
                  className="flex-1 min-h-[60px] px-3 py-2 rounded bg-black/70 text-white text-sm border border-white/20 focus:border-white/50 outline-none resize-y"
                  placeholder="Popis fotky…"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      saveCaption();
                    }
                  }}
                />
                <div className="flex gap-2">
                  <button type="button" onClick={saveCaption} disabled={saving} className="px-3 py-1.5 rounded bg-white/20 text-white text-sm hover:bg-white/30 disabled:opacity-50">
                    {saving ? "Ukládám…" : "Uložit"}
                  </button>
                  <button type="button" onClick={() => setEditingCaption(false)} className="px-3 py-1.5 rounded bg-white/10 text-white text-sm hover:bg-white/20">
                    Zrušit
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); listingId ? startEditCaption() : undefined; }}
                className={`px-4 py-2 rounded text-white text-sm text-center ${listingId ? "bg-black/70 hover:bg-black/80 cursor-pointer" : "bg-black/70 cursor-default"}`}
              >
                {displayCaption(selected) || "Popis se generuje…"}
                {listingId && <span className="ml-2 text-white/60 text-xs">(klik pro úpravu)</span>}
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
