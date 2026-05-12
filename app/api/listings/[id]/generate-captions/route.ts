import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';
import { generatePhotoCaption } from '@/lib/caption-generator';
import { getDeepSeekApiKey } from '@/lib/integration-utils';
import path from 'path';

const CONCURRENCY = 5;

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/**
 * POST /api/listings/[id]/generate-captions
 * Vygeneruje popisky (caption + altText) pro všechny fotky listingu, které je ještě nemají.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: listingId } = await params;
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        media: {
          where: {
            OR: [
              { aiCaption: null },
              { aiCaption: '' },
            ],
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    const mediaWithoutCaption = listing.media;
    if (mediaWithoutCaption.length === 0) {
      return NextResponse.json({
        success: true,
        generated: 0,
        message: 'Všechny fotky již mají popisek.',
      });
    }

    const apiKey = await getDeepSeekApiKey(session.user.id);
    if (!apiKey) {
      return NextResponse.json(
        { error: 'DeepSeek API klíč není nakonfigurován. Nastavte ho v Nastavení > Integrace.' },
        { status: 400 }
      );
    }

    let generated = 0;
    const chunks = chunk(mediaWithoutCaption, CONCURRENCY);

    const uploadsBase = path.resolve(process.cwd(), 'public', 'uploads');

    for (const batch of chunks) {
      await Promise.all(
        batch.map(async (media) => {
          const urlPath = media.url.startsWith('/') ? media.url.slice(1) : media.url;
          const fullPath = path.resolve(process.cwd(), 'public', urlPath);
          if (!fullPath.startsWith(uploadsBase)) return;

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
