import { getGoogleMapsApiKey } from "./google-client";
import type { Coordinates } from "./types";

const STATIC_MAP_ENDPOINT = "https://maps.googleapis.com/maps/api/staticmap";

const DEFAULT_SIZE = "1280x720";

function buildUrl(coords: Coordinates, params: Record<string, string>): string {
  const apiKey = getGoogleMapsApiKey();
  const center = `${coords.lat},${coords.lng}`;
  const search = new URLSearchParams({
    center,
    size: DEFAULT_SIZE,
    markers: `color:red|${center}`,
    key: apiKey,
    ...params,
  });
  return `${STATIC_MAP_ENDPOINT}?${search.toString()}`;
}

/**
 * Build a satellite (aerial) image URL for the given coordinates.
 * The URL can be used directly in <img src=> – Google serves the image
 * on demand, no need to fetch server-side.
 */
export function buildAerialImageUrl(coords: Coordinates): string {
  return buildUrl(coords, {
    zoom: "18",
    maptype: "satellite",
  });
}

/**
 * Build a street-map (roadmap) image URL for the given coordinates.
 * Useful as a wider-context map alongside the aerial photo.
 */
export function buildStreetMapUrl(coords: Coordinates): string {
  return buildUrl(coords, {
    zoom: "15",
    maptype: "roadmap",
  });
}
