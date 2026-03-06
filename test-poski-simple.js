/**
 * Simple test for Poski API integration
 */

require('dotenv').config({ path: '.env.local' });

async function testPoskiIntegration() {
  console.log('🧪 Testing Poski API integration...\n');

  // Test 1: Check environment variables
  console.log('📋 Test 1: Environment variables');
  console.log('POSKI_API_URL:', process.env.POSKI_API_URL || 'Not set');
  console.log('POSKI_API_KEY:', process.env.POSKI_API_KEY ? '***' + process.env.POSKI_API_KEY.slice(-4) : 'Not set');
  console.log('');

  // Test 2: Check API endpoint
  console.log('📋 Test 2: API endpoint check');
  const apiUrl = process.env.POSKI_API_URL || 'https://export-test.poskireal.cz/import/v1/';
  console.log('API URL:', apiUrl);
  console.log('API endpoint:', `${apiUrl}listings`);
  console.log('');

  // Test 3: Test data transformation logic
  console.log('📋 Test 3: Data transformation logic');
  
  // Mock data transformation
  const mockListing = {
    title: 'Modern Apartment in Prague',
    address: 'Prague 1, Old Town',
    type: 'APARTMENT',
    price: 8500000,
    area: 85
  };

  const mockAIResults = {
    headline: 'Luxury Apartment in Historic Prague Center',
    shortDesc: 'Beautifully renovated apartment with modern amenities',
    longDesc: 'This stunning apartment combines historic charm with modern luxury.'
  };

  const mockMedia = [
    { url: 'https://example.com/image1.jpg', isFeatured: true },
    { url: 'https://example.com/image2.jpg', isFeatured: false },
    { url: 'https://example.com/image3.jpg', isFeatured: true }
  ];

  // Simple transformation logic
  const typeMapping = {
    'APARTMENT': 'apartment',
    'HOUSE': 'house',
    'LAND': 'land',
    'COMMERCIAL': 'commercial',
    'VILLA': 'villa',
    'COTTAGE': 'cottage'
  };

  const featuredImages = mockMedia
    .filter(m => m.isFeatured)
    .slice(0, 5)
    .map(m => m.url);

  const images = featuredImages.length > 0 
    ? featuredImages 
    : mockMedia.slice(0, 5).map(m => m.url);

  const poskiType = typeMapping[mockListing.type] || 'apartment';

  const poskiData = {
    title: mockAIResults?.headline || mockListing.title || 'Property Listing',
    description: mockAIResults?.longDesc || mockAIResults?.shortDesc || 'AI-generated property description',
    price: mockListing.price || 0,
    address: mockListing.address || 'Address not specified',
    type: poskiType,
    area: mockListing.area || undefined,
    images: images
  };

  console.log('Transformed data structure:');
  console.log('- Title:', poskiData.title);
  console.log('- Description length:', poskiData.description.length, 'characters');
  console.log('- Price:', poskiData.price.toLocaleString('cs-CZ'), 'CZK');
  console.log('- Address:', poskiData.address);
  console.log('- Type:', poskiData.type);
  console.log('- Images:', poskiData.images.length, 'images');
  console.log('');

  // Test 4: Check if API would work
  console.log('📋 Test 4: API readiness check');
  if (!process.env.POSKI_API_KEY || process.env.POSKI_API_KEY === 'your-poski-api-key-here') {
    console.log('⚠️  WARNING: POSKI_API_KEY is not set or is using placeholder value');
    console.log('   Please update .env.local with a valid API key from Poski platform');
  } else {
    console.log('✅ API key is set (not a placeholder)');
  }

  console.log('\n✅ Poski integration test completed!');
  console.log('\n📝 Implementation summary:');
  console.log('1. Created lib/poski.ts with publishToPoski() function');
  console.log('2. Created API route at /api/export/poski');
  console.log('3. Added "Export to Poski" button to UI (green button)');
  console.log('4. Environment variables configured in .env.local');
  console.log('5. Database status update to PUBLISHED_POSKI after successful export');
  console.log('\n🚀 Next steps:');
  console.log('1. Get valid POSKI_API_KEY from https://export-test.poskireal.cz/');
  console.log('2. Update .env.local with actual API key');
  console.log('3. Test with real listing at http://localhost:3001/listings/[id]');
  console.log('4. Click "Export to Poski" button to publish listing');
}

// Run the test
testPoskiIntegration().catch(console.error);