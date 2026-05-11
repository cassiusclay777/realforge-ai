"use client";

import { useState, useCallback, useEffect } from "react";
import { X, Loader2 } from "lucide-react";

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

function resolveUrl(url: string): string {
  if (!url) return "";
  // Absolutní URL (http/https) – použij přímo
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  // Relativní cesta – musí začínat lomítkem
  return url.startsWith("/") ? url : `/${url}`;
}

function isDone(m: MediaGalleryItem) {
  return m.processingStatus === "DONE";
}

function isVisible(m: MediaGalleryItem) {
  // Skryj jen čistý placeholder bez reálné URL
  if (!m.url) return false;
  if (m.url === "/placeholder.jpg" || m.url === "placeholder.jpg") return false;
  return true;
}

export default function MediaGallery({ media, compact = true, className = "" }: MediaGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const visibleMedia = media.filter(isVisible);
  const doneMedia = visibleMedia.filter(isDone);

  // Lightbox pracuje jen s hotovými fotkami
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

  if (visibleMedia.length === 0) {
    return (
      <div className={`rounded-lg border border-dashed bg-muted/30 p-8 text-center text-muted-foreground ${className}`}>
        <p className="text-sm">Zatím žádné fotografie – nahrajte ZIP a AI je zpracuje</p>
      </div>
    );
  }

  const gridCols = compact
    ? "grid-cols-4 sm:grid-cols-5 md:grid-cols-6"
    : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4";

  return (
    <>
      <div className={`grid gap-2 ${gridCols} ${className}`}>
        {visibleMedia.map((m) => {
          const done = isDone(m);
          const doneIdx = doneMedia.indexOf(m);
          const src = resolveUrl(m.url);

          return (
            <button
              key={m.id}
              type="button"
              disabled={!done}
              onClick={() => done && doneIdx >= 0 && setSelectedIndex(doneIdx)}
              className={`relative aspect-square rounded-lg overflow-hidden bg-muted border border-border transition-all ${
                done
                  ? "hover:ring-2 hover:ring-primary/50 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                  : "cursor-default opacity-80"
              }`}
              aria-label={done ? (m.aiCaption ?? m.category ?? "Foto") : "Zpracovává se…"}
            >
              {src && (
                <img
                  src={src}
                  alt={m.altText || m.aiCaption || m.category || "Foto"}
                  className={`w-full h-full object-cover transition-opacity ${done ? "opacity-100" : "opacity-40"}`}
                  onError={(e) => {
                    // Skryje broken image icon
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
              )}

              {/* Spinner overlay pro PROCESSING / QUEUED */}
              {!done && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 gap-1">
                  <Loader2 className="h-5 w-5 text-white animate-spin" />
                  <span className="text-white text-[10px] font-medium">
                    {m.processingStatus === "QUEUED" ? "Ve frontě" : "Zpracovává se"}
                  </span>
                </div>
              )}

              {/* Badge kategorie na hotové fotce */}
              {done && m.category && m.category !== "OTHER" && (
                <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-[9px] text-center py-0.5 truncate px-1">
                  {m.category.toLowerCase().replace("_", " ")}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Počítadlo stavu */}
      {visibleMedia.length > 0 && doneMedia.length < visibleMedia.length && (
        <p className="mt-2 text-xs text-muted-foreground text-center">
          Zpracováno {doneMedia.length} / {visibleMedia.length} fotek – stránka se automaticky aktualizuje
        </p>
      )}

      {/* Lightbox */}
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
          {doneMedia.length > 1 && (
            <>
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
            </>
          )}
          <div
            className="max-w-[90vw] max-h-[90vh] flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={resolveUrl(selected.url)}
              alt={selected.altText || selected.aiCaption || selected.category || "Foto"}
              className="max-w-full max-h-[85vh] w-auto h-auto object-contain rounded"
            />
          </div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 max-w-2xl px-4 py-2 bg-black/70 rounded text-white text-sm text-center">
            {selected.aiCaption ?? selected.aiDescription ?? "Popis se generuje…"}
          </div>
        </div>
      )}
    </>
  );
}
