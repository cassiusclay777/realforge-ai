import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { imageProcessDeepSeekQueue } from '@/lib/queues';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    console.log('📦 Starting file upload with DeepSeek processing...');
    
    const formData = await request.formData();
    const file = formData.get('zipFile') as File;
    const title = formData.get('title') as string;
    const address = formData.get('address') as string;
    const type = formData.get('type') as string;
    const price = formData.get('price') as string;
    const area = formData.get('area') as string;
    const rooms = formData.get('rooms') as string;

    console.log('📝 Form data:', { title, address, type, price, area, rooms, fileName: file?.name, fileSize: file?.size });

    if (!file || file.size === 0) {
      return NextResponse.json({ error: 'No file uploaded or file is empty' }, { status: 400 });
    }

    const acceptedTypes = ['.zip', '.7z', '.rar', '.ZIP', '.RAR'];
    const fileExt = path.extname(file.name).toLowerCase();
    if (!acceptedTypes.includes(fileExt)) {
      return NextResponse.json({ 
        error: 'Invalid file type', 
        details: `File type ${fileExt} not allowed. Allowed: ${acceptedTypes.join(', ')}`,
        fileName: file.name
      }, { status: 400 });
    }

    console.log('💾 Creating listing in database...');
    
    // Map Czech values to ListingType enum
    const typeMap: Record<string, string> = {
      'BYT': 'APARTMENT',
      'APARTMENT': 'APARTMENT',
      'APARTMÁN': 'APARTMENT',
      'DŮM': 'HOUSE',
      'HOUSE': 'HOUSE',
      'DOM': 'HOUSE',
      'POZEMEK': 'LAND',
      'LAND': 'LAND',
      'PARCELA': 'LAND',
    };
    
    const normalizedType = type.toUpperCase();
    const listingType = typeMap[normalizedType] || 'APARTMENT';
    
    const listing = await prisma.listing.create({
      data: {
        title,
        address,
        type: listingType as any,
        price: parseInt(price),
        area: area ? parseInt(area) : null,
        rooms: rooms ? parseInt(rooms) : null,
        status: 'NEW',
      },
    });
    
    console.log('✅ Listing created:', listing.id);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });
    
    const fileName = `${listing.id}-${file.name}`;
    const filePath = path.join(uploadDir, fileName);
    
    await writeFile(filePath, buffer);
    
    console.log('✅ File written successfully');
    
    // Zařaď job do DeepSeek processing queue
    console.log('🚀 Enqueueing DeepSeek processing job...');
    const job = await imageProcessDeepSeekQueue.add('process-listing-deepseek', {
      listingId: listing.id,
      zipUrl: `/uploads/${fileName}`,
      title,
      price: parseInt(price),
      address,
      type: listingType,
      area: area ? parseInt(area) : null,
      rooms: rooms ? parseInt(rooms) : null,
    });
    
    console.log('✅ Job added to DeepSeek queue:', job.id);

    return NextResponse.json({
      success: true,
      listingId: listing.id,
      zipUrl: `/uploads/${fileName}`,
      fileName: file.name,
      jobId: job.id,
      message: 'Upload successful. DeepSeek AI is processing your images...',
    });
  } catch (error) {
    console.error('❌ Upload error:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown');
    
    return NextResponse.json({ 
      error: 'Upload failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
