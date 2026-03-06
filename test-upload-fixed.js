import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import FormData from 'form-data';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testUpload() {
  console.log('🚀 Testing upload endpoint...');
  
  // Create a test ZIP file
  const testZipPath = path.join(__dirname, 'test-upload.zip');
  if (!fs.existsSync(testZipPath)) {
    console.log('❌ Test ZIP file not found:', testZipPath);
    console.log('Please create a test ZIP file or use existing one');
    return;
  }
  
  const formData = new FormData();
  formData.append('zipFile', fs.createReadStream(testZipPath));
  formData.append('title', 'Test Listing - Fixed');
  formData.append('address', 'Test Address 123');
  formData.append('type', 'APARTMENT'); // Must be APARTMENT, HOUSE, or LAND
  formData.append('price', '2500000');
  
  try {
    const response = await fetch('http://localhost:3001/api/upload/zip', {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Upload successful!');
      console.log('Result:', JSON.stringify(result, null, 2));
      
      if (result.listingId) {
        console.log(`\n📋 Listing created with ID: ${result.listingId}`);
        console.log(`🔗 Check listing at: http://localhost:3001/listings/${result.listingId}`);
        console.log(`📦 ZIP URL: ${result.zipUrl}`);
        
        // Wait a bit for worker to process
        console.log('\n⏳ Waiting 5 seconds for worker to process...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Check if listing was updated by worker
        const checkResponse = await fetch(`http://localhost:3001/api/listings/${result.listingId}`);
        if (checkResponse.ok) {
          const listing = await checkResponse.json();
          console.log('\n📊 Listing status:', listing.status);
          console.log('📸 Media count:', listing.media?.length || 0);
        }
      }
    } else {
      console.log('❌ Upload failed:', result);
    }
  } catch (error) {
    console.error('💥 Error during upload test:', error);
  }
}

testUpload();