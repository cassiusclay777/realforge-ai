import { getGoogleMapsApiKey } from "./google-client";
import type { Coordinates, NormalizedAddress } from "./types";

const GEOCODE_ENDPOINT = "https://maps.googleapis.com/maps/api/geocode/json";

interface GoogleAddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

interface GoogleGeocodeResult {
  formatted_address: string;
  geometry: {
    location: { lat: number; lng: number };
  };
  address_components: GoogleAddressComponent[];
}

interface GoogleGeocodeResponse {
  status: string;
  error_message?: string;
  results: GoogleGeocodeResult[];
}

function pickComponent(
  components: GoogleAddressComponent[],
  type: string
): GoogleAddressComponent | undefined {
  return components.find((c) => c.types.includes(type));
}

function buildNormalizedAddress(result: GoogleGeocodeResult): NormalizedAddress {
  const c = result.address_components ?? [];
  const street = pickComponent(c, "route")?.long_name;
  const houseNumber = pickComponent(c, "street_number")?.long_name;
  const city =
    pickComponent(c, "locality")?.long_name ??
    pickComponent(c, "postal_town")?.long_name ??
    pickComponent(c, "administrative_area_level_2")?.long_name;
  const district =
    pickComponent(c, "sublocality")?.long_name ??
    pickComponent(c, "sublocality_level_1")?.long_name ??
    pickComponent(c, "administrative_area_level_2")?.long_name;
  const postalCode = pickComponent(c, "postal_code")?.long_name;
  const country = pickComponent(c, "country")?.long_name;

  return {
    formatted: result.formatted_address,
    street,
    houseNumber,
    city,
    district,
    postalCode,
    country,
  };
}

/**
 * Geocode a Czech address using Google's Geocoding API.
 * Returns coordinates and a normalized address breakdown.
 * Throws when the geocoder returns no results or an error status.
 */
export async function geocodeAddress(
  address: string
): Promise<{ coordinates: Coordinates; address: NormalizedAddress }> {
  const trimmed = address?.trim();
  if (!trimmed) {
    throw new Error("Address is empty");
  }

  const apiKey = getGoogleMapsApiKey();
  const params = new URLSearchParams({
    address: trimmed,
    key: apiKey,
    region: "cz",
    language: "cs",
  });

  const url = `${GEOCODE_ENDPOINT}?${params.toString()}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
  if (!res.ok) {
    throw new Error(`Geocoding HTTP ${res.status}`);
  }

  const data = (await res.json()) as GoogleGeocodeResponse;

  if (data.status === "ZERO_RESULTS") {
    throw new Error(`No geocoding results for address: ${trimmed}`);
  }

  if (data.status !== "OK") {
    throw new Error(
      `Geocoding error: ${data.status}${data.error_message ? ` - ${data.error_message}` : ""}`
    );
  }

  if (!data.results?.length) {
    throw new Error(`No geocoding results for address: ${trimmed}`);
  }

  const top = data.results[0];
  const loc = top.geometry?.location;
  if (!loc || typeof loc.lat !== "number" || typeof loc.lng !== "number") {
    throw new Error("Geocoding returned no coordinates");
  }

  return {
    coordinates: { lat: loc.lat, lng: loc.lng },
    address: buildNormalizedAddress(top),
  };
}
