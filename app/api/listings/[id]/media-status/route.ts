import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';
import { ensureListingOwnership } from '@/lib/api-listing-auth';

export async function GET(
  request: NextRequest,
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

    // Získání listingu s médii
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        media: {
          select: {
            id: true,
            url: true,
            category: true,
            processingStatus: true,
            processedAt: true,
            aiDescription: true,
            aiCaption: true,
            isFeatured: true,
            sortOrder: true,
          },
          orderBy: {
            sortOrder: 'asc'
          }
        },
        _count: {
          select: {
            media: true
          }
        }
      }
    });

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing nenalezen.' },
        { status: 404 }
      );
    }

    // Analýza stavu médií
    const media = listing.media;
    const totalMedia = listing._count.media;
    
    // Spočítat stavy
    const statusCounts = {
      QUEUED: 0,
      PROCESSING: 0,
      DONE: 0,
      FAILED: 0,
      UNKNOWN: 0
    };

    media.forEach(item => {
      const status = item.processingStatus || 'UNKNOWN';
      statusCounts[status as keyof typeof statusCounts] = 
        (statusCounts[status as keyof typeof statusCounts] || 0) + 1;
    });

    // Určit celkový stav
    let overallStatus: 'IDLE' | 'QUEUED' | 'PROCESSING' | 'DONE' | 'FAILED' | 'PARTIAL' = 'IDLE';
    let progress = 0;
    
    if (totalMedia === 0) {
      overallStatus = 'IDLE';
      progress = 0;
    } else if (statusCounts.DONE === totalMedia) {
      overallStatus = 'DONE';
      progress = 100;
    } else if (statusCounts.FAILED === totalMedia) {
      overallStatus = 'FAILED';
      progress = 0;
    } else if (statusCounts.PROCESSING > 0) {
      overallStatus = 'PROCESSING';
      // Výpočet průběhu - DONE + PROCESSING count jako progress
      progress = Math.round((statusCounts.DONE / totalMedia) * 100);
    } else if (statusCounts.QUEUED > 0) {
      overallStatus = 'QUEUED';
      progress = 0;
    } else if (statusCounts.DONE > 0 && statusCounts.DONE < totalMedia) {
      overallStatus = 'PARTIAL';
      progress = Math.round((statusCounts.DONE / totalMedia) * 100);
    }

    // Získat poslední aktualizaci
    const lastUpdated = media.length > 0 
      ? Math.max(...media.map(m => m.processedAt ? new Date(m.processedAt).getTime() : 0))
      : null;

    return NextResponse.json({
      success: true,
      data: {
        listingId: id,
        overallStatus,
        progress,
        totalMedia,
        statusCounts,
        media: media.map(item => ({
          id: item.id,
          url: item.url,
          category: item.category,
          status: item.processingStatus || 'UNKNOWN',
          processedAt: item.processedAt,
          aiDescription: item.aiDescription,
          aiCaption: item.aiCaption,
          isFeatured: item.isFeatured,
          sortOrder: item.sortOrder,
        })),
        lastUpdated: lastUpdated ? new Date(lastUpdated).toISOString() : null,
        timestamp: new Date().toISOString(),
      }
    });
  } catch (error) {
    console.error('Error fetching media status:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch media status',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}