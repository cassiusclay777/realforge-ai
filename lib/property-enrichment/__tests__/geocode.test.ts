import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { geocodeAddress } from "../geocode";

const ORIGINAL_FETCH = globalThis.fetch;

function mockFetchOnce(payload: unknown, ok = true, status = 200): void {
  const fn = vi.fn().mockResolvedValue({
    ok,
    status,
    json: async () => payload,
  });
  globalThis.fetch = fn as unknown as typeof fetch;
}

describe("geocodeAddress", () => {
  beforeEach(() => {
    process.env.GOOGLE_MAPS_API_KEY = "test-google-key";
  });

  afterEach(() => {
    globalThis.fetch = ORIGINAL_FETCH;
    vi.restoreAllMocks();
  });

  it("returns coordinates and a normalized address on success", async () => {
    const fakeResponse = {
      status: "OK",
      results: [
        {
          formatted_address: "Pražská 12, 669 02 Znojmo, Česko",
          geometry: { location: { lat: 48.855, lng: 16.048 } },
          address_components: [
            { long_name: "12", short_name: "12", types: ["street_number"] },
            { long_name: "Pražská", short_name: "Pražská", types: ["route"] },
            { long_name: "Znojmo", short_name: "Znojmo", types: ["locality", "political"] },
            {
              long_name: "okres Znojmo",
              short_name: "okres Znojmo",
              types: ["administrative_area_level_2", "political"],
            },
            { long_name: "669 02", short_name: "669 02", types: ["postal_code"] },
            { long_name: "Česko", short_name: "CZ", types: ["country", "political"] },
          ],
        },
      ],
    };

    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => fakeResponse,
    });
    globalThis.fetch = fetchSpy as unknown as typeof fetch;

    const result = await geocodeAddress("Pražská 12, Znojmo");

    expect(result.coordinates).toEqual({ lat: 48.855, lng: 16.048 });
    expect(result.address.formatted).toBe("Pražská 12, 669 02 Znojmo, Česko");
    expect(result.address.street).toBe("Pražská");
    expect(result.address.houseNumber).toBe("12");
    expect(result.address.city).toBe("Znojmo");
    expect(result.address.postalCode).toBe("669 02");
    expect(result.address.country).toBe("Česko");

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const calledUrl = fetchSpy.mock.calls[0][0] as string;
    expect(calledUrl).toContain("https://maps.googleapis.com/maps/api/geocode/json");
    expect(calledUrl).toContain("address=Pra%C5%BEsk%C3%A1+12%2C+Znojmo");
    expect(calledUrl).toContain("key=test-google-key");
    expect(calledUrl).toContain("region=cz");
    expect(calledUrl).toContain("language=cs");
  });

  it("throws when the geocoder returns ZERO_RESULTS", async () => {
    mockFetchOnce({ status: "ZERO_RESULTS", results: [] });

    await expect(geocodeAddress("nonexistent street, nowhere")).rejects.toThrow(
      /No geocoding results/i
    );
  });

  it("throws when the API returns a non-OK status", async () => {
    mockFetchOnce({
      status: "REQUEST_DENIED",
      error_message: "Invalid key",
      results: [],
    });

    await expect(geocodeAddress("Pražská 12")).rejects.toThrow(/REQUEST_DENIED/);
  });

  it("throws on empty input without calling fetch", async () => {
    const fetchSpy = vi.fn();
    globalThis.fetch = fetchSpy as unknown as typeof fetch;

    await expect(geocodeAddress("   ")).rejects.toThrow(/empty/i);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("throws when the API key env var is missing", async () => {
    delete process.env.GOOGLE_MAPS_API_KEY;
    await expect(geocodeAddress("Pražská 12")).rejects.toThrow(
      /GOOGLE_MAPS_API_KEY/
    );
  });
});
