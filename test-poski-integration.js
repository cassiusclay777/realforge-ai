/**
 * Test Poski API integration
 */

const { publishToPoski, transformToPoskiFormat } = require('./lib/poski');

async function testPoskiIntegration() {
  console.log('🧪 Testing Poski API integration...\n');

  // Test 1: Check environment variables
  console.log('📋 Test 1: Environment variables');
  console.log('POSKI_API_URL:', process.env.POSKI_API_URL || 'Not set');
  console.log('POSKI_API_KEY:', process.env.POSKI_API_KEY ? '***' + process.env.POSKI_API_KEY.slice(-4) : 'Not set');
  console.log('');

  // Test 2: Test transformToPoskiFormat function
  console.log('📋 Test 2: Data transformation');
  const mockListing = {
    id: 'test-listing-123',
    title: 'Modern Apartment in Prague',
    address: 'Prague 1, Old Town',
    type: 'APARTMENT',
    price: 8500000,
    area: 85,
    status: 'COMPLETED'
  };

  const mockAIResults = {
    headline: 'Luxury Apartment in Historic Prague Center',
    shortDesc: 'Beautifully renovated apartment with modern amenities',
    longDesc: 'This stunning apartment combines historic charm with modern luxury. Located in the heart of Prague\'s Old Town, it features high ceilings, original details, and a fully equipped kitchen.',
    bulletPoints: ['Historic building', 'Modern renovation', 'Central location', 'High ceilings'],
    priceSuggestion: 8700000
  };

  const mockMedia = [
    { id: 'img1', url: 'https://example.com/image1.jpg', isFeatured: true, processingStatus: 'DONE' },
    { id: 'img2', url: 'https://example.com/image2.jpg', isFeatured: false, processingStatus: 'DONE' },
    { id: 'img3', url: 'https://example.com/image3.jpg', isFeatured: true, processingStatus: 'DONE' }
  ];

  const poskiData = transformToPoskiFormat(mockListing, mockAIResults, mockMedia);
  console.log('Transformed data:', JSON.stringify(poskiData, null, 2));
  console.log('');

  // Test 3: Test API call (if API key is set)
  if (process.env.POSKI_API_KEY && process.env.POSKI_API_KEY !== 'your-poski-api-key-here') {
    console.log('📋 Test 3: API call (will fail without valid credentials)');
    try {
      const result = await publishToPoski(poskiData);
      console.log('API Response:', JSON.stringify(result, null, 2));
      
      if (result.success) {
        console.log('✅ API call successful!');
      } else {
        console.log('⚠️ API call failed (expected without valid credentials):', result.message);
      }
    } catch (error) {
      console.log('⚠️ API call error (expected):', error.message);
    }
  } else {
    console.log('📋 Test 3: Skipping API call (no valid API key)');
    console.log('⚠️ Please set POSKI_API_KEY in .env.local to test actual API integration');
  }

  console.log('\n✅ Poski integration test completed!');
  console.log('\n📝 Next steps:');
  console.log('1. Get a valid POSKI_API_KEY from Poski platform');
  console.log('2. Update .env.local with the actual API key');
  console.log('3. Test the UI by clicking "Export to Poski" button on a listing page');
  console.log('4. The API endpoint is available at: http://localhost:3001/api/export/poski');
}

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Run the test
testPoskiIntegration().catch(console.error);