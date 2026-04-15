import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';
import { ensureListingOwnership } from '@/lib/api-listing-auth';

/**
 * PATCH /api/listings/[id]/media/[mediaId]
 * Aktualizuje aiCaption a altText u jednoho média (inline edit).
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; mediaId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Neautorizováno' }, { status: 401 });
    }

    const { id: listingId, mediaId } = await params;
    const auth = await ensureListingOwnership(listingId, session.user.id);
    if ("error" in auth) return auth.error;

    const body = await request.json().catch(() => ({}));
    const aiCaption = typeof body.aiCaption === 'string' ? body.aiCaption.trim() : null;

    const media = await prisma.listingMedia.findFirst({
      where: { id: mediaId, listingId },
    });
    if (!media) {
      return NextResponse.json({ error: 'Médium nenalezeno.' }, { status: 404 });
    }

    await prisma.listingMedia.update({
      where: { id: mediaId },
      data: {
        aiCaption: aiCaption ?? media.aiCaption,
        altText: aiCaption ?? media.altText ?? media.aiCaption,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PATCH media caption error:', error);
    return NextResponse.json(
      { error: 'Nepodařilo se uložit popisek.' },
      { status: 500 }
    );
  }
}
