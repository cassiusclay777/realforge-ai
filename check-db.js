const { PrismaClient } = require('@prisma/client');

async function checkDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Checking database connection...');
    
    // Check total listings
    const count = await prisma.listing.count();
    console.log('Total listings:', count);
    
    // Get sample listings
    const listings = await prisma.listing.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' }
    });
    
    console.log('\nSample listings:');
    listings.forEach((listing, index) => {
      console.log(`${index + 1}. ID: ${listing.id}`);
      console.log(`   Title: ${listing.title || '(no title)'}`);
      console.log(`   Status: ${listing.status}`);
      console.log(`   Created: ${listing.createdAt}`);
      console.log(`   Type: ${listing.type || '(no type)'}`);
      console.log('');
    });
    
    // Check if we have any data at all
    if (count === 0) {
      console.log('No listings found in database.');
      console.log('You need to upload a ZIP file first to create listings.');
    }
    
  } catch (error) {
    console.error('Database error:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();