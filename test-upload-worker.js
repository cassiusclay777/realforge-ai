const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

async function testUpload() {
  // Dynamically import fetch
  const { default: fetch } = await import('node-fetch');
  try {
    console.log('Testing upload flow with worker...');
    
    // Create a simple test ZIP file (empty)
    const testZipPath = path.join(__dirname, 'test-upload2.zip');
    if (!fs.existsSync(testZipPath)) {
      // Create empty zip file
      const zipContent = Buffer.from('PK\x05\x06\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00', 'binary');
      fs.writeFileSync(testZipPath, zipContent);
      console.log('Created test ZIP file');
    }
    
    // Create form data
    const formData = new FormData();
    formData.append('zipFile', fs.createReadStream(testZipPath), {
      filename: 'test-upload2.zip',
      contentType: 'application/zip'
    });
    formData.append('title', 'Test Upload with Worker');
    formData.append('address', 'Test Address 456');
    formData.append('type', 'APARTMENT');
    formData.append('price', '2000000');
    
    // Upload to API
    console.log('Uploading to /api/upload/zip...');
    const response = await fetch('http://localhost:3001/api/upload/zip', {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });
    
    console.log('Response status:', response.status);
    const responseData = await response.json();
    console.log('Response data:', JSON.stringify(responseData, null, 2));
    
    if (responseData.success && responseData.listingId) {
      console.log('\n✅ Upload successful!');
      console.log('Listing ID:', responseData.listingId);
      
      // Add job to queue
      console.log('\nAdding job to queue...');
      const queueRes = await fetch('http://localhost:3001/api/queue/process-zip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          listingId: responseData.listingId, 
          zipUrl: responseData.zipUrl 
        })
      });
      
      console.log('Queue response status:', queueRes.status);
      const queueData = await queueRes.json();
      console.log('Queue data:', JSON.stringify(queueData, null, 2));
      
      if (queueRes.ok) {
        console.log('\n✅ Job added to queue!');
        console.log('Worker should process it in 3 seconds and update status to "AKTIVNI"');
        
        // Wait for worker to process
        console.log('\nWaiting 5 seconds for worker to process...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Check listing status
        console.log('\nChecking listing status...');
        const statusRes = await fetch(`http://localhost:3001/api/process/zip/${responseData.listingId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        
        console.log('Status response:', statusRes.status);
        const statusData = await statusRes.json();
        console.log('Listing status:', statusData.listing?.status);
        
        if (statusData.listing?.status === 'AKTIVNI') {
          console.log('\n🎉 SUCCESS: Worker updated status to AKTIVNI!');
          console.log('Maminka uvidí "Upload úspěšný"!');
        } else {
          console.log('\n⚠️ Status is:', statusData.listing?.status, '(expected: AKTIVNI)');
        }
      }
      
      return responseData.listingId;
    } else {
      console.error('❌ Upload failed:', responseData.error);
      return null;
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    return null;
  }
}

testUpload();