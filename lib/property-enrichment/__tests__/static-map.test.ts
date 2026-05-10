import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { buildAerialImageUrl, buildStreetMapUrl } from "../static-map";

describe("static-map URL builders", () => {
  beforeEach(() => {
    process.env.GOOGLE_MAPS_API_KEY = "test-google-key";
  });

  afterEach(() => {
    // No-op – kept for symmetry.
  });

  it("buildAerialImageUrl includes coords, satellite type, zoom 18 and size", () => {
    const url = buildAerialImageUrl({ lat: 48.855, lng: 16.048 });

    expect(url).toContain("https://maps.googleapis.com/maps/api/staticmap");
    expect(url).toContain("center=48.855%2C16.048");
    expect(url).toContain("zoom=18");
    expect(url).toContain("size=1280x720");
    expect(url).toContain("maptype=satellite");
    expect(url).toContain("markers=color%3Ared%7C48.855%2C16.048");
    expect(url).toContain("key=test-google-key");
  });

  it("buildStreetMapUrl uses roadmap maptype and zoom 15", () => {
    const url = buildStreetMapUrl({ lat: 50.0755, lng: 14.4378 });

    expect(url).toContain("https://maps.googleapis.com/maps/api/staticmap");
    expect(url).toContain("center=50.0755%2C14.4378");
    expect(url).toContain("zoom=15");
    expect(url).toContain("maptype=roadmap");
    expect(url).toContain("size=1280x720");
    expect(url).toContain("key=test-google-key");
  });

  it("throws when the API key env var is missing", () => {
    delete process.env.GOOGLE_MAPS_API_KEY;
    expect(() => buildAerialImageUrl({ lat: 0, lng: 0 })).toThrow(
      /GOOGLE_MAPS_API_KEY/
    );
  });
});
