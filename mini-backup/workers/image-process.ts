// @ts-nocheck
// workers/image-process.ts
// NOTE: This file uses SQLite schema and is not compatible with PostgreSQL
// It's kept for reference but should not be used in production with PostgreSQL

import { getQueue } from '../lib/queues';
import { prisma } from '../lib/prisma';

const queue = getQueue("image-process");

queue.process(async (job) => {
  const { listingId } = job.data;
  console.log(`✅ Worker: Zpracování listingu ${listingId}...`);
  
  // Simulace zpracování (3 sekundy)
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Aktualizace statusu
  await prisma.listing.update({ 
    where: { id: listingId }, 
    data: { status: "ACTIVE" } 
  });
  
  // Vytvoření mock fotek
  console.log(`📸 Worker: Vytvářím mock fotky pro listing ${listingId}...`);
  
  const categories = ["LIVING_ROOM", "KITCHEN", "BATHROOM", "BEDROOM", "FACADE", "ADVERTISEMENT", "ADVERTISEMENT", "HALLWAY"];
  
  for (let i = 0; i < 10; i++) {
    const category = categories[i % categories.length];
    const isFeatured = i === 2;
    
    try {
      await prisma.listingMedia.create({
        data: {
          listingId,
          url: `https://picsum.photos/seed/${listingId}-${i}/800/600`,
          thumbnailUrl: `https://picsum.photos/seed/${listingId}-${i}/150/150`,
          originalName: `foto-${i+1}.jpg`,
          category: category,
          isFeatured: isFeatured,
          isHidden: false,
          sortOrder: i,
          aiTags: ["světlý", "prostorný", "moderní", category.toLowerCase()],
          aiSaliencyScore: 0.9 - (i * 0.05),
          processingStatus: "DONE"
        }
      });
      
      console.log(`   📷 Vytvořena fotka ${i+1}: ${category}${isFeatured ? ' ⭐' : ''}`);
    } catch (error) {
      console.error(`   ❌ Chyba při vytváření fotky ${i+1}:`, error);
    }
  }
  
  console.log(`✅ Worker: Hotovo! Listing ${listingId} má nyní mock fotky`);
});

console.log("✅ Worker: čeká na joby...");
