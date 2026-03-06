/**
 * Map media category enum keys to human-readable Czech labels.
 * Used in listing detail "AI popisky", gallery overlays, and anywhere category is shown in UI.
 */
const CATEGORY_LABELS: Record<string, string> = {
  LIVING_ROOM: "Obývací pokoj",
  KITCHEN: "Kuchyň",
  BEDROOM: "Ložnice",
  BATHROOM: "Koupelna",
  HALLWAY: "Předsíň",
  FACADE: "Fasáda",
  EXTERIOR: "Exteriér",
  GARDEN: "Zahrada",
  ADVERTISEMENT: "Reklama",
  HIDDEN: "Skryté",
  OTHER: "Ostatní",
};

export function getCategoryLabel(category: string | null | undefined): string {
  if (category == null || category === "") return "Ostatní";
  const label = CATEGORY_LABELS[category];
  if (label) return label;
  return category.replaceAll("_", " ").toLowerCase().replaceAll(/\b\w/g, (c) => c.toUpperCase());
}
