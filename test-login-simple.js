const fetch = require('node-fetch');

async function testLogin() {
  try {
    console.log('Testing login with demo credentials...');
    
    // First, get the login page to check CSRF token
    const loginPageResponse = await fetch('http://localhost:3000/api/auth/csrf');
    const csrfData = await loginPageResponse.json();
    console.log('CSRF token:', csrfData.csrfToken);
    
    // Try to login with demo credentials
    const loginResponse = await fetch('http://localhost:3000/api/auth/callback/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        csrfToken: csrfData.csrfToken,
        email: 'demo@realforge.ai',
        password: 'demo',
        json: 'true'
      }),
    });
    
    const result = await loginResponse.json();
    console.log('Login response:', JSON.stringify(result, null, 2));
    
    if (loginResponse.ok) {
      console.log('✅ Login successful!');
      console.log('User:', result.user);
    } else {
      console.log('❌ Login failed');
      console.log('Error:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Error testing login:', error.message);
  }
}

testLogin();