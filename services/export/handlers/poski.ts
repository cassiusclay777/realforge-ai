/**
 * Poski API export handler
 * Handles publishing listings to Poski Real Estate Platform
 */

import { NextRequest, NextResponse } from 'next/server';
import { publishToPoski, transformToPoskiFormat } from '@/lib/poski';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { listingId } = await request.json();

    if (!listingId) {
      return NextResponse.json(
        { success: false, error: 'Missing listingId' },
        { status: 400 }
      );
    }

    console.log(`🚀 Starting Poski export for listing: ${listingId}`);

    // Fetch listing data from database
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        processedPhotos: true
      }
    });

    if (!listing) {
      return NextResponse.json(
        { success: false, error: 'Listing not found' },
        { status: 404 }
      );
    }

    // Check if listing is already published to Poski
    if (listing.status === 'PUBLISHED_POSKI') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Listing already published to Poski',
          warning: 'This listing has already been exported to Poski'
        },
        { status: 400 }
      );
    }

    // Transform data to Poski format
    // Convert images from JSON string/array to array of URLs
    const images = listing.images ? 
      (Array.isArray(listing.images) ? listing.images : JSON.parse(listing.images as string)) : 
      [];
    
    // Parse aiResult if it exists
    const aiResults = listing.aiResult ? JSON.parse(listing.aiResult) : null;
    
    const poskiData = transformToPoskiFormat(
      listing,
      aiResults,
      images
    );

    console.log('📦 Transformed data for Poski:', {
      title: poskiData.title,
      price: poskiData.price,
      images: poskiData.images.length
    });

    // Publish to Poski API
    const result = await publishToPoski(poskiData);

    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to publish to Poski',
          details: result.message,
          errors: result.errors
        },
        { status: 500 }
      );
    }

    // Update listing status in database
    await prisma.listing.update({
      where: { id: listingId },
      data: { 
        status: 'PUBLISHED_POSKI',
        updatedAt: new Date()
      }
    });

    console.log(`✅ Successfully published listing ${listingId} to Poski`);
    console.log(`📝 Poski response:`, result);

    return NextResponse.json({
      success: true,
      message: 'Listing successfully published to Poski',
      poskiListingId: result.listingId,
      listingId,
      timestamp: new Date().toISOString(),
      data: {
        title: poskiData.title,
        price: poskiData.price,
        address: poskiData.address,
        type: poskiData.type
      }
    });

  } catch (error: any) {
    console.error('❌ Error in Poski export handler:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * GET handler to check Poski export status
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get('listingId');

    if (!listingId) {
      return NextResponse.json(
        { success: false, error: 'Missing listingId parameter' },
        { status: 400 }
      );
    }

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: {
        id: true,
        title: true,
        status: true,
        updatedAt: true
      }
    });

    if (!listing) {
      return NextResponse.json(
        { success: false, error: 'Listing not found' },
        { status: 404 }
      );
    }

    const isPublished = listing.status === 'PUBLISHED_POSKI';
    
    return NextResponse.json({
      success: true,
      listingId,
      isPublished,
      status: listing.status,
      lastUpdated: listing.updatedAt,
      title: listing.title
    });

  } catch (error: any) {
    console.error('❌ Error checking Poski status:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: error.message
      },
      { status: 500 }
    );
  }
}