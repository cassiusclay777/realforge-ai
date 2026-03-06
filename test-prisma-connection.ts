import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function test() {
  try {
    console.log('Testing Prisma connection...');
    
    // Test ListingMedia
    try {
      const count = await prisma.listingMedia.count();
      console.log('✅ ListingMedia count:', count);
    } catch (error: any) {
      console.error('❌ ListingMedia error:', error.message);
    }
    
    // Test Listings
    try {
      const listings = await prisma.listing.findMany({ take: 3 });
      console.log('✅ First 3 listings:');
      listings.forEach((l: any) => {
        console.log(`  - ${l.id}: ${l.title} (${l.status})`);
      });
    } catch (error: any) {
      console.error('❌ Listings error:', error.message);
    }
    
    // Test creating a ListingMedia entry
    try {
      const firstListing = await prisma.listing.findFirst();
      if (firstListing) {
        console.log(`\nTesting creation for listing: ${firstListing.id}`);
        
        const media = await prisma.listingMedia.create({
          data: {
            url: '/uploads/test/test.jpg',
            originalName: 'test.jpg',
            category: 'LIVING_ROOM',
            listingId: firstListing.id,
            processingStatus: 'DONE',
            processedAt: new Date(),
            aiTags: ['test', 'manual'],
            isFeatured: true,
            sortOrder: 0,
            aiDescription: 'Test photo',
            aiCaption: 'Test caption'
          }
        });
        console.log('✅ Created test ListingMedia:', media.id);
        
        // Clean up
        await prisma.listingMedia.delete({ where: { id: media.id } });
        console.log('✅ Cleaned up test entry');
      }
    } catch (error: any) {
      console.error('❌ Creation error:', error.message);
    }
    
  } catch (error: any) {
    console.error('❌ General error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();