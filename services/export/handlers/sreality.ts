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
        media: {
          where: { isHidden: false },
          orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }],
          take: 12,
          select: { url: true, aiCaption: true, altText: true, isFeatured: true },
        },
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

    // Build base URL for absolute image links
    const appBaseUrl = (process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000').replace(/\/$/, '');

    // Prefer processed media from vision pipeline; fall back to legacy images JSON
    const mediaImages = listing.media.length > 0
      ? listing.media.map((m, i) => ({
          url: m.url.startsWith('http') ? m.url : `${appBaseUrl}${m.url}`,
          order: i,
          is_main: i === 0 || m.isFeatured,
          alt: m.altText ?? m.aiCaption ?? undefined,
        }))
      : (() => {
          const raw = listing.images;
          const urls: string[] = Array.isArray(raw) ? (raw as string[]) : (typeof raw === 'string' ? JSON.parse(raw || '[]') : []);
          return urls.slice(0, 12).map((url: string, i: number) => ({
            url: url.startsWith('http') ? url : `${appBaseUrl}${url}`,
            order: i,
            is_main: i === 0,
          }));
        })();

    const payload = {
      title: aiResults?.headline || listing.title,
      description: aiResults?.longDesc || aiResults?.shortDesc || `Nemovitost na adrese ${listing.address}`,
      price: listing.price,
      currency: "CZK",

      property_type: mapPropertyType(listing.type),
      disposition: listing.rooms ? `${listing.rooms}+1` : undefined,
      area: listing.area || undefined,

      address: listing.address,
      city: extractCity(listing.address),
      district: extractDistrict(listing.address),

      images: mediaImages,

      contact: {
        name: listing.createdBy?.name ?? "Realitní makléř",
        email: listing.createdBy?.email ?? process.env.DEFAULT_AGENT_EMAIL ?? "info@realforge.ai",
        phone: listing.createdBy?.phone ?? process.env.DEFAULT_AGENT_PHONE ?? "",
      },

      seo_title: aiResults?.seoTitle ?? undefined,
      seo_description: aiResults?.seoDescription ?? undefined,

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
    // Czech aliases just in case
    BYT: "flat",
    DUM: "house",
    POZEMEK: "land",
  };
  return mapping[type.toUpperCase()] ?? "other";
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
    const response = await fetch("https://partner.sreality.cz/api/v1/listing", {
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