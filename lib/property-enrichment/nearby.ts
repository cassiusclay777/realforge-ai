import { getGoogleMapsApiKey } from "./google-client";
import type { Coordinates, NearbyPlace, NearbyPlaces } from "./types";

const PLACES_NEARBY_ENDPOINT =
  "https://places.googleapis.com/v1/places:searchNearby";

const FIELD_MASK =
  "places.displayName,places.types,places.location,places.formattedAddress";

const SEARCH_RADIUS_METERS = 1000;
const MAX_RESULTS_PER_TYPE = 5;

const SCHOOL_TYPES = ["school", "primary_school", "secondary_school"];
const TRANSIT_TYPES = ["bus_station", "train_station", "transit_station"];
const SHOP_TYPES = ["supermarket", "grocery_store", "convenience_store"];

interface PlacesApiResponse {
  places?: Array<{
    displayName?: { text?: string };
    types?: string[];
    location?: { latitude?: number; longitude?: number };
    formattedAddress?: string;
  }>;
}

/**
 * Haversine distance between two coordinates in meters.
 */
function haversineDistance(a: Coordinates, b: Coordinates): number {
  const R = 6_371_000; // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h =
    sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
  return Math.round(2 * R * Math.asin(Math.min(1, Math.sqrt(h))));
}

function pickPrimaryType(types: string[] | undefined, included: string[]): string {
  if (!types?.length) return included[0];
  const match = types.find((t) => included.includes(t));
  return match ?? types[0];
}

async function searchNearbyByTypes(
  coords: Coordinates,
  includedTypes: string[]
): Promise<NearbyPlace[]> {
  const apiKey = getGoogleMapsApiKey();

  const body = {
    includedTypes,
    maxResultCount: MAX_RESULTS_PER_TYPE,
    locationRestriction: {
      circle: {
        center: { latitude: coords.lat, longitude: coords.lng },
        radius: SEARCH_RADIUS_METERS,
      },
    },
  };

  const res = await fetch(PLACES_NEARBY_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": FIELD_MASK,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Places API HTTP ${res.status}${text ? `: ${text}` : ""}`);
  }

  const data = (await res.json()) as PlacesApiResponse;
  const places = data.places ?? [];

  const mapped: NearbyPlace[] = places
    .map((p) => {
      const lat = p.location?.latitude;
      const lng = p.location?.longitude;
      const distance_m =
        typeof lat === "number" && typeof lng === "number"
          ? haversineDistance(coords, { lat, lng })
          : Number.MAX_SAFE_INTEGER;

      return {
        name: p.displayName?.text ?? "Neznámé místo",
        type: pickPrimaryType(p.types, includedTypes),
        distance_m,
        address: p.formattedAddress,
      };
    })
    .sort((a, b) => a.distance_m - b.distance_m)
    .slice(0, MAX_RESULTS_PER_TYPE);

  return mapped;
}

/**
 * Find nearby points of interest around the given coordinates.
 * Runs three Places API (New) calls in parallel: schools, transit, shops.
 */
export async function findNearbyPlaces(
  coords: Coordinates
): Promise<NearbyPlaces> {
  const [schools, transit, shops] = await Promise.all([
    searchNearbyByTypes(coords, SCHOOL_TYPES),
    searchNearbyByTypes(coords, TRANSIT_TYPES),
    searchNearbyByTypes(coords, SHOP_TYPES),
  ]);

  return { schools, transit, shops };
}
