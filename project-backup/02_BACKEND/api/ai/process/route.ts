import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Mock AI processing function - v reálném nasazení by se připojilo k OpenAI Vision API nebo podobné službě
async function processWithAI(images: string[], metadata: any) {
  console.log('🤖 AI processing started for listing:', metadata.listingId);
  console.log('📸 Images to process:', images.length);
  console.log('📋 Metadata:', metadata);

  // Simulace AI zpracování - v reálném nasazení by se volalo skutečné AI API
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Mock výsledky AI zpracování
  return {
    title: metadata.title || "Moderní byt v centru města",
    description: `Exkluzivní ${metadata.type?.toLowerCase() || 'byt'} na adrese ${metadata.address}. ${metadata.area ? `Plocha ${metadata.area} m². ` : ''}${metadata.rooms ? `Počet pokojů: ${metadata.rooms}. ` : ''}Perfektní stav, nová rekonstrukce.`,
    seoTitle: `${metadata.title} | ${metadata.address} | Realitní nabídka`,
    seoDescription: `Prodej ${metadata.type?.toLowerCase() || 'nemovitosti'} na adrese ${metadata.address}. ${metadata.area ? `Plocha ${metadata.area} m². ` : ''}${metadata.price ? `Cena ${metadata.price.toLocaleString()} Kč. ` : ''}`,
    instagramPost: `🏠 NOVÁ NABÍDKA!\n\n${metadata.title}\n📍 ${metadata.address}\n💰 ${metadata.price ? metadata.price.toLocaleString() + ' Kč' : 'Cena na vyžádání'}\n\n#realestate #nemovitosti #${metadata.type?.toLowerCase() || 'byt'}`,
    facebookPost: `Nová realitní nabídka: ${metadata.title}\n\nAdresa: ${metadata.address}\n${metadata.area ? `Plocha: ${metadata.area} m²\n` : ''}${metadata.rooms ? `Pokojů: ${metadata.rooms}\n` : ''}${metadata.price ? `Cena: ${metadata.price.toLocaleString()} Kč\n` : ''}\nPro více informací nás kontaktujte!`,
    recommendedPrice: metadata.price ? Math.round(metadata.price * 1.05) : 0,
    targetAudience: metadata.type === 'APARTMENT' ? 'Mladé páry, studenti' : 
                    metadata.type === 'HOUSE' ? 'Rodiny s dětmi' : 
                    'Investoři, developeři',
    bestPublishTime: 'Pondělí 10:00 - 12:00',
    mainImage: images[0] || '/default-image.jpg',
    processedImages: images.map((img, index) => ({
      url: img,
      roomType: index === 0 ? 'living-room' : 
               index === 1 ? 'bedroom' : 
               index === 2 ? 'kitchen' : 'other',
      aiDescription: `Fotografie ${index + 1}: ${['obývací pokoj', 'ložnice', 'kuchyň', 'koupelna', 'zahrada'][index % 5] || 'interiér'}`
    }))
  };
}

export async function POST(request: NextRequest) {
  try {
    console.log('🤖 AI processing endpoint called');
    
    const body = await request.json();
    const { listingId, images, title, address, type, price, area } = body;
    
    if (!listingId) {
      return NextResponse.json({ error: 'Missing listingId' }, { status: 400 });
    }
    
    console.log('📋 Processing AI for listing:', listingId);
    
    // Zpracuj pomocí AI (nebo mock)
    const aiResult = await processWithAI(images || [], {
      listingId,
      title,
      address,
      type,
      price: price ? parseInt(price) : null,
      area: area ? parseInt(area) : null
    });
    
    console.log('✅ AI processing completed for listing:', listingId);
    
    // Ulož výsledky do databáze
    try {
      await prisma.listing.update({
        where: { id: listingId },
        data: {
          status: 'PROCESSED',
          aiResult: JSON.stringify(aiResult),
          updatedAt: new Date()
        }
      });
      console.log('💾 AI results saved to database');
    } catch (dbError) {
      console.error('❌ Failed to save AI results to database:', dbError);
      // Pokračuj i když se nepodaří uložit do DB
    }
    
    return NextResponse.json({
      success: true,
      listingId,
      aiResult,
      message: 'AI processing completed successfully'
    });
    
  } catch (error) {
    console.error('❌ AI processing error:', error);
    
    return NextResponse.json({ 
      error: 'AI processing failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET endpoint pro testování
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'AI Processing API is running',
    endpoints: {
      POST: '/api/ai/process - Process images with AI',
      parameters: {
        listingId: 'string (required)',
        images: 'string[] (optional)',
        title: 'string (optional)',
        address: 'string (optional)',
        type: 'string (optional)',
        price: 'number (optional)',
        area: 'number (optional)'
      }
    }
  });
}