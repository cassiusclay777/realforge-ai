import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../geocode", () => ({
  geocodeAddress: vi.fn(),
}));

vi.mock("../street-view", () => ({
  getStreetViewImageUrl: vi.fn(),
}));

vi.mock("../nearby", () => ({
  findNearbyPlaces: vi.fn(),
}));

import { enrichFromAddress } from "../index";
import { geocodeAddress } from "../geocode";
import { getStreetViewImageUrl } from "../street-view";
import { findNearbyPlaces } from "../nearby";

const mockedGeocode = geocodeAddress as unknown as ReturnType<typeof vi.fn>;
const mockedStreetView = getStreetViewImageUrl as unknown as ReturnType<typeof vi.fn>;
const mockedNearby = findNearbyPlaces as unknown as ReturnType<typeof vi.fn>;

const COORDS = { lat: 48.855, lng: 16.048 };
const NORMALIZED = {
  formatted: "Pražská 12, 669 02 Znojmo, Česko",
  street: "Pražská",
  houseNumber: "12",
  city: "Znojmo",
  postalCode: "669 02",
  country: "Česko",
};

describe("enrichFromAddress", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GOOGLE_MAPS_API_KEY = "test-google-key";
  });

  it("returns full enrichment when all sources succeed", async () => {
    mockedGeocode.mockResolvedValue({
      coordinates: COORDS,
      address: NORMALIZED,
    });
    mockedStreetView.mockResolvedValue("https://example.com/streetview.jpg");
    mockedNearby.mockResolvedValue({
      schools: [
        { name: "ZŠ Pražská", type: "school", distance_m: 250, address: "..." },
      ],
      transit: [
        { name: "Znojmo, AN", type: "bus_station", distance_m: 400 },
      ],
      shops: [
        { name: "Albert", type: "supermarket", distance_m: 350 },
      ],
    });

    const result = await enrichFromAddress("Pražská 12, Znojmo");

    expect(result.ok).toBe(true);
    expect(result.address).toEqual(NORMALIZED);
    expect(result.coordinates).toEqual(COORDS);
    expect(result.aerialImageUrl).toContain("maptype=satellite");
    expect(result.aerialImageUrl).toContain("center=48.855%2C16.048");
    expect(result.streetViewImageUrl).toBe("https://example.com/streetview.jpg");
    expect(result.nearby.schools).toHaveLength(1);
    expect(result.nearby.transit).toHaveLength(1);
    expect(result.nearby.shops).toHaveLength(1);
    expect(result.errors).toEqual([]);
  });

  it("returns ok=false when geocoding fails", async () => {
    mockedGeocode.mockRejectedValue(new Error("No geocoding results"));

    const result = await enrichFromAddress("blah blah");

    expect(result.ok).toBe(false);
    expect(result.address).toBeNull();
    expect(result.coordinates).toBeNull();
    expect(result.aerialImageUrl).toBeNull();
    expect(result.streetViewImageUrl).toBeNull();
    expect(result.nearby).toEqual({ schools: [], transit: [], shops: [] });
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].source).toBe("geocode");
    expect(result.errors[0].message).toMatch(/No geocoding results/);

    // Other sources must not be invoked when geocoding fails.
    expect(mockedStreetView).not.toHaveBeenCalled();
    expect(mockedNearby).not.toHaveBeenCalled();
  });

  it("captures partial failures but still returns successful sources", async () => {
    mockedGeocode.mockResolvedValue({
      coordinates: COORDS,
      address: NORMALIZED,
    });
    mockedStreetView.mockRejectedValue(new Error("Street View boom"));
    mockedNearby.mockResolvedValue({
      schools: [
        { name: "Gymnázium", type: "secondary_school", distance_m: 800 },
      ],
      transit: [],
      shops: [],
    });

    const result = await enrichFromAddress("Pražská 12, Znojmo");

    expect(result.ok).toBe(true);
    expect(result.coordinates).toEqual(COORDS);
    expect(result.aerialImageUrl).toContain("staticmap");
    expect(result.streetViewImageUrl).toBeNull();
    expect(result.nearby.schools).toHaveLength(1);

    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].source).toBe("streetView");
    expect(result.errors[0].message).toMatch(/Street View boom/);
  });

  it("handles street view returning null (no imagery) without an error entry", async () => {
    mockedGeocode.mockResolvedValue({
      coordinates: COORDS,
      address: NORMALIZED,
    });
    mockedStreetView.mockResolvedValue(null);
    mockedNearby.mockResolvedValue({ schools: [], transit: [], shops: [] });

    const result = await enrichFromAddress("Pražská 12, Znojmo");

    expect(result.ok).toBe(true);
    expect(result.streetViewImageUrl).toBeNull();
    expect(result.errors).toEqual([]);
  });

  it("captures both partial failures when street view and nearby both fail", async () => {
    mockedGeocode.mockResolvedValue({
      coordinates: COORDS,
      address: NORMALIZED,
    });
    mockedStreetView.mockRejectedValue(new Error("sv fail"));
    mockedNearby.mockRejectedValue(new Error("nearby fail"));

    const result = await enrichFromAddress("Pražská 12, Znojmo");

    expect(result.ok).toBe(true);
    expect(result.coordinates).toEqual(COORDS);
    expect(result.errors.map((e) => e.source).sort()).toEqual([
      "nearby",
      "streetView",
    ]);
    expect(result.nearby).toEqual({ schools: [], transit: [], shops: [] });
  });
});
