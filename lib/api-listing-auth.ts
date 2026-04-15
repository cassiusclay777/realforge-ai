import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Ověří, že listing existuje a že jej smí upravovat přihlášený uživatel (createdById === userId).
 * Vrací { listing } nebo { error: NextResponse }.
 */
export async function ensureListingOwnership(
  listingId: string,
  userId: string
): Promise<
  | { listing: { id: string; createdById: string | null } }
  | { error: NextResponse }
> {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { id: true, createdById: true },
  });
  if (!listing) {
    return { error: NextResponse.json({ error: 'Listing nenalezen.' }, { status: 404 }) };
  }
  if (listing.createdById !== userId) {
    return {
      error: NextResponse.json(
        { error: 'Nemáte oprávnění k tomuto listingu.' },
        { status: 403 }
      ),
    };
  }
  return { listing };
}
