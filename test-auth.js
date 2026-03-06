const fetch = require('node-fetch');

async function testAuth() {
  try {
    console.log('Testing authentication...');
    
    // Test 1: Try to access login page
    console.log('\n1. Testing login page access...');
    const loginResponse = await fetch('http://localhost:3001/login');
    console.log(`Login page status: ${loginResponse.status}`);
    
    // Test 2: Try to register a user
    console.log('\n2. Testing user registration...');
    const registerResponse = await fetch('http://localhost:3001/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@realforge.ai',
        password: 'testpassword123'
      })
    });
    
    console.log(`Registration status: ${registerResponse.status}`);
    if (registerResponse.ok) {
      const data = await registerResponse.json();
      console.log('Registration successful:', data);
    } else {
      const errorText = await registerResponse.text();
      console.log('Registration failed:', errorText.substring(0, 200));
    }
    
    // Test 3: Try to login
    console.log('\n3. Testing user login...');
    const loginApiResponse = await fetch('http://localhost:3001/api/auth/callback/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@realforge.ai',
        password: 'testpassword123',
        redirect: false
      })
    });
    
    console.log(`Login API status: ${loginApiResponse.status}`);
    if (loginApiResponse.ok) {
      const data = await loginApiResponse.json();
      console.log('Login successful:', data);
    } else {
      const errorText = await loginApiResponse.text();
      console.log('Login failed:', errorText.substring(0, 200));
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAuth();