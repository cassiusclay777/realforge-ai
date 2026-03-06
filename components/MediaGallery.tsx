"use client";

import { useState, useCallback, useEffect } from "react";
import { X } from "lucide-react";

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
  /** Kompaktní mřížka menších náhledů */
  compact?: boolean;
  className?: string;
}

export default function MediaGallery({ media, compact = true, className = "" }: MediaGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const doneMedia = media.filter((m) => m.processingStatus === "DONE" && m.url && !m.url.includes("placeholder"));
  const open = selectedIndex !== null;
  const selected = selectedIndex !== null ? doneMedia[selectedIndex] : null;

  const close = useCallback(() => setSelectedIndex(null), []);
  const goPrev = useCallback(() => {
    setSelectedIndex((i) => (i === null ? null : i === 0 ? doneMedia.length - 1 : i - 1));
  }, [doneMedia.length]);
  const goNext = useCallback(() => {
    setSelectedIndex((i) => (i === null ? null : i === doneMedia.length - 1 ? 0 : i + 1));
  }, [doneMedia.length]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close, goPrev, goNext]);

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
            className="aspect-square rounded-lg overflow-hidden bg-muted border border-border hover:ring-2 hover:ring-primary/50 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <img
              src={m.url.startsWith("/") ? m.url : `/${m.url}`}
              alt={m.altText || m.aiCaption || m.category || "Foto"}
              className="w-full h-full object-cover"
            />
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
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 max-w-2xl px-4 py-2 bg-black/70 rounded text-white text-sm text-center">
            {selected.aiCaption ? selected.aiCaption : "Popis se generuje…"}
          </div>
        </div>
      )}
    </>
  );
}
