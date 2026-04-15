import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';
import { ensureListingOwnership } from '@/lib/api-listing-auth';

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function getAbsoluteUrl(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const base =
    process.env.NEXTAUTH_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
    'http://localhost:3050';
  return url.startsWith('/') ? `${base}${url}` : `${base}/${url}`;
}

/**
 * GET /api/listings/[id]/sreality-xml
 * Export listingu jako XML pro Sreality (fotky včetně <foto_popis> z aiCaption/altText).
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Neautorizováno' }, { status: 401 });
    }

    const { id } = await params;
    const auth = await ensureListingOwnership(id, session.user.id);
    if ("error" in auth) return auth.error;

    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        media: {
          where: { processingStatus: 'DONE' },
          orderBy: { sortOrder: 'asc' },
          select: { url: true, aiCaption: true, altText: true, sortOrder: true },
        },
        aiResult: {
          select: { headline: true, shortDesc: true, longDesc: true },
        },
      },
    });

    if (!listing) {
      return NextResponse.json({ error: 'Listing nenalezen.' }, { status: 404 });
    }

    const desc =
      listing.aiResult?.longDesc ||
      listing.aiResult?.shortDesc ||
      listing.description ||
      listing.title;
    const fotky = listing.media.map((m) => {
      const caption = m.aiCaption || m.altText || '';
      const url = getAbsoluteUrl(m.url.startsWith('/') ? m.url : `/${m.url}`);
      return { url, foto_popis: caption };
    });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<inzerat xmlns="https://realforge.ai/sreality-export">
  <nazev>${escapeXml(listing.title)}</nazev>
  <adresa>${escapeXml(listing.address)}</adresa>
  <cena>${listing.price}</cena>
  <typ>${escapeXml(listing.type)}</typ>
  <popis>${escapeXml(desc)}</popis>
  <fotky>
${fotky.map((f) => `    <foto><url>${escapeXml(f.url)}</url><foto_popis>${escapeXml(f.foto_popis)}</foto_popis></foto>`).join('\n')}
  </fotky>
</inzerat>
`;

    const filename = `sreality-listing-${id}.xml`;
    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Sreality XML export error:', error);
    return NextResponse.json(
      { error: 'Export do Sreality XML selhal.' },
      { status: 500 }
    );
  }
}
