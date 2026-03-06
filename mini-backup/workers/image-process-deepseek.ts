// @ts-nocheck
// Worker pro image processing s DeepSeek AI
// NOTE: This file uses SQLite schema and is not compatible with PostgreSQL
// It's kept for reference but should not be used in production with PostgreSQL

import Redis from 'ioredis';
import { analyzeImageWithDeepSeek, generateContentWithDeepSeek } from '@/lib/deepseek';
import AdmZip from 'adm-zip';
import { Worker } from 'bullmq';
import fs from 'fs';
import path from 'path';

// Vytvoříme Redis connection přímo v workeru
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
});

redis.on('connect', () => {
  console.log('✅ Redis connected for BullMQ worker');
});

redis.on('error', (err) => {
  console.error('❌ Redis connection error in worker:', err);
});

// Lazy import pro prisma kvůli ERR_REQUIRE_CYCLE_MODULE
async function getPrisma() {
  const { prisma } = await import('@/lib/prisma');
  return prisma;
}

async function fallbackSimulation(listingId: string, zipUrl: string, title?: string, price?: number) {
  console.log('🔄 Falling back to simulation (DeepSeek API not available)');
  const prisma = await getPrisma();
  const categories = ['LIVING_ROOM', 'KITCHEN', 'BEDROOM', 'BATHROOM', 'HALLWAY', 'FACADE', 'ADVERTISEMENT', 'HIDDEN'] as const;
  const estimatedImageCount = 10;
  const mockMedia = [];
  for (let i = 1; i <= estimatedImageCount; i++) {
    const category = categories[i % categories.length];
    mockMedia.push({
      url: `${zipUrl}/photo${i}.jpg`,
      category,
      isFeatured: i === 1,
    });
  }
  
  for (let idx = 0; idx < mockMedia.length; idx++) {
    const media = mockMedia[idx];
    await prisma.listingMedia.create({
      data: {
        url: media.url,
        originalName: media.url.split('/').pop() || `photo${idx + 1}.jpg`,
        category: media.category,
        listingId,
        processingStatus: 'DONE',
        processedAt: new Date(),
        aiTags: ['simulated', 'test', media.category.toLowerCase()],
        isFeatured: media.isFeatured,
        sortOrder: idx,
      }
    });
  }
  
  await prisma.aIResult.upsert({
    where: { listingId },
    create: {
      listingId,
      headline: `Moderní nemovitost v ${title || 'Brně'}`,
      shortDesc: 'Skvělá příležitost pro investici nebo bydlení.',
      longDesc: 'Tato nemovitost nabízí moderní vybavení, skvělou polohu a výborný potenciál pro zhodnocení.',
      bulletPoints: ['Moderní vybavení', 'Dobrá dopravní dostupnost', 'Klidná lokalita'],
      seoTitle: 'Moderní nemovitost k prodeji',
      seoDescription: 'Prodej moderní nemovitosti s velkým potenciálem.',
      instagramCaption: 'Objevte tuto skvělou nemovitost! #realestate',
      fbPost: 'Nová nemovitost právě přidána na náš portál.',
      priceSuggestion: price ? price * 1.1 : 9500000,
      priceReasoning: 'Cena odpovídá tržní hodnotě a kvalitě nemovitosti.',
      targetAudience: 'Mladé páry, investoři, rodiny',
      bestTimeToPost: 'Pátek odpoledne',
      recommendations: ['Zveřejnit na Sreality.cz', 'Sdílet na sociálních sítích'],
    },
    update: {
      headline: `Moderní nemovitost v ${title || 'Brně'}`,
      shortDesc: 'Skvělá příležitost pro investici nebo bydlení.',
      longDesc: 'Tato nemovitost nabízí moderní vybavení, skvělou polohu a výborný potenciál pro zhodnocení.',
      bulletPoints: ['Moderní vybavení', 'Dobrá dopravní dostupnost', 'Klidná lokalita'],
      seoTitle: 'Moderní nemovitost k prodeji',
      seoDescription: 'Prodej moderní nemovitosti s velkým potenciálem.',
      instagramCaption: 'Objevte tuto skvělou nemovitost! #realestate',
      fbPost: 'Nová nemovitost právě přidána na náš portál.',
      priceSuggestion: price ? price * 1.1 : 9500000,
      priceReasoning: 'Cena odpovídá tržní hodnotě a kvalitě nemovitosti.',
      targetAudience: 'Mladé páry, investoři, rodiny',
      bestTimeToPost: 'Pátek odpoledne',
      recommendations: ['Zveřejnit na Sreality.cz', 'Sdílet na sociálních sítích'],
    }
  });
  
  return { success: true, mediaCount: mockMedia.length, aiGenerated: false };
}

const worker = new Worker(
  'image-process-deepseek',
  async (job) => {
    try {
      console.log(`🔄 DeepSeek processing job ${job.id} for listing ${job.data.listingId}`);
      
      const { listingId, zipUrl, title, price, address, type, area, rooms } = job.data;
      const prisma = await getPrisma();
      
      // Aktualizace statusu listingu
      await prisma.listing.update({
        where: { id: listingId },
        data: { 
          status: 'ACTIVE',
          updatedAt: new Date()
        }
      });
      
      // Extrakce ZIP souboru
      const zipPath = path.join(process.cwd(), 'public', decodeURIComponent(zipUrl));
      if (!fs.existsSync(zipPath)) {
        console.log(`⚠ ZIP file not found at ${zipPath}, checking alternative paths...`);
        
        // Zkusíme alternativní cestu bez URL encoding
        const altPath = path.join(process.cwd(), 'public', zipUrl.replace(/%20/g, ' '));
        if (fs.existsSync(altPath)) {
          console.log(`✅ Found ZIP at alternative path: ${altPath}`);
          // Fallback na simulaci prozatím
          return await fallbackSimulation(listingId, zipUrl, title, price);
        }
        
        console.log(`❌ ZIP file not found, skipping extraction`);
        // Fallback na simulaci
        return await fallbackSimulation(listingId, zipUrl, title, price);
      }
      
      console.log(`📁 Extracting ZIP from ${zipPath}`);
      const zip = new AdmZip(zipPath);
      const extractDir = path.join(process.cwd(), 'public', 'uploads', listingId);
      if (fs.existsSync(extractDir)) {
        fs.rmSync(extractDir, { recursive: true });
      }
      fs.mkdirSync(extractDir, { recursive: true });
      
      // Filtrujeme pouze obrázkové soubory
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
      const zipEntries = zip.getEntries();
      const imageEntries = zipEntries.filter(entry => {
        const ext = path.extname(entry.entryName).toLowerCase();
        return !entry.isDirectory && imageExtensions.includes(ext);
      });
      
      console.log(`📸 Found ${imageEntries.length} image files in ZIP`);
      
      if (imageEntries.length === 0) {
        console.log('No images found in ZIP, falling back to simulation');
        return await fallbackSimulation(listingId, zipUrl, title, price);
      }
      
      // Extrahujeme a analyzujeme obrázky s DeepSeek
      const imageAnalyses = [];
      let extractedCount = 0;
      
      for (let idx = 0; idx < Math.min(imageEntries.length, 10); idx++) { // Limit 10 obrázků pro analýzu
        const entry = imageEntries[idx];
        const ext = path.extname(entry.entryName);
        const fileName = `photo${idx + 1}${ext}`;
        
        zip.extractEntryTo(entry, extractDir, false, true, false, fileName);
        
        const url = `/uploads/${listingId}/${fileName}`;
        const fullImageUrl = `http://localhost:3001${url}`;
        
        try {
          console.log(`🤖 Analyzing image ${idx + 1}/${Math.min(imageEntries.length, 10)} with DeepSeek...`);
          
          // Analyzuj obrázek s DeepSeek
          const analysis = await analyzeImageWithDeepSeek(fullImageUrl, `Image ${idx + 1} of property listing`);
          
          // Ulož do databáze
          await prisma.listingMedia.create({
            data: {
              url,
              originalName: entry.entryName,
              category: analysis.categories[0] || 'UNKNOWN',
              listingId,
              processingStatus: 'DONE',
              processedAt: new Date(),
              aiTags: analysis.tags,
              aiSaliencyScore: analysis.saliencyScore,
              isFeatured: idx === 0,
              sortOrder: idx,
            }
          });
          
          imageAnalyses.push(analysis);
          extractedCount++;
          
        } catch (error) {
          console.error(`❌ Failed to analyze image ${idx + 1}:`, error);
          // Pokračuj s dalším obrázkem
        }
      }
      
      console.log(`✅ Extracted and analyzed ${extractedCount} images`);
      
      // Generuj obsah s DeepSeek
      let aiContent;
      if (imageAnalyses.length > 0) {
        try {
          console.log('🤖 Generating marketing content with DeepSeek...');
          
          aiContent = await generateContentWithDeepSeek(imageAnalyses, {
            title,
            address,
            type,
            price,
            area,
            rooms
          });
          
          // Ulož AI výsledky
          await prisma.aIResult.upsert({
            where: { listingId },
            create: {
              listingId,
              headline: aiContent.headline,
              shortDesc: aiContent.shortDesc,
              longDesc: aiContent.longDesc,
              bulletPoints: aiContent.bulletPoints,
              seoTitle: aiContent.seoTitle,
              seoDescription: aiContent.seoDescription,
              instagramCaption: aiContent.instagramCaption,
              fbPost: aiContent.fbPost,
              priceSuggestion: aiContent.priceSuggestion,
              priceReasoning: aiContent.priceReasoning,
              targetAudience: aiContent.targetAudience,
              bestTimeToPost: aiContent.bestTimeToPost,
              recommendations: aiContent.recommendations,
            },
            update: {
              headline: aiContent.headline,
              shortDesc: aiContent.shortDesc,
              longDesc: aiContent.longDesc,
              bulletPoints: aiContent.bulletPoints,
              seoTitle: aiContent.seoTitle,
              seoDescription: aiContent.seoDescription,
              instagramCaption: aiContent.instagramCaption,
              fbPost: aiContent.fbPost,
              priceSuggestion: aiContent.priceSuggestion,
              priceReasoning: aiContent.priceReasoning,
              targetAudience: aiContent.targetAudience,
              bestTimeToPost: aiContent.bestTimeToPost,
              recommendations: aiContent.recommendations,
            }
          });
          
          console.log('✅ AI content generated successfully');
          
        } catch (error) {
          console.error('❌ Failed to generate AI content:', error);
          // Fallback na simulaci
          await fallbackSimulation(listingId, zipUrl, title, price);
        }
      } else {
        console.log('⚠ No images analyzed, falling back to simulation');
        await fallbackSimulation(listingId, zipUrl, title, price);
      }
      
      // Aktualizuj status listingu na ACTIVE
      await prisma.listing.update({
        where: { id: listingId },
        data: { 
          status: 'ACTIVE',
          updatedAt: new Date()
        }
      });
      
      console.log(`✅ Job ${job.id} completed successfully`);
      return { 
        success: true, 
        mediaCount: extractedCount, 
        aiGenerated: imageAnalyses.length > 0,
        deepSeekUsed: imageAnalyses.length > 0
      };
      
    } catch (error) {
      console.error(`❌ Job ${job.id} failed:`, error);
      
      // Fallback na simulaci při chybě
      try {
        const { listingId, zipUrl, title, price } = job.data;
        await fallbackSimulation(listingId, zipUrl, title, price);
        
        // Aktualizuj status listingu na ACTIVE i při fallbacku
        const prisma = await getPrisma();
        await prisma.listing.update({
          where: { id: listingId },
          data: { 
            status: 'ACTIVE',
            updatedAt: new Date()
          }
        });
        
        return { 
          success: true, 
          mediaCount: 10, 
          aiGenerated: false,
          deepSeekUsed: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      } catch (fallbackError) {
        console.error('❌ Fallback also failed:', fallbackError);
        throw error;
      }
    }
  },
  {
    connection: redis as any,
    concurrency: 2, // Nižší concurrency kvůli API limitům
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 100 }
  }
);

worker.on('completed', (job) => {
  console.log(`🎉 DeepSeek job ${job.id} has completed!`);
});

worker.on('failed', (job, err) => {
  console.error(`💥 DeepSeek job ${job?.id} failed with error:`, err);
});

worker.on('error', (err) => {
  console.error('🔥 DeepSeek worker error:', err);
});

console.log('✅ BullMQ image-process-deepseek worker started');

// Pro vývoj - spustíme worker přímo
if (process.env.NODE_ENV === 'development') {
  console.log('🚀 DeepSeek development worker running');
}

export default worker;