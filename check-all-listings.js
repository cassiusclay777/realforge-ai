// Check all listings in database
const { Pool } = require('pg');

async function checkAllListings() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://realforge:#g(XNb>a4a:5SL|$@localhost:5432/realforge_ai',
  });

  try {
    console.log('Checking all listings in database...\n');
    
    // Check all listings
    const listingsResult = await pool.query(
      'SELECT id, title, status, "createdAt" FROM "Listing" ORDER BY "createdAt" DESC LIMIT 10'
    );
    
    console.log(`📋 Total listings: ${listingsResult.rows.length}\n`);
    
    if (listingsResult.rows.length > 0) {
      listingsResult.rows.forEach((listing, i) => {
        console.log(`${i + 1}. ${listing.id}`);
        console.log(`   Title: ${listing.title}`);
        console.log(`   Status: ${listing.status}`);
        console.log(`   Created: ${listing.createdAt}`);
        console.log('');
      });
      
      // Check media for first listing
      const firstListingId = listingsResult.rows[0].id;
      const mediaResult = await pool.query(
        'SELECT * FROM "ListingMedia" WHERE "listingId" = $1 ORDER BY "sortOrder" ASC',
        [firstListingId]
      );
      
      console.log(`\n📸 Media for first listing (${firstListingId}): ${mediaResult.rows.length}`);
      
      if (mediaResult.rows.length > 0) {
        mediaResult.rows.forEach((media, i) => {
          console.log(`${i + 1}. ${media.url} (${media.category})`);
        });
      }
    } else {
      console.log('No listings found in database.');
      console.log('\nPossible issues:');
      console.log('1. Database tables not created - run prisma db push');
      console.log('2. No listings created yet - create a test listing');
    }
    
    // Check total media count
    const mediaCountResult = await pool.query('SELECT COUNT(*) as count FROM "ListingMedia"');
    console.log(`\n📊 Total media in database: ${mediaCountResult.rows[0].count}`);
    
  } catch (error) {
    console.error('Error:', error.message);
    console.log('\nMake sure PostgreSQL is running and DATABASE_URL is correct.');
  } finally {
    await pool.end();
  }
}

checkAllListings();