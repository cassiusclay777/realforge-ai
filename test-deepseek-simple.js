// Jednoduchý test DeepSeek API
const OpenAI = require('openai');
require('dotenv').config({ path: '.env.local' });

async function testDeepSeekSimple() {
  console.log('🧪 Testing DeepSeek API with text input...');
  
  if (!process.env.DEEPSEEK_API_KEY) {
    console.log('⚠ Please add your DeepSeek API key to .env.local file:');
    console.log('   DEEPSEEK_API_KEY="sk-your-api-key-here"');
    console.log('   You can get it from: https://platform.deepseek.com/api-keys');
    return;
  }
  
  const deepseek = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com',
  });
  
  try {
    // Test 1: Simple text completion
    console.log('💬 Testing text completion...');
    const response = await deepseek.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { 
          role: 'system', 
          content: 'You are a real estate expert. Respond in Czech.' 
        },
        { 
          role: 'user', 
          content: 'Napiš krátký popis moderního bytu v Praze.' 
        }
      ],
      max_tokens: 100,
    });
    
    console.log('✅ Success! Response:');
    console.log(response.choices[0]?.message?.content);
    console.log('\n🎉 DeepSeek API is working correctly!');
    
  } catch (error) {
    console.error('❌ DeepSeek API error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testDeepSeekSimple();