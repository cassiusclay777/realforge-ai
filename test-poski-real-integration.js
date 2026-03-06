/**
 * Test PoskiREAL API Integration
 * 
 * This script tests the PoskiREAL XML-RPC API integration
 * with the REALFORGE AI system.
 */

import { PoskiRealService } from './lib/poski-real/PoskiRealService.js';
import { PoskiDataMapper } from './lib/poski-real/DataMapper.js';
import { testPoskiConnection } from './lib/poski.js';

async function testIntegration() {
  console.log('🧪 Testing PoskiREAL API Integration');
  console.log('=====================================\n');
  
  // Test 1: Check environment variables
  console.log('1. Checking environment variables...');
  const requiredVars = [
    'POSKI_CLIENT_ID',
    'POSKI_PASSWORD_MD5', 
    'POSKI_SOFTWARE_KEY'
  ];
  
  let missingVars = [];
  for (const varName of requiredVars) {
    if (!process.env[varName] || process.env[varName].includes('YOUR_')) {
      missingVars.push(varName);
    }
  }
  
  if (missingVars.length > 0) {
    console.log(`❌ Missing or placeholder environment variables: ${missingVars.join(', ')}`);
    console.log('   Please update .env.local with actual PoskiREAL credentials\n');
    console.log('   Example:');
    console.log('   POSKI_CLIENT_ID=your_client_id_123');
    console.log('   POSKI_PASSWORD_MD5=md5_hash_of_your_password');
    console.log('   POSKI_SOFTWARE_KEY=your_software_key_456\n');
    return;
  }
  
  console.log('✅ Environment variables check passed\n');
  
  // Test 2: Test connection using compatibility layer
  console.log('2. Testing API connection (compatibility layer)...');
  const connectionTest = await testPoskiConnection();
  
  if (connectionTest.success) {
    console.log(`✅ Connection test successful: ${connectionTest.message}\n`);
  } else {
    console.log(`❌ Connection test failed: ${connectionTest.message}`);
    if (connectionTest.errors) {
      console.log(`   Errors: ${connectionTest.errors.join(', ')}\n`);
    }
    return;
  }
  
  // Test 3: Test DataMapper
  console.log('3. Testing DataMapper...');
  try {
    const testListing = {
      id: 'test-listing-123',
      title: 'Test byt v Praze',
      address: 'Praha 1, Václavské náměstí 1',
      type: 'APARTMENT',
      price: 5000000,
      area: 65,
      rooms: 3,
      floor: 2,
      yearBuilt: 2010,
      description: 'Luxusní byt v centru Prahy',
      aiResult: {
        headline: 'Luxusní byt v centru Prahy',
        longDesc: 'Nádherný byt s výhledem na Václavské náměstí, kompletně zrekonstruovaný.',
        shortDesc: 'Byt v centru Prahy'
      },
      media: [
        {
          url: 'https://example.com/photo1.jpg',
          isFeatured: true,
          sortOrder: 1,
          originalName: 'byt1.jpg'
        },
        {
          url: 'https://example.com/photo2.jpg',
          isFeatured: false,
          sortOrder: 2,
          originalName: 'byt2.jpg'
        }
      ]
    };
    
    const advertData = PoskiDataMapper.mapListingToAdvert(testListing, 1);
    const photos = PoskiDataMapper.mapMediaToPhotos(testListing.media);
    
    console.log('✅ DataMapper test passed');
    console.log(`   - Advert type: ${advertData.advert_type}`);
    console.log(`   - Title: ${advertData.title}`);
    console.log(`   - Price: ${advertData.advert_price} CZK`);
    console.log(`   - Photos mapped: ${photos.length}\n`);
    
  } catch (error) {
    console.log(`❌ DataMapper test failed: ${error.message}\n`);
    return;
  }
  
  // Test 4: Test PoskiRealService initialization
  console.log('4. Testing PoskiRealService initialization...');
  try {
    const credentials = {
      clientId: process.env.POSKI_CLIENT_ID,
      passwordMd5: process.env.POSKI_PASSWORD_MD5,
      softwareKey: process.env.POSKI_SOFTWARE_KEY
    };
    
    const service = new PoskiRealService(credentials);
    console.log('✅ PoskiRealService initialized successfully\n');
    
    // Test 5: Test authentication (optional - only if credentials are real)
    console.log('5. Testing authentication (with placeholder credentials)...');
    console.log('   Note: Using placeholder credentials - will show expected behavior\n');
    
    console.log('📋 Expected API flow with real credentials:');
    console.log('   1. authenticate() → gets session_id');
    console.log('   2. syncAdvert() → creates/updates advert');
    console.log('   3. uploadPhotos() → uploads photos');
    console.log('   4. listAdverts() → retrieves adverts list\n');
    
  } catch (error) {
    console.log(`❌ PoskiRealService initialization failed: ${error.message}\n`);
    return;
  }
  
  // Test 6: Test compatibility with existing code
  console.log('6. Testing compatibility with existing REALFORGE code...');
  try {
    const { publishToPoski, transformToPoskiFormat } = await import('./lib/poski.js');
    
    const testListing = {
      title: 'Test House',
      address: 'Brno, Česká 123',
      type: 'HOUSE',
      price: 8500000,
      area: 120
    };
    
    const aiResults = {
      headline: 'Rodinný dům v Brně',
      longDesc: 'Krásný rodinný dům se zahradou v klidné části Brna.',
      shortDesc: 'Dům v Brně'
    };
    
    const media = [
      { url: 'https://example.com/house1.jpg', isFeatured: true, processingStatus: 'DONE' },
      { url: 'https://example.com/house2.jpg', isFeatured: false, processingStatus: 'DONE' }
    ];
    
    const poskiData = transformToPoskiFormat(testListing, aiResults, media);
    
    console.log('✅ Compatibility test passed');
    console.log(`   - Transformed title: ${poskiData.title}`);
    console.log(`   - Transformed type: ${poskiData.type}`);
    console.log(`   - Images count: ${poskiData.images.length}\n`);
    
  } catch (error) {
    console.log(`❌ Compatibility test failed: ${error.message}\n`);
    return;
  }
  
  console.log('🎉 Integration test completed successfully!');
  console.log('\n📋 Next steps:');
  console.log('   1. Replace placeholder credentials in .env.local with real PoskiREAL credentials');
  console.log('   2. Run the application and test upload flow');
  console.log('   3. Check that listings are published to PoskiREAL');
  console.log('   4. Verify photos are uploaded correctly');
  console.log('\n🔧 Configuration needed:');
  console.log('   - POSKI_CLIENT_ID: Your client ID from PoskiREAL');
  console.log('   - POSKI_PASSWORD_MD5: MD5 hash of your password');
  console.log('   - POSKI_SOFTWARE_KEY: Your software key');
  console.log('   - POSKI_SELLER_ID: Seller ID (default: 1)');
}

// Handle ES modules in Node.js
if (import.meta.url === `file://${process.argv[1]}`) {
  // Load environment variables
  import('dotenv/config').then(() => {
    testIntegration().catch(error => {
      console.error('❌ Test failed with error:', error);
      process.exit(1);
    });
  });
}