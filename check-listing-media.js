// Check if listing has media in database
const { Pool } = require('pg');

async function checkListingMedia() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://realforge:#g(XNb>a4a:5SL|$@localhost:5432/realforge_ai',
  });

  const listingId = '068a36a7-b527-4709-815a-33860ac2939f';
  
  try {
    console.log(`Checking listing ${listingId}...`);
    
    // Check if listing exists
    const listingResult = await pool.query(
      'SELECT * FROM "Listing" WHERE id = $1',
      [listingId]
    );
    
    if (listingResult.rows.length === 0) {
      console.log('❌ Listing not found in database');
      return;
    }
    
    console.log('✅ Listing found:', listingResult.rows[0].title);
    console.log('Status:', listingResult.rows[0].status);
    
    // Check media for this listing
    const mediaResult = await pool.query(
      'SELECT * FROM "ListingMedia" WHERE "listingId" = $1 ORDER BY "sortOrder" ASC',
      [listingId]
    );
    
    console.log(`\n📸 Media count: ${mediaResult.rows.length}`);
    
    if (mediaResult.rows.length > 0) {
      console.log('\nMedia items:');
      mediaResult.rows.forEach((media, i) => {
        console.log(`${i + 1}. ${media.url} (${media.category}) - featured: ${media.isFeatured}`);
      });
    } else {
      console.log('\n❌ No media found for this listing');
      
      // Check if there are any media in the database at all
      const allMediaResult = await pool.query('SELECT COUNT(*) as count FROM "ListingMedia"');
      console.log(`Total media in database: ${allMediaResult.rows[0].count}`);
    }
    
    // Check AI results
    const aiResult = await pool.query(
      'SELECT * FROM "AIResult" WHERE "listingId" = $1',
      [listingId]
    );
    
    console.log(`\n🤖 AI Results: ${aiResult.rows.length > 0 ? 'Found' : 'Not found'}`);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkListingMedia();