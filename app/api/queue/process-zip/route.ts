import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';
import { imageProcessDeepSeekQueue } from '@/lib/queues';
import { ensureListingOwnership } from '@/lib/api-listing-auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Neautorizováno' }, { status: 401 });
    }

    const { listingId, zipUrl, title, price, address, type, area, rooms } = await request.json();

    if (listingId) {
      const auth = await ensureListingOwnership(listingId, session.user.id);
      if ('error' in auth) return auth.error;
    }

    const listing = listingId
      ? await prisma.listing.findUnique({ where: { id: listingId }, select: { createdById: true } })
      : null;
    const userId = listing?.createdById ?? undefined;

    console.log('🚀 Enqueueing DeepSeek job for listing:', listingId);

    const job = await imageProcessDeepSeekQueue.add('process-listing-deepseek', {
      listingId,
      zipUrl,
      title,
      price,
      address,
      type,
      area,
      rooms,
      userId,
    });

    return NextResponse.json({
      success: true,
      jobId: job.id,
      message: 'Job added to DeepSeek processing queue',
    });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    const details = err.message || (error as { code?: string })?.code || String(error).slice(0, 200);
    console.error('❌ Queue error:', error);
    return NextResponse.json({
      error: 'Failed to enqueue job',
      details: details || 'Redis may be unavailable. Start with: docker-compose up -d redis',
    }, { status: 500 });
  }
}
