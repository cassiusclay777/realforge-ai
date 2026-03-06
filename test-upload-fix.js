const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch');

async function testUpload() {
  try {
    // Najdeme nějaký malý ZIP soubor pro test
    const uploadsDir = path.join(__dirname, 'public', 'uploads');
    const files = fs.readdirSync(uploadsDir);
    const zipFile = files.find(f => f.endsWith('.zip') || f.endsWith('.7z'));
    
    if (!zipFile) {
      console.error('❌ No ZIP files found in uploads directory');
      return;
    }
    
    const filePath = path.join(uploadsDir, zipFile);
    const fileStats = fs.statSync(filePath);
    
    console.log(`📁 Testing with file: ${zipFile} (${(fileStats.size / 1024).toFixed(2)} KB)`);
    
    // Vytvoříme FormData
    const formData = new FormData();
    formData.append('zipFile', fs.createReadStream(filePath), {
      filename: zipFile,
      contentType: 'application/zip'
    });
    formData.append('title', 'Test Listing - Fixed Upload');
    formData.append('address', 'Test Address 123');
    formData.append('type', 'APARTMENT');
    formData.append('price', '5000000');
    formData.append('area', '75');
    formData.append('rooms', '3');
    
    // Odešleme request
    console.log('📤 Sending upload request...');
    const response = await fetch('http://localhost:3003/api/upload/zip', {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });
    
    const result = await response.json();
    
    console.log(`📥 Response status: ${response.status}`);
    console.log('📦 Response body:', JSON.stringify(result, null, 2));
    
    if (response.ok) {
      console.log('✅ Upload successful!');
      console.log(`📋 Listing ID: ${result.id}`);
      console.log(`🔗 ZIP URL: ${result.zipUrl}`);
    } else {
      console.error('❌ Upload failed!');
      console.error(`Error: ${result.error}`);
      console.error(`Details: ${result.details}`);
    }
    
  } catch (error) {
    console.error('💥 Test failed with error:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Spustíme test
testUpload();