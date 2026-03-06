/**
 * Bezpečné parsování čísel pro API validaci.
 * Zabraňuje NaN a neplatným hodnotám.
 */

export const DEFAULT_LIMIT = 10
export const MAX_LIMIT = 100

export function parsePositiveInt(
  value: unknown,
  defaultValue?: number
): number | null {
  if (value == null || value === "") return defaultValue ?? null
  if (typeof value === "object") return defaultValue ?? null
  const num = typeof value === "number" ? value : Number.parseInt(String(value), 10)
  if (Number.isNaN(num)) return defaultValue ?? null
  return num > 0 ? num : defaultValue ?? null
}

export function parseNonNegativeInt(
  value: unknown,
  defaultValue?: number
): number | null {
  if (value == null || value === "") return defaultValue ?? null
  if (typeof value === "object") return defaultValue ?? null
  const num = typeof value === "number" ? value : Number.parseInt(String(value), 10)
  if (Number.isNaN(num)) return defaultValue ?? null
  return num >= 0 ? num : defaultValue ?? null
}

export function clampLimit(parsed: number): number {
  return Math.min(MAX_LIMIT, Math.max(1, parsed))
}
