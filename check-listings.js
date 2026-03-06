const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'realforge_ai',
  user: 'realforge',
  password: 'realforge_password'
});

async function getListings() {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT id, title, status, "createdAt" FROM "Listing" ORDER BY "createdAt" DESC');
    console.log('Total listings:', result.rows.length);
    result.rows.forEach((row, i) => {
      console.log(`${i+1}. ID: ${row.id}`);
      console.log(`   Title: ${row.title}`);
      console.log(`   Status: ${row.status}`);
      console.log(`   Created: ${row.createdAt}`);
      console.log('');
    });
  } finally {
    client.release();
    await pool.end();
  }
}

getListings().catch(console.error);