import { NextRequest, NextResponse } from 'next/server';
import { imageProcessDeepSeekQueue } from '@/lib/queues';

export async function POST(request: NextRequest) {
  try {
    const { listingId, zipUrl, title, price, address, type, area, rooms } = await request.json();
    
    console.log('🚀 Enqueueing DeepSeek job for listing:', listingId);

    // Přidej job do BullMQ fronty pro DeepSeek zpracování
    const job = await imageProcessDeepSeekQueue.add('process-listing-deepseek', {
      listingId,
      zipUrl,
      title,
      price,
      address,
      type,
      area,
      rooms
    });

    return NextResponse.json({
      success: true,
      jobId: job.id,
      message: 'Job added to DeepSeek processing queue',
    });
  } catch (error) {
    console.error('❌ Queue error:', error);
    return NextResponse.json({
      error: 'Failed to enqueue job',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
