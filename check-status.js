const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://realforge:realforge_password@localhost:5432/realforge_ai'
});

async function checkStatus() {
  try {
    const result = await pool.query('SELECT DISTINCT status FROM "Listing"');
    console.log('Unique status values in database:');
    result.rows.forEach(row => {
      console.log('  -', row.status);
    });
    
    // Check our test listing
    const testResult = await pool.query('SELECT status FROM "Listing" WHERE id = $1', ['72bfb887-391c-47d9-9181-cf6b3ed9b534']);
    console.log('\nTest listing status:', testResult.rows[0]?.status);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkStatus();