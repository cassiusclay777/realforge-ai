// @ts-nocheck
// MVP: simulace worker pro image processing
// NOTE: This file uses SQLite schema and is not compatible with PostgreSQL
// It's kept for reference but should not be used in production with PostgreSQL

import { redis } from '@/lib/redis';
import AdmZip from 'adm-zip';
import { Worker } from 'bullmq';
import fs from 'fs';
import path from 'path';

// Lazy import pro prisma kvůli ERR_REQUIRE_CYCLE_MODULE
async function getPrisma() {
  const { prisma } = await import('@/lib/prisma');
  return prisma;
}

async function fallbackSimulation(listingId: string, zipUrl: string, title?: string, price?: number) {
  console.log('🔄 Falling back to simulation');
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
  
  return { success: true, mediaCount: mockMedia.length, aiGenerated: true };
}

const worker = new Worker(
  'image-process',
  async (job) => {
    try {
      console.log(`🔄 Processing job ${job.id} for listing ${job.data.listingId}`);
      
      const { listingId, zipUrl } = job.data;
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
      const zipPath = path.join(process.cwd(), 'public', zipUrl);
      if (!fs.existsSync(zipPath)) {
        console.log(`⚠ ZIP file not found at ${zipPath}, skipping extraction`);
        // Fallback na simulaci
        return await fallbackSimulation(listingId, zipUrl, job.data.title, job.data.price);
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
      
      // Extrahujeme obrázky
      const categories = ['LIVING_ROOM', 'KITCHEN', 'BEDROOM', 'BATHROOM', 'HALLWAY', 'FACADE', 'ADVERTISEMENT', 'HIDDEN'] as const;
      let extractedCount = 0;
      for (let idx = 0; idx < imageEntries.length; idx++) {
        const entry = imageEntries[idx];
        const ext = path.extname(entry.entryName);
        const fileName = `photo${idx + 1}${ext}`;
        
        zip.extractEntryTo(entry, extractDir, false, true, false, fileName);
        
        const category = categories[idx % categories.length];
        const url = `/uploads/${listingId}/${fileName}`;
        
        await prisma.listingMedia.create({
          data: {
            url,
            originalName: entry.entryName,
            category,
            listingId,
            processingStatus: 'DONE',
            processedAt: new Date(),
            aiTags: ['extracted', 'real', category.toLowerCase()],
            isFeatured: idx === 0,
            sortOrder: idx,
          }
        });
        
        extractedCount++;
        if (extractedCount >= 50) break; // limit
      }
      
      // Pokud žádné obrázky nebyly, použijeme simulaci
      if (extractedCount === 0) {
        console.log('No images found in ZIP, falling back to simulation');
        return await fallbackSimulation(listingId, zipUrl, job.data.title, job.data.price);
      }
      
      console.log(`✅ Extracted ${extractedCount} images`);
      
      // Vytvoření AI výsledků (simulace)
      await prisma.aIResult.upsert({
        where: { listingId },
        create: {
          listingId,
          headline: `Moderní nemovitost v ${job.data.title || 'Brně'}`,
          shortDesc: 'Skvělá příležitost pro investici nebo bydlení.',
          longDesc: 'Tato nemovitost nabízí moderní vybavení, skvělou polohu a výborný potenciál pro zhodnocení.',
          bulletPoints: ['Moderní vybavení', 'Dobrá dopravní dostupnost', 'Klidná lokalita'],
          seoTitle: 'Moderní nemovitost k prodeji',
          seoDescription: 'Prodej moderní nemovitosti s velkým potenciálem.',
          instagramCaption: 'Objevte tuto skvělou nemovitost! #realestate',
          fbPost: 'Nová nemovitost právě přidána na náš portál.',
          priceSuggestion: job.data.price ? job.data.price * 1.1 : 9500000,
          priceReasoning: 'Cena odpovídá tržní hodnotě a kvalitě nemovitosti.',
          targetAudience: 'Mladé páry, investoři, rodiny',
          bestTimeToPost: 'Pátek odpoledne',
          recommendations: ['Zveřejnit na Sreality.cz', 'Sdílet na sociálních sítích'],
        },
        update: {
          headline: `Moderní nemovitost v ${job.data.title || 'Brně'}`,
          shortDesc: 'Skvělá příležitost pro investici nebo bydlení.',
          longDesc: 'Tato nemovitost nabízí moderní vybavení, skvělou polohu a výborný potenciál pro zhodnocení.',
          bulletPoints: ['Moderní vybavení', 'Dobrá dopravní dostupnost', 'Klidná lokalita'],
          seoTitle: 'Moderní nemovitost k prodeji',
          seoDescription: 'Prodej moderní nemovitosti s velkým potenciálem.',
          instagramCaption: 'Objevte tuto skvělou nemovitost! #realestate',
          fbPost: 'Nová nemovitost právě přidána na náš portál.',
          priceSuggestion: job.data.price ? job.data.price * 1.1 : 9500000,
          priceReasoning: 'Cena odpovídá tržní hodnotě a kvalitě nemovitosti.',
          targetAudience: 'Mladé páry, investoři, rodiny',
          bestTimeToPost: 'Pátek odpoledne',
          recommendations: ['Zveřejnit na Sreality.cz', 'Sdílet na sociálních sítích'],
        }
      });
      
      console.log(`✅ Job ${job.id} completed successfully`);
      return { success: true, mediaCount: extractedCount, aiGenerated: true };
      
    } catch (error) {
      console.error(`❌ Job ${job.id} failed:`, error);
      throw error;
    }
  },
  {
    connection: redis as any,
    concurrency: 5,
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 100 }
  }
);

worker.on('completed', (job) => {
  console.log(`🎉 Job ${job.id} has completed!`);
});

worker.on('failed', (job, err) => {
  console.error(`💥 Job ${job?.id} failed with error:`, err);
});

worker.on('error', (err) => {
  console.error('🔥 Worker error:', err);
});

console.log('✅ BullMQ image-process worker started');

// Pro vývoj - spustíme worker přímo
if (process.env.NODE_ENV === 'development') {
  console.log('🚀 Development worker running');
}

export default worker;