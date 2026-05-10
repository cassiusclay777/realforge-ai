import { getGoogleMapsApiKey } from "./google-client";
import type { Coordinates } from "./types";

const STREETVIEW_METADATA_ENDPOINT =
  "https://maps.googleapis.com/maps/api/streetview/metadata";
const STREETVIEW_IMAGE_ENDPOINT =
  "https://maps.googleapis.com/maps/api/streetview";

interface StreetViewMetadata {
  status: string;
}

/**
 * Returns a Street View image URL for the coordinates, or null when no
 * Street View imagery exists at that location.
 *
 * The metadata endpoint is free and lets us avoid embedding a "no imagery"
 * placeholder image in the UI.
 */
export async function getStreetViewImageUrl(
  coords: Coordinates
): Promise<string | null> {
  const apiKey = getGoogleMapsApiKey();
  const location = `${coords.lat},${coords.lng}`;

  const metadataParams = new URLSearchParams({
    location,
    key: apiKey,
  });

  const metadataRes = await fetch(
    `${STREETVIEW_METADATA_ENDPOINT}?${metadataParams.toString()}`,
    { signal: AbortSignal.timeout(8_000) }
  );

  if (!metadataRes.ok) {
    throw new Error(`Street View metadata HTTP ${metadataRes.status}`);
  }

  const metadata = (await metadataRes.json()) as StreetViewMetadata;
  if (metadata.status !== "OK") {
    return null;
  }

  const imageParams = new URLSearchParams({
    size: "1280x720",
    location,
    fov: "80",
    pitch: "0",
    key: apiKey,
  });

  return `${STREETVIEW_IMAGE_ENDPOINT}?${imageParams.toString()}`;
}
