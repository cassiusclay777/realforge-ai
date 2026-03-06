const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://realforge:realforge_password@localhost:5432/realforge_ai'
});

async function checkListing() {
  try {
    // Check specific UUID
    const result = await pool.query('SELECT * FROM "Listing" WHERE id = $1', ['068a36a7-b527-4709-815a-33860ac2939f']);
    console.log('Listing found:', result.rows.length > 0);
    if (result.rows.length > 0) {
      console.log('Listing details:', result.rows[0]);
    } else {
      console.log('Listing not found in database');
    }
    
    // Check all listings
    const allResult = await pool.query('SELECT id, title, "createdAt" FROM "Listing" ORDER BY "createdAt" DESC LIMIT 5');
    console.log('\nLast 5 listings:');
    allResult.rows.forEach((row, i) => {
      console.log(`${i + 1}. ID: ${row.id}, Title: ${row.title}, Created: ${row.createdAt}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkListing();