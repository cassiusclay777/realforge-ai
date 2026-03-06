import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { imageProcessDeepSeekQueue } from '@/lib/queues';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Získání listingu
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        media: {
          select: {
            id: true,
            processingStatus: true,
          },
          take: 1
        }
      }
    });

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    // Kontrola, zda již neprobíhá zpracování
    const hasProcessingMedia = listing.media.some(
      media => media.processingStatus === 'PROCESSING' || media.processingStatus === 'QUEUED'
    );

    if (hasProcessingMedia) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Processing already in progress',
          message: 'Media processing is already running for this listing'
        },
        { status: 400 }
      );
    }

    const zipUrl = listing.sourceZipUrl;
    if (!zipUrl) {
      return NextResponse.json(
        { 
          success: false,
          error: 'No ZIP uploaded for this listing',
          message: 'Upload a ZIP file first via the upload page, then process media.'
        },
        { status: 400 }
      );
    }

    const userId = listing.createdById ?? undefined;
    const job = await imageProcessDeepSeekQueue.add('process-listing-media', {
      listingId: id,
      zipUrl,
      title: listing.title,
      price: listing.price,
      address: listing.address,
      type: listing.type,
      area: listing.area,
      rooms: listing.rooms,
      trigger: 'manual',
      userId,
    });

    // Aktualizace stavu médií na QUEUED (pokud nějaká existují)
    await prisma.listingMedia.updateMany({
      where: { listingId: id },
      data: { 
        processingStatus: 'QUEUED',
        processedAt: null
      }
    });

    // Pokud žádná média neexistují, vytvořit placeholder
    if (listing.media.length === 0) {
      await prisma.listingMedia.create({
        data: {
          url: '/placeholder.jpg',
          originalName: 'placeholder.jpg',
          category: 'OTHER',
          listingId: id,
          processingStatus: 'QUEUED',
          aiTags: ['queued', 'pending'],
          sortOrder: 0,
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Media processing started',
      data: {
        jobId: job.id,
        listingId: id,
        queue: 'image-process-deepseek',
        estimatedTime: '2-5 minutes', // Odhad času zpracování
        timestamp: new Date().toISOString(),
      }
    }, { status: 202 }); // 202 Accepted - zpracování bylo přijato
  } catch (error) {
    console.error('Error starting media processing:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to start media processing',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint pro získání informací o zpracování
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Získání informací o aktivních jobech pro tento listing
    // Poznámka: Toto je zjednodušená implementace
    // V reálném případě bychom potřebovali query BullMQ queue
    
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        media: {
          select: {
            processingStatus: true,
            processedAt: true,
          },
          take: 10
        }
      }
    });

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    // Analýza stavů médií
    const statusCounts = {
      QUEUED: 0,
      PROCESSING: 0,
      DONE: 0,
      FAILED: 0,
      UNKNOWN: 0
    };

    listing.media.forEach(media => {
      const status = media.processingStatus || 'UNKNOWN';
      statusCounts[status as keyof typeof statusCounts] = 
        (statusCounts[status as keyof typeof statusCounts] || 0) + 1;
    });

    const totalMedia = listing.media.length;
    const hasActiveProcessing = statusCounts.PROCESSING > 0 || statusCounts.QUEUED > 0;

    return NextResponse.json({
      success: true,
      data: {
        listingId: id,
        hasActiveProcessing,
        statusCounts,
        totalMedia,
        canStartProcessing: !hasActiveProcessing && totalMedia > 0,
        lastProcessed: listing.media.length > 0 
          ? Math.max(...listing.media.map(m => m.processedAt ? new Date(m.processedAt).getTime() : 0))
          : null,
        timestamp: new Date().toISOString(),
      }
    });
  } catch (error) {
    console.error('Error getting processing info:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to get processing information',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}