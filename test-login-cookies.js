const fetch = require('node-fetch');

async function testLogin() {
  try {
    console.log('Testing login with cookies...');
    
    // First, get CSRF token with cookies
    const csrfResponse = await fetch('http://localhost:3001/api/auth/csrf');
    const cookies = csrfResponse.headers.get('set-cookie');
    console.log('Cookies from CSRF:', cookies);
    
    const csrfData = await csrfResponse.json();
    console.log('CSRF token:', csrfData.csrfToken);
    
    // Try to login with demo credentials, CSRF token, and cookies
    const formData = new URLSearchParams();
    formData.append('csrfToken', csrfData.csrfToken);
    formData.append('email', 'demo@realforge.ai');
    formData.append('password', 'demo');
    formData.append('redirect', 'false');
    formData.append('json', 'true');
    
    const loginResponse = await fetch('http://localhost:3001/api/auth/callback/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': cookies || '',
      },
      body: formData,
    });
    
    console.log('Login status:', loginResponse.status);
    console.log('Login headers:', Object.fromEntries(loginResponse.headers.entries()));
    
    const responseText = await loginResponse.text();
    console.log('Login response (first 500 chars):', responseText.substring(0, 500));
    
    if (loginResponse.ok) {
      console.log('✅ Login successful!');
    } else {
      console.log('❌ Login failed');
    }
    
  } catch (error) {
    console.error('❌ Error testing login:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Install node-fetch if needed
if (typeof fetch === 'undefined') {
  console.log('Please install node-fetch: npm install node-fetch');
} else {
  testLogin();
}