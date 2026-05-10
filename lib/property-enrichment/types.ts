/**
 * Type definitions for the property enrichment module.
 * Used by the "auto-fill from address" feature: agent enters a Czech
 * address and we return GPS, normalized address, map images and POIs.
 */

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface NormalizedAddress {
  /** Full one-line formatted address as returned by the geocoder. */
  formatted: string;
  street?: string;
  houseNumber?: string;
  city?: string;
  /** Městská část / okres. */
  district?: string;
  postalCode?: string;
  country?: string;
}

export interface NearbyPlace {
  name: string;
  /** Place type, e.g. "school", "transit_station", "supermarket". */
  type: string;
  distance_m: number;
  address?: string;
}

export interface NearbyPlaces {
  schools: NearbyPlace[];
  transit: NearbyPlace[];
  shops: NearbyPlace[];
}

export interface EnrichmentError {
  /** Source name, e.g. "geocode", "streetView", "nearby". */
  source: string;
  message: string;
}

export interface EnrichmentResult {
  ok: boolean;
  address: NormalizedAddress | null;
  coordinates: Coordinates | null;
  /** Signed URL we can <img src=> directly. */
  aerialImageUrl: string | null;
  /** Same – exterior photo. May be null when no Street View at this point. */
  streetViewImageUrl: string | null;
  nearby: NearbyPlaces;
  /** Partial failures – populated even when ok=true. */
  errors: EnrichmentError[];
}
