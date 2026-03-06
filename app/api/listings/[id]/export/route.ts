import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import AdmZip from 'adm-zip';

function getAbsoluteUrl(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const base =
    process.env.NEXTAUTH_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
    'http://localhost:3001';
  return url.startsWith('/') ? `${base}${url}` : `${base}/${url}`;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        media: {
          orderBy: { sortOrder: 'asc' },
          select: { id: true, url: true, originalName: true, sortOrder: true },
        },
      },
    });

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    if (listing.media.length === 0) {
      return NextResponse.json(
        { error: 'No media files to export' },
        { status: 400 }
      );
    }

    const zip = new AdmZip();

    for (let i = 0; i < listing.media.length; i++) {
      const m = listing.media[i];
      const absoluteUrl = getAbsoluteUrl(m.url);
      try {
        const res = await fetch(absoluteUrl, { cache: 'no-store' });
        if (!res.ok) continue;
        const buf = Buffer.from(await res.arrayBuffer());
        const ext = m.originalName.includes('.') ? m.originalName.split('.').pop() : 'jpg';
        const name = m.originalName || `media-${i + 1}.${ext}`;
        zip.addFile(name.replaceAll(/[^a-zA-Z0-9._-]/g, '_'), buf);
      } catch {
        // skip failed file
      }
    }

    const zipBuffer = zip.toBuffer();
    const filename = `listing-${id}-media.zip`;

    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(zipBuffer.length),
      },
    });
  } catch (error) {
    console.error('Export media error:', error);
    return NextResponse.json(
      { error: 'Failed to export media' },
      { status: 500 }
    );
  }
}
