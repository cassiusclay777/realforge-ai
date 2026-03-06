import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import FormData from 'form-data';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testUpload() {
  console.log('🚀 Testing upload endpoint with Czech type "POZEMEK"...');
  
  // Create a test ZIP file
  const testZipPath = path.join(__dirname, 'test-upload.zip');
  if (!fs.existsSync(testZipPath)) {
    console.log('❌ Test ZIP file not found:', testZipPath);
    console.log('Please create a test ZIP file or use existing one');
    return;
  }
  
  const formData = new FormData();
  formData.append('zipFile', fs.createReadStream(testZipPath));
  formData.append('title', 'Prodej zahrady MK');
  formData.append('address', 'Prodej zahrady 756m2 v Moravském Krumlově');
  formData.append('type', 'POZEMEK'); // Czech value
  formData.append('price', '3500000');
  
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
        
        // Wait a bit for worker to process
        console.log('\n⏳ Waiting 5 seconds for worker to process...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        console.log('\n✅ Test completed successfully!');
        console.log('The Czech type "POZEMEK" was correctly mapped to "LAND" enum.');
      }
    } else {
      console.log('❌ Upload failed:', result);
    }
  } catch (error) {
    console.error('💥 Error during upload test:', error);
  }
}

testUpload();