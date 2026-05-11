import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { enrichFromAddress } from "@/lib/property-enrichment";

const MAX_ADDRESS_LENGTH = 500;

/**
 * POST /api/enrichment/from-address
 *
 * Body: { address: string }
 * Response (200): EnrichmentResult — coords, normalized address, image URLs, nearby POIs.
 * Errors:
 *   400 — missing/invalid/too-long address
 *   401 — not authenticated
 *   500 — unexpected server error
 *
 * Note: even when EnrichmentResult.ok = false (e.g. address not found),
 * the HTTP status is still 200 — the body explains what failed via `errors[]`.
 * Only true server errors (missing API key, network down) return 5xx.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Neautorizováno" },
        { status: 401 },
      );
    }

    let body: { address?: unknown };
    try {
      body = (await request.json()) as { address?: unknown };
    } catch {
      return NextResponse.json(
        { error: "Neplatný JSON v těle požadavku." },
        { status: 400 },
      );
    }

    const raw = body?.address;
    if (typeof raw !== "string") {
      return NextResponse.json(
        { error: "Chybí pole 'address' (string)." },
        { status: 400 },
      );
    }

    const address = raw.trim();
    if (!address) {
      return NextResponse.json(
        { error: "Adresa nesmí být prázdná." },
        { status: 400 },
      );
    }
    if (address.length > MAX_ADDRESS_LENGTH) {
      return NextResponse.json(
        { error: `Adresa je příliš dlouhá (max ${MAX_ADDRESS_LENGTH} znaků).` },
        { status: 400 },
      );
    }

    const result = await enrichFromAddress(address);
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error("Enrichment endpoint error:", err);
    return NextResponse.json(
      {
        error: "Enrichment selhal.",
        details: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
