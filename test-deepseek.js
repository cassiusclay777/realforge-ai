// Testovací skript pro DeepSeek API
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com',
});

async function testDeepSeek() {
  try {
    console.log('🧪 Testing DeepSeek API connection...');
    
    // Test 1: List models
    console.log('📋 Listing available models...');
    const models = await deepseek.models.list();
    console.log('Available models:', models.data.map(m => m.id));
    
    // Test 2: Simple text completion
    console.log('💬 Testing text completion...');
    const textResponse = await deepseek.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Hello, how are you?' }
      ],
      max_tokens: 50,
    });
    
    console.log('Text response:', textResponse.choices[0]?.message?.content);
    
    // Test 3: Test image analysis with text URL format
    if (process.env.DEEPSEEK_API_KEY) {
      console.log('🖼️ Testing image analysis with text URL format...');
      try {
        const testImageUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg';
        
        // DeepSeek nepodporuje image_url formát, používáme text s URL
        console.log('Testing text format with URL...');
        const response = await deepseek.chat.completions.create({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'user',
              content: `Analyze this image: ${testImageUrl}. What can you see in this image?`
            }
          ],
          max_tokens: 100,
        });
        console.log('Image analysis response:', response.choices[0]?.message?.content?.substring(0, 100) + '...');
      } catch (error) {
        console.log('Image analysis error:', error.message);
      }
    } else {
      console.log('⚠ No DEEPSEEK_API_KEY found, skipping image tests');
    }
    
    console.log('✅ DeepSeek API tests completed');
    
  } catch (error) {
    console.error('❌ DeepSeek test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testDeepSeek();