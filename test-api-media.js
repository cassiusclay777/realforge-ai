// Test API endpoint for listing media
async function testApiMedia() {
  console.log('Testing API endpoints...\n');
  
  // Test 1: Get all listings
  try {
    console.log('1. Testing GET /api/listings...');
    const listingsResponse = await fetch('http://localhost:3001/api/listings');
    console.log('   Status:', listingsResponse.status);
    
    if (listingsResponse.ok) {
      const listings = await listingsResponse.json();
      console.log(`   Found ${listings.length} listings`);
      
      if (listings.length > 0) {
        const firstListing = listings[0];
        console.log(`   First listing ID: ${firstListing.id}`);
        console.log(`   First listing title: ${firstListing.title}`);
        
        // Test 2: Get specific listing with media
        console.log('\n2. Testing GET /api/listings/[id]...');
        const listingResponse = await fetch(`http://localhost:3001/api/listings/${firstListing.id}`);
        console.log('   Status:', listingResponse.status);
        
        if (listingResponse.ok) {
          const listingDetail = await listingResponse.json();
          console.log(`   Listing status: ${listingDetail.status}`);
          console.log(`   Has media: ${listingDetail.media ? listingDetail.media.length : 0} items`);
          
          if (listingDetail.media && listingDetail.media.length > 0) {
            console.log('\n   Media URLs:');
            listingDetail.media.forEach((media, i) => {
              console.log(`   ${i + 1}. ${media.url}`);
            });
          } else {
            console.log('\n   ❌ No media in API response');
          }
        }
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
    console.log('\nMake sure Next.js server is running on port 3001');
  }
  
  // Test 3: Check if public/uploads directory exists
  console.log('\n3. Checking public/uploads directory...');
  const fs = require('fs');
  const path = require('path');
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  
  if (fs.existsSync(uploadsDir)) {
    const files = fs.readdirSync(uploadsDir);
    console.log(`   Uploads directory exists with ${files.length} items`);
    
    // List first 5 items
    files.slice(0, 5).forEach((file, i) => {
      const filePath = path.join(uploadsDir, file);
      const isDir = fs.statSync(filePath).isDirectory();
      console.log(`   ${i + 1}. ${file} ${isDir ? '(directory)' : ''}`);
    });
  } else {
    console.log('   ❌ Uploads directory does not exist');
  }
}

testApiMedia();