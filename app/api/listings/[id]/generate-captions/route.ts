import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';
import { generatePhotoCaption } from '@/lib/caption-generator';
import { ensureListingOwnership } from '@/lib/api-listing-auth';
import path from 'path';

const CONCURRENCY = 5;

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/**
 * POST /api/listings/[id]/generate-captions
 * Vygeneruje popisky (caption + altText) pro fotky listingu.
 * ?force=true = přegenerovat i fotky, které už popisek mají.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Neautorizováno' }, { status: 401 });
    }

    const { id: listingId } = await params;
    const auth = await ensureListingOwnership(listingId, session.user.id);
    if ("error" in auth) return auth.error;

    const force = request.nextUrl.searchParams.get('force') === 'true';

    const mediaWhere = force
      ? undefined
      : { OR: [{ aiCaption: null }, { aiCaption: "" }] };
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        media: {
          ...(mediaWhere !== undefined && { where: mediaWhere }),
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!listing) {
      return NextResponse.json({ error: 'Listing nenalezen.' }, { status: 404 });
    }

    const mediaWithoutCaption = listing.media;
    if (mediaWithoutCaption.length === 0) {
      return NextResponse.json({
        success: true,
        generated: 0,
        message: 'Všechny fotky již mají popisek.',
      });
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'DEEPSEEK_API_KEY není nastaven.' },
        { status: 500 }
      );
    }

    let generated = 0;
    const chunks = chunk(mediaWithoutCaption, CONCURRENCY);

    for (const batch of chunks) {
      await Promise.all(
        batch.map(async (media) => {
          const urlPath = media.url.startsWith('/') ? media.url : `/${media.url}`;
          const fullPath = path.join(process.cwd(), 'public', urlPath);

          try {
            const caption = await generatePhotoCaption(fullPath, {
              apiKey,
              maxRetries: 2,
            });
            if (caption) {
              await prisma.listingMedia.update({
                where: { id: media.id },
                data: { aiCaption: caption, altText: caption },
              });
              generated++;
            }
          } catch {
            // Jedna fotka selhala – nepřerušujeme celý batch
          }
        })
      );
    }

    return NextResponse.json({
      success: true,
      generated,
      total: mediaWithoutCaption.length,
      message: `Vygenerováno ${generated} popisků.`,
    });
  } catch (error) {
    console.error('Generate captions error:', error);
    return NextResponse.json(
      { error: 'Nepodařilo se vygenerovat popisky.' },
      { status: 500 }
    );
  }
}
