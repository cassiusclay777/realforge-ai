import fetch from 'node-fetch';

async function testAPI() {
  try {
    console.log('Testing API endpoint: http://localhost:3001/api/listings?limit=3');
    
    const response = await fetch('http://localhost:3001/api/listings?limit=3');
    const data: any = await response.json();
    
    console.log('Status:', response.status);
    console.log('Success:', data.success);
    console.log('Data length:', data.data?.length || 0);
    
    if (data.data && data.data.length > 0) {
      console.log('\nFirst listing:');
      const first = data.data[0];
      console.log('  ID:', first.id);
      console.log('  Title:', first.title);
      console.log('  Status:', first.status);
      console.log('  AI Status:', first.aiStatus);
      console.log('  Media count:', first.mediaCount);
      console.log('  Images:', first.images?.length || 0);
      console.log('  Media:', first.media?.length || 0);
    }
    
    console.log('\nStats:');
    console.log('  Total:', data.stats?.total);
    console.log('  Active:', data.stats?.active);
    console.log('  Pending:', data.stats?.pending);
    
  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

testAPI();