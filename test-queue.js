const fetch = require('node-fetch');

async function testQueueEndpoint() {
  try {
    console.log('Testing /api/queue/process-zip endpoint...');
    
    const response = await fetch('http://localhost:3001/api/queue/process-zip', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        listingId: 'test-listing-id-123',
        zipUrl: 'http://example.com/test.zip'
      })
    });
    
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('✅ Queue endpoint works!');
    } else {
      console.log('❌ Queue endpoint failed');
    }
    
  } catch (error) {
    console.error('Error testing queue endpoint:', error.message);
  }
}

testQueueEndpoint();