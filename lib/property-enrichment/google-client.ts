/**
 * Shared helper for accessing the server-side Google Maps API key.
 * The key is restricted to: Geocoding, Maps Static, Street View Static,
 * and Places API (New). Never expose to the browser.
 */
export function getGoogleMapsApiKey(): string {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) {
    throw new Error("GOOGLE_MAPS_API_KEY not set in environment");
  }
  return key;
}
