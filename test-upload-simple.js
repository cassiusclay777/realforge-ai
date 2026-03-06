const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

async function testUpload() {
  // Dynamically import fetch
  const { default: fetch } = await import('node-fetch');
  try {
    console.log('Testing upload flow...');
    
    // Create a simple test ZIP file (empty)
    const testZipPath = path.join(__dirname, 'test-upload.zip');
    if (!fs.existsSync(testZipPath)) {
      // Create empty zip file
      const zipContent = Buffer.from('PK\x05\x06\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00', 'binary');
      fs.writeFileSync(testZipPath, zipContent);
      console.log('Created test ZIP file');
    }
    
    // Create form data
    const formData = new FormData();
    formData.append('zipFile', fs.createReadStream(testZipPath), {
      filename: 'test-upload.zip',
      contentType: 'application/zip'
    });
    formData.append('title', 'Test Upload Listing');
    formData.append('address', 'Test Address 123');
    formData.append('type', 'APARTMENT');
    formData.append('price', '1000000');
    
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
      console.log('ZIP URL:', responseData.zipUrl);
      
      // Test the process endpoint
      console.log('\nTesting process endpoint...');
      const processResponse = await fetch(`http://localhost:3001/api/process/zip/${responseData.listingId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log('Process endpoint status:', processResponse.status);
      const processData = await processResponse.json();
      console.log('Process data:', JSON.stringify(processData, null, 2));
      
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