'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';

export function ExportMediaButton({
  listingId,
  mediaCount = undefined,
}: Readonly<{ listingId: string; mediaCount?: number }>) {
  const [loading, setLoading] = useState(false);

  const hasMedia = mediaCount === undefined || mediaCount > 0;

  const handleExport = async () => {
    if (!hasMedia) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/listings/${listingId}/export`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg = err.error || 'Export failed';
        const friendly =
          msg === 'No media files to export' || (err.details && String(err.details).includes('No media'))
            ? 'K tomuto listingu nejsou nahrána žádná média.'
            : msg;
        throw new Error(friendly);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `listing-${listingId}-media.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert(e instanceof Error ? e.message : 'Export failed');
    } finally {
      setLoading(false);
    }
  };

  let subtitle = 'Download processed files as ZIP';
  if (loading) subtitle = 'Preparing…';
  else if (!hasMedia) subtitle = 'Žádná média k exportu';

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={loading || !hasMedia}
      className="w-full text-left p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <div className="flex items-center gap-2">
        <Download className="h-4 w-4 text-muted-foreground" />
        <div>
          <div className="font-medium">Export Media</div>
          <div className="text-sm text-muted-foreground">{subtitle}</div>
        </div>
      </div>
    </button>
  );
}
