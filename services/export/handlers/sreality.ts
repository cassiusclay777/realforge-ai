import { prisma } from "@/lib/prisma";
import { getApiKey } from "@/lib/integration-utils";

export interface ExportJobData {
  listingId: string;
  platform: string;
  officeId?: string;
}

export interface ExportResult {
  success: boolean;
  externalId?: string;
  url?: string;
  message: string;
  errors?: string[];
}

export async function publishToSreality(jobData: ExportJobData): Promise<ExportResult> {
  try {
    const { listingId, officeId } = jobData;

    // Get listing with all related data
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        createdBy: true,
        aiResult: true,
      },
    });

    if (!listing) {
      return {
        success: false,
        message: "Listing not found",
        errors: ["Listing not found in database"],
      };
    }

    const aiResults = listing.aiResult;
    if (!aiResults) {
      return {
        success: false,
        message: "AI results not generated yet",
        errors: ["AI content not available for this listing"],
      };
    }

    const userId = listing.createdById ?? "";
    const srealityToken =
      (userId ? await getApiKey("SREALITY", userId) : null) ??
      process.env.SREALITY_API_TOKEN ??
      process.env.SREALITY_API_KEY ??
      null;

    if (!srealityToken) {
      return {
        success: false,
        message: "Sreality API token not configured",
        errors: [
          "Missing Sreality API key in Integrations (Settings) or SREALITY_API_TOKEN / SREALITY_API_KEY in environment",
        ],
      };
    }

    // Prepare payload for Sreality API
    // Convert images from JSON string/array to array of URLs
    const images = listing.images ? 
      (Array.isArray(listing.images) ? listing.images : JSON.parse(listing.images as string)) : 
      [];
    
    const payload = {
      // Basic listing info
      title: aiResults?.headline || listing.title,
      description: aiResults?.shortDesc || `Property at ${listing.address}`,
      price: listing.price,
      currency: "CZK",
      
      // Property details
      property_type: mapPropertyType(listing.type),
      disposition: listing.rooms ? `${listing.rooms}+1` : undefined,
      area: listing.area || undefined,
      floor: undefined, // Not in PostgreSQL schema
      construction_year: undefined, // Not in PostgreSQL schema
      
      // Location
      address: listing.address,
      city: extractCity(listing.address),
      district: extractDistrict(listing.address),
      
      // Images - use first 12 images
      images: images.slice(0, 12).map((url: string, index: number) => ({
        url,
        order: index,
        is_main: index === 0,
      })),
      
      // Contact info - use default values
      contact: {
        name: "Real Estate Agent",
        email: "info@realforge.ai",
        phone: "+420 123 456 789",
      },
      
      // Metadata
      source: "REALFORGE_AI",
      source_id: listingId,
      created_at: listing.createdAt.toISOString(),
    };

    const apiResponse = await callSrealityApi(payload, srealityToken);

    if (!apiResponse.success) {
      await prisma.exportJob.create({
        data: {
          listingId,
          platform: "SREALITY",
          status: "FAILED",
          errors: apiResponse.message,
        },
      });
      return {
        success: false,
        message: apiResponse.message,
        errors: [apiResponse.message],
      };
    }

    await prisma.exportJob.create({
      data: {
        listingId,
        platform: "SREALITY",
        externalId: apiResponse.id,
        status: "SUCCESS",
        payload: payload as object,
      },
    });

    await prisma.listing.update({
      where: { id: listingId },
      data: { status: "ACTIVE" },
    });

    return {
      success: true,
      externalId: apiResponse.id,
      url: apiResponse.url,
      message: apiResponse.message,
    };

  } catch (error) {
    console.error("Sreality export error:", error);

    if (jobData.listingId) {
      try {
        await prisma.exportJob.create({
          data: {
            listingId: jobData.listingId,
            platform: "SREALITY",
            status: "FAILED",
            errors: error instanceof Error ? error.message : "Unknown error",
          },
        });
      } catch (_) {}
    }

    return {
      success: false,
      message: "Failed to publish to Sreality",
      errors: [error instanceof Error ? error.message : "Unknown error"],
    };
  }
}

// Helper functions
function mapPropertyType(type: string): string {
  const mapping: Record<string, string> = {
    APARTMENT: "flat",
    HOUSE: "house",
    LAND: "land",
    COMMERCIAL: "commercial",
    BYT: "flat",
    DUM: "house",
    POZEMEK: "land",
  };
  return mapping[type] || "other";
}

function extractCity(address: string): string {
  // Simple extraction - in production, use geocoding service
  const parts = address.split(",");
  return parts[parts.length - 1]?.trim() || "Prague";
}

function extractDistrict(address: string): string {
  // Extract district from address (e.g., "Praha 4" -> "4")
  const match = address.match(/Praha\s*(\d+)/i);
  return match ? match[1] : "1";
}

export interface SrealityApiResponse {
  success: boolean;
  id?: string;
  url?: string;
  message: string;
  warnings?: string[];
}

/** Real Sreality partner API call. */
export async function callSrealityApi(
  payload: Record<string, unknown>,
  token: string
): Promise<SrealityApiResponse> {
  try {
    const apiUrl =
      process.env.SREALITY_API_URL?.trim() ||
      "https://partner.sreality.cz/api/v1/listing";
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;

    if (!response.ok) {
      const message =
        (data.message as string) ||
        (data.error as string) ||
        `Sreality API ${response.status}: ${response.statusText}`;
      return {
        success: false,
        id: undefined,
        url: undefined,
        message,
        warnings: Array.isArray(data.warnings) ? (data.warnings as string[]) : [],
      };
    }

    return {
      success: true,
      id: (data.id as string) ?? `sreality_${Date.now()}`,
      url:
        (data.url as string) ??
        `https://www.sreality.cz/detail/${String(payload.property_type ?? "flat")}/prodej/${String(payload.city ?? "praha").toLowerCase()}/${Date.now()}`,
      message: (data.message as string) ?? "Listing created successfully",
      warnings: Array.isArray(data.warnings) ? (data.warnings as string[]) : [],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Sreality API call failed:", error);
    return {
      success: false,
      message,
      warnings: [],
    };
  }
}

/** @deprecated Use callSrealityApi. Kept for backwards compatibility. */
export const simulateSrealityApiCall = callSrealityApi;