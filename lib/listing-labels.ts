/**
 * Map listing type and status enum keys to human-readable Czech labels.
 * Used on listing detail, listings list, and dashboard.
 */

const TYPE_LABELS: Record<string, string> = {
  APARTMENT: "Byt",
  HOUSE: "Dům",
  LAND: "Pozemek",
  COMMERCIAL: "Komerční",
  OTHER: "Ostatní",
};

const STATUS_LABELS: Record<string, string> = {
  NEW: "Nový",
  PROCESSING: "Zpracovává se",
  PROCESSED: "Připraveno",
  ACTIVE: "Aktivní",
  REZERVACE: "Rezervace",
  PRODANO: "Prodáno",
  SOLD: "Prodáno",
};

export function getTypeLabel(type: string | null | undefined): string {
  if (type == null || type === "") return "Ostatní";
  return TYPE_LABELS[type] ?? type;
}

export function getStatusLabel(status: string | null | undefined): string {
  if (status == null || status === "") return "—";
  return STATUS_LABELS[status] ?? status;
}
