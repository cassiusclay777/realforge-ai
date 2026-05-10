import { geocodeAddress } from "./geocode";
import { buildAerialImageUrl, buildStreetMapUrl } from "./static-map";
import { getStreetViewImageUrl } from "./street-view";
import { findNearbyPlaces } from "./nearby";
import type {
  EnrichmentError,
  EnrichmentResult,
  NearbyPlaces,
} from "./types";

export * from "./types";
export { buildAerialImageUrl, buildStreetMapUrl } from "./static-map";

const EMPTY_NEARBY: NearbyPlaces = { schools: [], transit: [], shops: [] };

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

/**
 * Orchestrator: takes a Czech address and returns enriched data
 * (coordinates, normalized address, aerial image URL, Street View image URL,
 * and nearby POIs).
 *
 * Geocoding is required – if it fails, the call returns ok=false.
 * Other sources fail soft: their errors are captured in `errors` while
 * the rest of the result still returns whatever succeeded.
 */
export async function enrichFromAddress(
  address: string
): Promise<EnrichmentResult> {
  const errors: EnrichmentError[] = [];

  let geocoded: Awaited<ReturnType<typeof geocodeAddress>>;
  try {
    geocoded = await geocodeAddress(address);
  } catch (err) {
    errors.push({ source: "geocode", message: errorMessage(err) });
    return {
      ok: false,
      address: null,
      coordinates: null,
      aerialImageUrl: null,
      streetViewImageUrl: null,
      nearby: EMPTY_NEARBY,
      errors,
    };
  }

  const { coordinates, address: normalized } = geocoded;

  // Aerial URL is built synchronously – never throws unless the API key is missing.
  let aerialImageUrl: string | null = null;
  try {
    aerialImageUrl = buildAerialImageUrl(coordinates);
  } catch (err) {
    errors.push({ source: "aerial", message: errorMessage(err) });
  }

  const [streetViewSettled, nearbySettled] = await Promise.allSettled([
    getStreetViewImageUrl(coordinates),
    findNearbyPlaces(coordinates),
  ]);

  let streetViewImageUrl: string | null = null;
  if (streetViewSettled.status === "fulfilled") {
    streetViewImageUrl = streetViewSettled.value;
  } else {
    errors.push({
      source: "streetView",
      message: errorMessage(streetViewSettled.reason),
    });
  }

  let nearby: NearbyPlaces = EMPTY_NEARBY;
  if (nearbySettled.status === "fulfilled") {
    nearby = nearbySettled.value;
  } else {
    errors.push({
      source: "nearby",
      message: errorMessage(nearbySettled.reason),
    });
  }

  return {
    ok: true,
    address: normalized,
    coordinates,
    aerialImageUrl,
    streetViewImageUrl,
    nearby,
    errors,
  };
}
