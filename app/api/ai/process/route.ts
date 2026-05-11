import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';
import { getDeepSeekApiKey } from '@/lib/integration-utils';
import { parsePositiveInt } from '@/lib/validation/numbers';
import {
  analyzeImageWithDeepSeek,
  generateContentWithDeepSeek,
  type DeepSeekImageAnalysis,
} from '@/lib/deepseek';
import type { ListingMedia } from '@prisma/client';

const MAX_IMAGES_TO_ANALYZE = 5;

/** Mapuje analýzy z ListingMedia (vision worker) na formát pro generateContentWithDeepSeek. */
function mapMediaToAnalyses(media: ListingMedia[]): DeepSeekImageAnalysis[] {
  const sorted = [...media].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  return sorted.slice(0, MAX_IMAGES_TO_ANALYZE).map((m) => ({
    description: m.aiDescription ?? m.aiCaption ?? 'Fotografie nemovitosti',
    categories: m.category ? [m.category] : ['OTHER'],
    tags: Array.isArray(m.aiTags) ? m.aiTags : [],
    saliencyScore:
      m.aiSaliencyScore != null ? Math.max(0, Math.min(1, m.aiSaliencyScore)) : 0.5,
    suggestedHeadline: undefined,
    suggestedDescription: m.aiCaption ?? undefined,
  }));
}

async function processWithAI(
  metadata: { title?: string; address?: string; type?: string; price?: number | null; area?: number | null; rooms?: number | null; userDescription?: string },
  existingAnalyses: DeepSeekImageAnalysis[],
  fallbackImageUrls: string[],
  apiKey?: string | null
): Promise<{
  headline: string;
  shortDesc: string;
  longDesc: string;
  bulletPoints: string[];
  seoTitle: string;
  seoDescription: string;
  priceSuggestion: number;
  priceReasoning: string;
  targetAudience: string;
  recommendations: string[];
  instagramCaption: string;
  fbPost: string;
  bestTimeToPost: string;
}> {
  let analyses = existingAnalyses;

  if (analyses.length === 0 && fallbackImageUrls.length > 0) {
    const urls = fallbackImageUrls.slice(0, MAX_IMAGES_TO_ANALYZE);
    for (const url of urls) {
      try {
        const a = await analyzeImageWithDeepSeek(url, metadata.address, apiKey ? { apiKey } : undefined);
        analyses.push(a);
      } catch {
        analyses.push({
          description: 'Fotografie nemovitosti',
          categories: ['OTHER'],
          tags: ['real-estate'],
          saliencyScore: 0.5,
        });
      }
    }
  }

  if (analyses.length === 0) {
    analyses = [
      {
        description: 'Nemovitost bez fotografií',
        categories: ['OTHER'],
        tags: ['real-estate'],
        saliencyScore: 0.5,
      },
    ];
  }

  const generated = await generateContentWithDeepSeek(analyses, {
    title: metadata.title,
    address: metadata.address,
    type: metadata.type,
    price: metadata.price ?? undefined,
    area: metadata.area ?? undefined,
    rooms: metadata.rooms ?? undefined,
    userDescription: metadata.userDescription,
  }, apiKey ? { apiKey } : undefined);

  return {
    headline: generated.headline,
    shortDesc: generated.shortDesc,
    longDesc: generated.longDesc,
    bulletPoints: generated.bulletPoints,
    seoTitle: generated.seoTitle,
    seoDescription: generated.seoDescription,
    priceSuggestion: generated.priceSuggestion,
    priceReasoning: generated.priceReasoning,
    targetAudience: generated.targetAudience,
    recommendations: generated.recommendations,
    instagramCaption: generated.instagramCaption,
    fbPost: generated.fbPost,
    bestTimeToPost: generated.bestTimeToPost,
  };
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Neautorizováno' }, { status: 401 });
    }

    const body = await request.json();
    const { listingId, images, title, address, type, price, area, rooms } = body;

    if (!listingId) {
      return NextResponse.json({ error: 'Missing listingId' }, { status: 400 });
    }

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: { aiResult: true, media: true },
    });

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    let apiKey = await getDeepSeekApiKey(session.user.id);
    if (!apiKey) apiKey = process.env.DEEPSEEK_API_KEY ?? null;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Nastavte DeepSeek API klíč v Nastavení > Integrace nebo v .env jako DEEPSEEK_API_KEY.' },
        { status: 400 }
      );
    }

    const metadata = {
      title: title ?? listing.title,
      address: address ?? listing.address,
      type: type ?? listing.type,
      price: parsePositiveInt(price) ?? listing.price ?? null,
      area: parsePositiveInt(area) ?? listing.area ?? null,
      rooms: parsePositiveInt(rooms) ?? listing.rooms ?? null,
      userDescription: listing.description ?? undefined,
    };

    const existingAnalyses = mapMediaToAnalyses(listing.media);
    const fallbackImageUrls: string[] =
      Array.isArray(images) && images.length > 0
        ? images
        : (Array.isArray(listing.images)
            ? (listing.images as string[])
            : typeof listing.images === 'string'
              ? (JSON.parse(listing.images || '[]') as string[])
              : []) as string[];

    const aiResult = await processWithAI(metadata, existingAnalyses, fallbackImageUrls, apiKey);

    await prisma.aIResult.upsert({
      where: { listingId },
      create: {
        listingId,
        headline: aiResult.headline,
        shortDesc: aiResult.shortDesc,
        longDesc: aiResult.longDesc,
        bulletPoints: aiResult.bulletPoints,
        seoTitle: aiResult.seoTitle,
        seoDescription: aiResult.seoDescription,
        priceSuggestion: aiResult.priceSuggestion,
        priceReasoning: aiResult.priceReasoning,
        targetAudience: aiResult.targetAudience,
        recommendations: aiResult.recommendations,
        instagramCaption: aiResult.instagramCaption,
        fbPost: aiResult.fbPost,
        bestTimeToPost: aiResult.bestTimeToPost,
      },
      update: {
        headline: aiResult.headline,
        shortDesc: aiResult.shortDesc,
        longDesc: aiResult.longDesc,
        bulletPoints: aiResult.bulletPoints,
        seoTitle: aiResult.seoTitle,
        seoDescription: aiResult.seoDescription,
        priceSuggestion: aiResult.priceSuggestion,
        priceReasoning: aiResult.priceReasoning,
        targetAudience: aiResult.targetAudience,
        recommendations: aiResult.recommendations,
        instagramCaption: aiResult.instagramCaption,
        fbPost: aiResult.fbPost,
        bestTimeToPost: aiResult.bestTimeToPost,
        updatedAt: new Date(),
      },
    });

    await prisma.listing.update({
      where: { id: listingId },
      data: { status: 'PROCESSED', updatedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      listingId,
      aiResult,
      message: 'AI processing completed successfully',
    });
  } catch (error) {
    console.error('AI processing error:', error);
    return NextResponse.json(
      {
        error: 'AI processing failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'AI Processing API is running',
    endpoints: {
      POST: '/api/ai/process - Process listing with DeepSeek AI',
      parameters: {
        listingId: 'string (required)',
        images: 'string[] (optional)',
        title: 'string (optional)',
        address: 'string (optional)',
        type: 'string (optional)',
        price: 'number (optional)',
        area: 'number (optional)',
        rooms: 'number (optional)',
      },
    },
  });
}
